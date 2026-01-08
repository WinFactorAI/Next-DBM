package proxy

import (
	"context"
	"fmt"

	"net"

	"next-dbm/server/log"
	lib "next-dbm/server/proxy/lib"
	"sync"

	_ "github.com/go-sql-driver/mysql"
	"go.uber.org/zap"
	"golang.org/x/crypto/ssh"
)

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

type MysqlProxy struct {
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

var proxyServer *MysqlProxy = nil

func NewMysqlProxy(port string) *MysqlProxy {
	proxyServer = &MysqlProxy{
		authProvider: &lib.InMemoryProvider{},
		port:         port,
		userCount:    0,
	}
	return proxyServer
}

type SSHDialer struct {
	sshClient *ssh.Client
}

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
