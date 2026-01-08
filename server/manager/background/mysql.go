package background

import (
	"context"
	"fmt"
	"net"
	"next-dbm/server/common"
	"next-dbm/server/model"
	"next-dbm/server/repository"
	"next-dbm/server/utils"
	"time"

	"next-dbm/server/log"

	"github.com/go-mysql-org/go-mysql/client"
	"github.com/go-mysql-org/go-mysql/mysql"
	"go.uber.org/zap"
	"golang.org/x/crypto/ssh"
)

// var mysqlBackground *MysqlBackground

type MysqlBackground struct {
	dataSource  CoreDataSource
	sshConfig   SSHConfig
	mysqlClient *client.Conn
}

type CoreDataSource struct {
	ID        uint   `gorm:"primary_key;AUTO_INCREMENT" json:"id"`
	IDC       string `gorm:"type:varchar(50);not null" json:"idc"`
	Source    string `gorm:"type:varchar(50);not null" json:"source"`
	IP        string `gorm:"type:varchar(200);not null" json:"ip"`
	Port      int    `gorm:"type:int(10);not null" json:"port"`
	Username  string `gorm:"type:varchar(50);not null" json:"username"`
	Password  string `gorm:"type:varchar(150);not null" json:"password"`
	IsQuery   int    `gorm:"type:tinyint(2);not null" json:"is_query"` // 0写 1读 2读写
	ProxyIP   string `gorm:"type:varchar(200);not null" json:"proxy_ip"`
	ProxyPort int    `gorm:"type:int(10);not null" json:"proxy_port"`
}
type SSHConfig struct {
	Host       string
	Port       int
	User       string
	Password   string
	PrivateKey string // 可选：私钥路径
	Passphrase string // 可选：私钥密码
}

type SSHDialer struct {
	sshClient *ssh.Client
}

// var mysqlBackground = &MysqlBackground{}

//	func InitMysql() {
//		mysqlBackground = &MysqlBackground{}
//	}
func (d *SSHDialer) DialerFunc() func(ctx context.Context, network, addr string) (net.Conn, error) {
	return func(ctx context.Context, network, addr string) (net.Conn, error) {
		log.Info("Dialing MySQL server at via SSH tunnel", zap.Any("addr", addr))
		// return d.sshClient.Dial(network, addr)
		conn, err := d.sshClient.Dial(network, addr)
		if err != nil {
			return nil, fmt.Errorf(" ## failed to dial MySQL via SSH tunnel: %w", err)
		}

		return conn, nil
	}
}

// Handle individual connections
func (mp *MysqlBackground) HandleConnection(assetId string) error {
	defer func() {
		if r := recover(); r != nil {
			// 捕获 panic 错误并记录
			log.Error("Recovered from panic: ", zap.Any("r", r))
			// 恢复程序正常执行
		}
	}()

	// todo 查询冗余需要优化
	assert, err := repository.AssetRepository.FindById(context.Background(), assetId)
	if err != nil {
		log.Error("Failed to find assert:", zap.Error(err))
		return err
	}
	assertDecrypt, _ := repository.AssetRepository.FindByIdAndDecrypt(context.Background(), assert.ID)

	// 开启ssh隧道
	if assert.AccessGatewayId != "" && assert.AccessGatewayId != "-" {
		log.Info("检查是否启动ssh隧道")
		gateway, err := repository.GatewayRepository.FindById(context.Background(), assert.AccessGatewayId)
		if err != nil {
			log.Error("Failed to find gateway:", zap.Error(err))
			return err
		}

		mp.sshConfig = SSHConfig{
			Host:       gateway.IP,
			Password:   gateway.Password,
			Port:       gateway.Port,
			User:       gateway.Username,
			PrivateKey: gateway.PrivateKey,
			Passphrase: gateway.Passphrase,
		}
	} else {
		mp.sshConfig = SSHConfig{}
	}

	mp.dataSource = CoreDataSource{
		Username: assert.Username,
		Password: assertDecrypt.Password,
		IP:       assert.IP,
		Port:     assert.Port,
	}

	log.Info("### mp.sshConfig ", zap.Any("mp.sshConfig", mp.sshConfig))
	log.Info("### mp.dataSource ", zap.Any("mp.dataSource", mp.dataSource))
	if mp.sshConfig != (SSHConfig{}) {
		// 开启ssh隧道
		log.Info("开启ssh隧道")
		mp.mysqlClient, err = mp.createMysqlClientUseSocks()
		if err != nil {
			log.Error("Failed to create MySQL client:", zap.Error(err))
			return err
		}
	} else {
		// 不开启ssh隧道
		log.Info("端口直连隧道")
		mp.mysqlClient, err = mp.createMysqlClient()
		if err != nil {
			log.Error("Failed to create MySQL client:", zap.Error(err))
			return err
		}
	}
	return nil
}

// Process client commands
func (mp *MysqlBackground) ProcessCommand(session *model.Session, database string, cmddata string) (*mysql.Result, error) {
	defer func() {
		if r := recover(); r != nil {
			// 捕获 panic 错误并记录
			log.Error("Recovered from panic: ", zap.Any("r", r))
			// 恢复程序正常执行
		}
	}()

	sqlLogObj := &model.SqlLog{
		ID:         utils.UUID(),
		Owner:      session.Creator,
		AssetId:    session.AssetId,
		SqlCommand: cmddata,
		Created:    common.NowJsonTime(),
		SessionId:  session.ID,
	}

	err := mp.mysqlClient.UseDB(database)
	if err != nil {
		log.Error("Error using database: ", zap.Any("err", err.Error()))
		return nil, err
	}

	v, err := mp.mysqlClient.Execute(cmddata)
	if err != nil {
		sqlLogObj.State = "0"
		sqlLogObj.Reason = fmt.Sprintf("触发器处理 %s", err.Error())
		if err = repository.SqlLogRepository.Create(context.Background(), sqlLogObj); err != nil {
			log.Error("sqlLog", zap.Error(err))
		}
		return nil, err
	} else {
		sqlLogObj.State = "1"
		sqlLogObj.Reason = fmt.Sprintf("触发器处理 %s", "成功")
		if err = repository.SqlLogRepository.Create(context.Background(), sqlLogObj); err != nil {
			log.Error("sqlLog", zap.Error(err))
			return nil, err
		}

	}
	return v, nil
}

func (mp *MysqlBackground) createMysqlClientUseSocks() (*client.Conn, error) {
	dsn := mp.dataSource
	sshConf := mp.sshConfig
	var authMethod ssh.AuthMethod

	// 配置 SSH 客户端
	var err error
	if sshConf.PrivateKey != "" {
		var key ssh.Signer
		if len(sshConf.Passphrase) > 0 {
			key, err = ssh.ParsePrivateKeyWithPassphrase([]byte(sshConf.PrivateKey), []byte(sshConf.Passphrase))
			if err != nil {
				return nil, err
			}
		} else {
			key, err = ssh.ParsePrivateKey([]byte(sshConf.PrivateKey))
			if err != nil {
				return nil, err
			}
		}
		authMethod = ssh.PublicKeys(key)
	} else {
		authMethod = ssh.Password(sshConf.Password)
	}

	sshClientConfig := &ssh.ClientConfig{
		Timeout:         30 * time.Second,
		User:            sshConf.User,
		Auth:            []ssh.AuthMethod{authMethod},
		HostKeyCallback: ssh.InsecureIgnoreHostKey(),
	}

	// 连接到 SSH 服务器
	sshAddress := fmt.Sprintf("%s:%d", sshConf.Host, sshConf.Port)
	log.Info("Connecting to SSH server at ", zap.Any("sshAddress", sshAddress))
	sshClient, err := ssh.Dial("tcp", sshAddress, sshClientConfig)
	if err != nil {
		log.Error("Error connecting to SSH server: ", zap.Error(err))
		return nil, err
	}

	// defer sshClient.Close()

	// 创建到 MySQL 的连接
	mysqlAddress := fmt.Sprintf("%s:%d", dsn.IP, dsn.Port)
	log.Info("Attempting to connect to MySQL at  via SSH tunnel", zap.Any("mysqlAddress", mysqlAddress))

	// 创建自定义的 Dialer
	sshDialer := &SSHDialer{sshClient: sshClient}
	dialerFunc := sshDialer.DialerFunc()

	clientConn, err := client.ConnectWithDialer(context.Background(), "tcp", mysqlAddress, dsn.Username, dsn.Password, "", dialerFunc)
	if err != nil {
		log.Error("Error connecting to MySQL through SSH: ", zap.String("err", err.Error()))
		return nil, err
	}

	if err = clientConn.Ping(); err != nil {
		log.Error("Error pinging MySQL: ", zap.String("err", err.Error()))
		return nil, err
	}

	log.Info("Successfully connected to MySQL via SSH")
	return clientConn, nil
}
func (mp *MysqlBackground) createMysqlClient() (*client.Conn, error) {
	dsn := mp.dataSource
	for {
		client, err := client.Connect(fmt.Sprintf("%s:%d", dsn.IP, dsn.Port), dsn.Username, dsn.Password, "")
		if err != nil {
			log.Error("Error connecting to MySQL: ", zap.String("err", err.Error()))
			time.Sleep(10 * time.Second)
			continue
		}
		if err = client.Ping(); err != nil {
			log.Error("Error pinging MySQL: ", zap.String("err", err.Error()))
			continue
		}
		return client, nil
	}
}

func (mp *MysqlBackground) Close() {
	if mp.mysqlClient != nil {
		mp.mysqlClient.Close()
	}
	log.Info("mysql background close.")
}
