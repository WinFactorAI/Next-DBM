package proxy

import (
	"context"
	"fmt"

	"net"
	"strconv"
	"strings"

	"next-dbm/server/common"
	"next-dbm/server/common/nd"

	"next-dbm/server/model"
	lib "next-dbm/server/proxy/lib"
	proxy_mysql "next-dbm/server/proxy/lib/mysql"
	"next-dbm/server/repository"
	"next-dbm/server/utils"
	"sync"
	"syscall"
	"time"

	"github.com/go-mysql-org/go-mysql/client"
	"github.com/go-mysql-org/go-mysql/mysql"
	"github.com/go-mysql-org/go-mysql/server"
	_ "github.com/go-sql-driver/mysql"
	"github.com/pingcap/errors"

	"next-dbm/server/log"

	"github.com/siddontang/go/hack"
	"go.uber.org/zap"
	"golang.org/x/crypto/ssh"
)

type MariaDBProxy struct {
	listener     net.Listener
	connManager  sync.WaitGroup
	connections  map[string]net.Conn
	cancelFunc   context.CancelFunc
	authProvider *lib.InMemoryProvider
	dataSource   CoreDataSource
	sshConfig    SSHConfig
	port         string
	mu           sync.Mutex
	userCount    int64
}

var mariaDBServer *MariaDBProxy = nil

func NewMariaDBProxy(port string) *MariaDBProxy {
	mariaDBServer = &MariaDBProxy{
		authProvider: &lib.InMemoryProvider{},
		port:         port,
		userCount:    0,
	}
	return mariaDBServer
}
func GetMariaDBProxy(dataSource CoreDataSource) *MariaDBProxy {
	return mariaDBServer
}
func StartMariaDBProxy(port string) (bool, error) {
	ps := NewMariaDBProxy(port)
	if ps == nil {
		return false, fmt.Errorf("failed to create MySQL proxy instance")
	}
	ps.InitAuth()
	err := ps.Start()
	if err != nil {
		log.Error("Start MariaDBProxy error", zap.Any("error", err))
		return false, err
	}
	fmt.Printf("\t mariaDB proxy server started on %v\n", port)
	ProxyUpdateServer("MariaDB", ps)
	return true, nil
}

func StatusMariaDBProxy() bool {
	return mariaDBServer != nil && mariaDBServer.listener != nil
}
func StopMariaDBProxy() {
	mariaDBServer.Stop()
	ProxyUpdateServer("MariaDB", nil)
}
func StopMariaDBProxyBySessionId(sessionId string) {
	mariaDBServer.CloseConnection(sessionId)
}
func (mp *MariaDBProxy) ReloadMariaDBProxy() {
	mp.InitAuth()
}
func (mp *MariaDBProxy) UserCount() int64 {
	return mp.userCount
}
func (mp *MariaDBProxy) CheckUserName(username string) (bool, error) {
	return mp.authProvider.CheckUsername(username)
}
func (mp *MariaDBProxy) CloseConnection(sessionId string) error {

	conn, exists := mp.connections[sessionId]
	if exists {
		delete(mp.connections, sessionId) // 从映射中移除
	}

	if !exists {
		log.Error("connection for user  not found", zap.Any("sessionId", sessionId))
		return nil
	}

	if err := conn.Close(); err != nil {
		log.Error("failed to close connection for user : ", zap.Any("sessionId", sessionId), zap.Error(err))
		return err
	}

	log.Info("Connection for user closed.", zap.Any("sessionId", sessionId))
	return nil
}

func (mp *MariaDBProxy) CheckLicense(c *server.Conn, user model.User, clientIP string) error {
	// 判断是否超出最大连接数
	log.Info("判断是否超出最大连接数 当前连接数 ", zap.Any("len(mp.connections)", len(mp.connections)))
	if len(mp.connections) > 3 {
		log.Error(" License is out of user count  max 3 ")
		// 插入操作日志
		repository.OperLogRepository.Create(context.Background(), &model.OperLog{
			ID:       utils.UUID(),
			State:    "0",
			Reason:   "License is out of user count max 3",
			Username: user.Username,
			Name:     nd.Proxy + "MariaDB",
			ClientIP: clientIP,
		})

		if c != nil {
			errFromat := fmt.Sprintf("Next-DBM Error : %s", "License is out of user count max 3")
			errToErrors := errors.New(errFromat)
			c.WriteValue(errors.Trace(errToErrors))
		}

		return fmt.Errorf("License is out of user count max 3")
	}
	return nil
}

// Initialize authentication provider
func (mp *MariaDBProxy) InitAuth() {
	// mp.authProvider.AddUser("root", "root")
	log.Info("MariaDBProxy Authentication provider load users.")
	mp.authProvider.RemoveAllUser()
	var userCount = int64(0)
	proxyAuths, _ := repository.AuthorisedRepository.FindAllUsersAssetsProxyAuth(context.Background(), nd.MariaDB)
	for _, auth := range proxyAuths {

		if auth.ProxyAuth == "" {
			log.Info("MariaDBProxy Proxy User password is empty : ", zap.Any("username", auth.Username))
			continue
		}
		password, err := utils.Passwder.Decrypt(auth.ProxyAuth)
		if err != nil {
			log.Fatal("Decrypt password error")
			continue
		}
		userCount++
		mp.authProvider.AddUser(auth.Username, password)
		log.Info("MariaDBProxy add Proxy User : ", zap.Any("username", auth.Username))
	}
	mp.userCount = userCount

	log.Info("MariaDBProxy add Proxy Users count :", zap.Any("userCount", userCount))
}

func (mp *MariaDBProxy) AddConnection(sessionID string, conn net.Conn) {
	mp.mu.Lock()
	defer mp.mu.Unlock()
	mp.connections[sessionID] = conn
}

func (mp *MariaDBProxy) RemoveConnection(sessionID string) {
	mp.mu.Lock()
	defer mp.mu.Unlock()
	delete(mp.connections, sessionID)
}

// Start the MariaDB proxy server
func (mp *MariaDBProxy) Start() error {
	// addr := "localhost:" + mp.port
	addr := "0.0.0.0:" + mp.port
	lc := net.ListenConfig{
		Control: func(network, address string, c syscall.RawConn) error {
			return c.Control(func(fd uintptr) {
				syscall.SetsockoptInt(int(fd), syscall.SOL_SOCKET, syscall.SO_REUSEADDR, 1)
			})
		},
	}

	listener, err := lc.Listen(context.Background(), "tcp", addr)
	if err != nil {
		log.Fatal("Failed to listen:", zap.Error(err))
		return err
	}
	mp.listener = listener
	log.Info("Proxy server is running on " + addr)

	// Create context for managing connections
	ctx, cancel := context.WithCancel(context.Background())
	mp.cancelFunc = cancel
	mp.connections = make(map[string]net.Conn)

	go mp.acceptConnections(ctx)
	return nil
}

// Accept incoming connections
func (mp *MariaDBProxy) acceptConnections(ctx context.Context) {
	defer func() {
		if r := recover(); r != nil {
			log.Info("Recovered in acceptConnections:", zap.Any("r", r))
		}
	}()

	for {
		conn, err := mp.listener.Accept()
		if err != nil {
			if ctx.Err() != nil {
				log.Error("Listener closed.")
				return
			}
			log.Error("Failed to accept connection:", zap.Error(err))
			continue
		}

		remoteIP := getRemoteIP(conn)
		allowed, reason := allowIP(remoteIP)
		if !allowed {
			log.Warn("TCP connection rejected",
				zap.String("ip", remoteIP),
			)

			if reason != "" {
				_, _ = conn.Write([]byte(reason))
			}
			_ = conn.Close()
			continue
		}

		port, err := strconv.Atoi(mp.port)
		if err != nil {
			// 处理错误
			log.Error("Failed to parse port:", zap.Error(err))
		}
		mp.connManager.Add(1)
		session := &model.Session{
			ID:            utils.UUID(),
			IP:            conn.RemoteAddr().String(),
			Port:          port,
			ClientIP:      conn.RemoteAddr().String(),
			Password:      "-",
			Mode:          nd.Proxy,
			Status:        nd.Connecting,
			ConnectedTime: common.NowJsonTime(),
			Protocol:      "MariaDB",
			ConnectionId:  "-",
		}
		if err := repository.SessionRepository.Create(context.Background(), session); err != nil {
			return
		}

		log.Info("New connection :", zap.Any("conn.RemoteAddr().String()", conn.RemoteAddr().String()))
		log.Info("New connection from: ", zap.Any("session.ID", session.ID))
		// mp.connections[session.ID] = conn
		mp.AddConnection(session.ID, conn)
		go func(conn net.Conn, session *model.Session) {
			err := mp.handleConnection(conn, session)
			if err != nil {
				log.Error("Error handling connection:", zap.Error(err))

				// 绘画结束更新状态
				session.Status = nd.Disconnected
				session.DisconnectedTime = common.NowJsonTime()
				session.Message = err.Error()
				if err := repository.SessionRepository.UpdateById(context.Background(), session, session.ID); err != nil {
					log.Error("session", zap.Error(err))
				}
				sqlLogObj := &model.SqlLog{
					ID:         utils.UUID(),
					Owner:      session.Creator,
					AssetId:    session.AssetId,
					SqlCommand: err.Error(),
					Created:    common.NowJsonTime(),
					SessionId:  session.ID,
				}
				sqlLogObj.State = "0"
				sqlLogObj.Reason = "远程连接失败"
				if err := repository.SqlLogRepository.Create(context.Background(), sqlLogObj); err != nil {
					log.Error("sqlLog", zap.Error(err))
				}
				mp.RemoveConnection(session.ID)
			}
		}(conn, session)
	}
}

// Handle individual connections
func (mp *MariaDBProxy) handleConnection(conn net.Conn, session *model.Session) error {
	defer func() {
		if r := recover(); r != nil {
			// 捕获 panic 错误并记录
			log.Error("Recovered from panic: ", zap.Any("r", r))
			// 恢复程序正常执行
		}
	}()
	defer func() {
		log.Info("handleConnection defer session.ID ", zap.Any("session.ID", session.ID))
		delete(mp.connections, session.ID)
		mp.RemoveConnection(session.ID)
		mp.connManager.Done()
		conn.Close()
		// 绘画结束更新状态
		session.Status = nd.Disconnected
		session.DisconnectedTime = common.NowJsonTime()
		session.Message = "远程连接已关闭"
		if err := repository.SessionRepository.UpdateById(context.Background(), session, session.ID); err != nil {
			log.Error("session", zap.Error(err))
		}
	}()

	if conn == nil {
		log.Error("Connection is nil")
		return errors.Errorf("Connection is nil")
	}

	log.Info("login Permissions Check access user: ", zap.Any("conn", conn))
	handler := &proxy_mysql.SimpleHandler{}
	srv := server.NewServer(
		"10.11.3-MariaDB",       // serverVersion
		45,                      // collationId (ID=255)
		"mysql_native_password", // defaultAuthMethod
		nil,                     // 加载的公钥
		nil,                     // TLS 配置（可选）
	)

	connHandler, err := server.NewCustomizedConn(conn, srv, mp.authProvider, handler)
	if err != nil {
		log.Error("Failed to create MariaDB connection handler: ", zap.Error(err))
		return err
	}

	// 打印数据库名称（如果已捕获）
	if handler.GetDBName() != "" {
		log.Info("Client requested database: ", zap.Any("handler.dbName", handler.GetDBName()))
	} else {
		log.Info("No database requested yet")
	}
	// 获取远程地址
	remoteAddr := conn.RemoteAddr().String()
	log.Info("New connection from:", zap.Any("remoteAddr", remoteAddr))
	log.Info("login Permissions Check access user: ", zap.Any("connHandler.GetUser()", connHandler.GetUser()))
	parts := strings.Split(connHandler.GetUser(), "#")

	// todo 查询冗余需要优化
	user, _ := repository.UserRepository.FindByUsername(context.Background(), parts[0])
	assert, _ := repository.AssetRepository.FindAssetByName(context.Background(), parts[1], "")

	// 判断当前时间是否允许该用户登录
	if err := loginPolicyCheck(user.ID, remoteAddr); err != nil {
		session.AssetId = assert.ID
		session.Creator = user.ID
		log.Error("Failed to loginPolicyCheck user:", zap.Error(err))
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

	// 更新会话信息
	session.Status = nd.Connected
	session.AssetId = assert.ID
	session.Creator = user.ID
	session.ConnectionId = session.ID
	session.Username = connHandler.GetUser()
	session.Password = "-"
	session.Passphrase = "-"
	session.PrivateKey = "-"
	session.AccessGatewayId = assert.AccessGatewayId
	if err := repository.SessionRepository.UpdateById(context.Background(), session, session.ID); err != nil {
		return err
	}

	log.Info("### mp.sshConfig ", zap.Any("mp.sshConfig", mp.sshConfig))
	log.Info("### mp.dataSource ", zap.Any("mp.dataSource", mp.dataSource))
	if mp.sshConfig != (SSHConfig{}) {
		// 开启ssh隧道
		log.Info("开启SSH隧道")
		client, err := mp.createMariaDBClientUseSocks(handler.GetDBName())
		if err != nil {
			log.Error("Failed to create MariaDB client:", zap.Error(err))
			return err
		}
		client.UseDB(handler.GetDBName())
		if err = client.Ping(); err != nil {
			log.Error("Error pinging MariaDB: ", zap.Error(err))
			return err
		}

		if err = mp.CheckLicense(connHandler, user, remoteAddr); err != nil {
			log.Error("Error check license:", zap.Error(err))
			return err
		}

		for {
			err := mp.processCommand(connHandler, client, session)
			if err != nil {
				log.Error("Error processing command:", zap.Error(err))
				// 如果想继续循环，可以使用 continue，避免退出整个函数
				return err // 如果需要退出循环，可以使用 break
			}
		}
	} else {
		// 直连隧道
		log.Info("直连隧道")
		client, err := mp.createMariaDBClient(handler.GetDBName())
		if err != nil {
			log.Error("Failed to create MariaDB client:", zap.Error(err))
			return err
		}

		if err = mp.CheckLicense(connHandler, user, remoteAddr); err != nil {
			log.Error("Error check license:", zap.Error(err))
			return err
		}

		for {
			if err := mp.processCommand(connHandler, client, session); err != nil {
				log.Error("Error processing command:", zap.Error(err))
				return err
			}
		}
	}

}

// Process client commands
func (mp *MariaDBProxy) processCommand(c *server.Conn, client *client.Conn, session *model.Session) error {
	defer func() {
		if r := recover(); r != nil {
			// 捕获 panic 错误并记录
			log.Error("Recovered from panic: ", zap.Any("r", r))
			// 恢复程序正常执行
		}
	}()

	if c.Conn == nil {
		log.Info("connection closed")
		return nil
	}

	data, err := c.ReadPacket()
	if err != nil {
		c.Close()
		c.Conn = nil
		return err
	}

	cmdType := data[0]
	cmdData := hack.String(data[1:])

	sqlLogObj := &model.SqlLog{
		ID:         utils.UUID(),
		Owner:      session.Creator,
		AssetId:    session.AssetId,
		SqlCommand: cmdData,
		Created:    common.NowJsonTime(),
		SessionId:  session.ID,
	}

	log.Info(" cmdType: ", zap.Any("cmdType", cmdType), zap.Any("cmdData", cmdData))
	switch cmdType {
	// use database
	case 2:
		log.Info(" 处理 use database cmdType ", zap.Any("cmdType", cmdType))
		err = client.UseDB(cmdData)
		if err != nil {
			err = c.WriteValue(err)
		} else {
			var v *mysql.Result
			err = c.WriteValue(v)
		}
	case 14:
		log.Info(" 处理未知回调信息 cmdType 14", zap.Any("cmdType", cmdType))
		var v *mysql.Result
		err = c.WriteValue(v)
	case 1:
		log.Info(" 处理未知回调信息 cmdType 1 ", zap.Any("cmdType", cmdType))
		var v *mysql.Result
		err = c.WriteValue(v)
		log.Info(" 关闭数据库连接 ", zap.Any("cmdType", cmdType))
		client.Close()
	// 未知回调信息
	case 4:
		log.Info(" 处理未知回调信息  cmdType 4 ", zap.Any("cmdType", cmdType))
		var v *mysql.Result
		err = c.WriteValue(v)

	// 执行SQL
	default:

		// 检查 MariaDB 连接
		if err = client.Ping(); err != nil {
			log.Error("Error pinging MariaDB: ", zap.Error(err))
			return err
		}

		// 调用AI
		if strings.Contains(cmdData, "-- ai#") {
			propertyAiapiKey, err := repository.PropertyRepository.FindByName(context.Background(), "ai-deepseek-apiKey")
			if err != nil {
				return err
			}
			propertyMaxTokens, err := repository.PropertyRepository.FindByName(context.Background(), "ai-deepseek-maxTokens")
			if err != nil {
				return err
			}
			num, _ := strconv.Atoi(propertyMaxTokens.Value)

			propertyModel, err := repository.PropertyRepository.FindByName(context.Background(), "ai-deepseek-model")
			if err != nil {
				return err
			}
			resp, err := utils.CallDeepSeekAPI(cmdData, num, propertyAiapiKey.Value, propertyModel.Value)
			if err != nil {
				return err
			}
			log.Info(" ai ", zap.Any("resp", resp))

			sqlStr := fmt.Sprintf("select '%s' as AI from dual;", resp)
			// 初始化 v
			v, err := client.Execute(sqlStr)
			if err != nil {
				return err
			}
			// var v *mysql.Result
			err = c.WriteValue(v)
		} else {
			// DBeaver 特殊处理

			v, sqlErr := client.Execute(cmdData)

			if sqlErr != nil {
				// if cmdtype == 3 {
				// 	if err = c.WriteValue(v); err != nil {
				// 		log.Error(" c.WriteValue : ", err.Error())
				// 	}
				// } else {
				// 	if err = c.WriteValue(sqlErr); err != nil {
				// 		log.Error(" c.WriteValue : ", err.Error())
				// 	}
				// }
				if err = c.WriteValue(sqlErr); err != nil {
					log.Error(" c.WriteValue : ", zap.Error(err))
				}
				log.Error(" 请求信息  ", zap.Any("RemoteAddr", c.RemoteAddr().String()),
					zap.Any("c.GetUser()", c.GetUser()),
					zap.Any("client.GetDB()", client.GetDB()),
					zap.Any("cmdData", cmdData),
					zap.Any("cmdType", cmdType),
					zap.Any("sqlErr", sqlErr))

				sqlLogObj.State = "0"
				sqlLogObj.Reason = fmt.Sprintf("cmdType = %v err = %s", cmdType, sqlErr.Error())
				if err = repository.SqlLogRepository.Create(context.Background(), sqlLogObj); err != nil {
					log.Error("sqlLog", zap.Error(err))
				}
				// LogSave(s.Data.Source, c.RemoteAddr().String(), c.GetUser(), client.GetDB(), cmddata, cmdtype, err)
				// 打印这些信息 s.Data.Source, c.RemoteAddr().String(), c.GetUser(), client.GetDB(), cmddata, cmdtype, err
			} else {
				// 执行SQL 返回数据
				if err = c.WriteValue(v); err != nil {
					log.Error(" c.WriteValue : ", zap.Error(err))
				}
				sqlLogObj.State = "1"
				sqlLogObj.Reason = fmt.Sprintf("cmdType = %v %s", cmdType, "成功")
				if err = repository.SqlLogRepository.Create(context.Background(), sqlLogObj); err != nil {
					log.Error("sqlLog", zap.Error(err))
				}
			}

		}
	}

	if c.Conn != nil {
		c.ResetSequence()
	}

	if err != nil {
		c.Close()
		c.Conn = nil
	}
	return err
}

// Create a MariaDB client connection
func (mp *MariaDBProxy) createMariaDBClientUseSocks(dbName string) (*client.Conn, error) {
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

	// 创建到 MariaDB 的连接
	mysqlAddress := fmt.Sprintf("%s:%d", dsn.IP, dsn.Port)
	log.Info("Attempting to connect to MariaDB at  via SSH tunnel", zap.Any("mysqlAddress", mysqlAddress))

	// 创建自定义的 Dialer
	sshDialer := &SSHDialer{sshClient: sshClient}
	dialerFunc := sshDialer.DialerFunc()

	clientConn, err := client.ConnectWithDialer(context.Background(), "tcp", mysqlAddress, dsn.Username, dsn.Password, dbName, dialerFunc)
	if err != nil {
		log.Error("Error connecting to MariaDB through SSH: ", zap.String("err", err.Error()))
		return nil, err
	}

	if err = clientConn.Ping(); err != nil {
		log.Error("Error pinging MariaDB: ", zap.String("err", err.Error()))
		return nil, err
	}

	log.Info("Successfully connected to MariaDB via SSH")
	return clientConn, nil
}
func (mp *MariaDBProxy) createMariaDBClient(dbName string) (*client.Conn, error) {
	dsn := mp.dataSource
	for {
		client, err := client.Connect(fmt.Sprintf("%s:%d", dsn.IP, dsn.Port), dsn.Username, dsn.Password, dbName)
		if err != nil {
			log.Error("Error connecting to MariaDB: ", zap.String("err", err.Error()))
			time.Sleep(10 * time.Second)
			continue
		}
		if err = client.Ping(); err != nil {
			log.Error("Error pinging MariaDB: ", zap.String("err", err.Error()))
			continue
		}
		return client, nil
	}
}

// Stop the MariaDB proxy server
func (mp *MariaDBProxy) Stop() error {
	if mp.listener != nil {
		if err := mp.listener.Close(); err != nil {
			log.Error("Failed to close listener:", zap.String("err", err.Error()))
			return err
		}
		mp.listener = nil
		log.Info("Proxy server listener stopped.")
	}

	if mp.cancelFunc != nil {
		mp.cancelFunc()
		mp.cancelFunc = nil
		log.Info("Proxy server context canceled.")
	}
	mp.connManager.Wait()
	log.Info("Proxy server stopped.")
	return nil
}

// Check the status of the MariaDB proxy server
func (mp *MariaDBProxy) Status() bool {
	return mp.listener != nil
}
