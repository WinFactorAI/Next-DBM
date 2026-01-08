package dbm

import (
	"fmt"
	"net"
	"time"

	"golang.org/x/crypto/ssh"
	"golang.org/x/net/proxy"
)

func NewDBMClient(ip string, port int, username, password, privateKey, passphrase string) (*DBClient, error) {
	var authMethod *DBClient
	if username == "-" || username == "" {
		username = "root"
	}
	if password == "-" {
		password = ""
	}
	if privateKey == "-" {
		privateKey = ""
	}
	if passphrase == "-" {
		passphrase = ""
	}

	dbConfig := &DBConfig{
        Host:      ip,
        Port:      port,
        User:      username,
        Pass:      password, 
    }

    authMethod, err := NewDBClient(dbConfig)
    if err != nil {
		return nil, err
    }
	return authMethod, nil
	// var err error
	// if privateKey != "" {
	// 	var key ssh.Signer
	// 	if len(passphrase) > 0 {
	// 		key, err = ssh.ParsePrivateKeyWithPassphrase([]byte(privateKey), []byte(passphrase))
	// 		if err != nil {
	// 			return nil, err
	// 		}
	// 	} else {
	// 		key, err = ssh.ParsePrivateKey([]byte(privateKey))
	// 		if err != nil {
	// 			return nil, err
	// 		}
	// 	}
	// 	authMethod = ssh.PublicKeys(key)
	// } else {
	// 	authMethod = ssh.Password(password)
	// }

	// config := &ssh.ClientConfig{
	// 	Timeout:         3 * time.Second,
	// 	User:            username,
	// 	Auth:            []ssh.AuthMethod{authMethod},
	// 	HostKeyCallback: ssh.InsecureIgnoreHostKey(),
	// }

	// addr := fmt.Sprintf("%s:%d", ip, port)
	// return ssh.Dial("tcp", addr, config)
}

func NewDBMClientUseSocks(ip string, port int, username, password, privateKey, passphrase string, socksProxyHost, socksProxyPort, socksProxyUsername, socksProxyPassword string) (*DBClient, error) {
	var authMethod *DBClient
	if username == "-" || username == "" {
		username = "root"
	}
	if password == "-" {
		password = ""
	}
	if privateKey == "-" {
		privateKey = ""
	}
	if passphrase == "-" {
		passphrase = ""
	}

	// var err error
	// if privateKey != "" {
	// 	var key ssh.Signer
	// 	if len(passphrase) > 0 {
	// 		key, err = ssh.ParsePrivateKeyWithPassphrase([]byte(privateKey), []byte(passphrase))
	// 		if err != nil {
	// 			return nil, err
	// 		}
	// 	} else {
	// 		key, err = ssh.ParsePrivateKey([]byte(privateKey))
	// 		if err != nil {
	// 			return nil, err
	// 		}
	// 	}
	// 	authMethod = ssh.PublicKeys(key)
	// } else {
	// 	authMethod = ssh.Password(password)
	// }

	config := &ssh.ClientConfig{
		Timeout:         3 * time.Second,
		User:            username,
		// Auth:            []ssh.AuthMethod{authMethod},
		HostKeyCallback: ssh.InsecureIgnoreHostKey(),
	}

	socksProxyAddr := fmt.Sprintf("%s:%s", socksProxyHost, socksProxyPort)

	socks5, err := proxy.SOCKS5("tcp", socksProxyAddr,
		&proxy.Auth{User: socksProxyUsername, Password: socksProxyPassword},
		&net.Dialer{
			Timeout:   30 * time.Second,
			KeepAlive: 30 * time.Second,
		},
	)
	if err != nil {
		return nil, err
	}

	addr := fmt.Sprintf("%s:%d", ip, port)
	conn, err := socks5.Dial("tcp", addr)
	if err != nil {
		return nil, err
	}

	clientConn, channels, requests, err := ssh.NewClientConn(conn, addr, config)
	if err != nil {
		return nil, err
	}

	// return ssh.NewClient(clientConn, channels, requests), nil
	dbConfig := &DBConfig{
        Host:      ip,
        Port:      port,
        User:      username,
        Pass:      password,
		clientConn: clientConn,
		channels: channels,
		requests: requests,
    }

    authMethod, err = NewDBClient(dbConfig)
    if err != nil {
		return nil, err
    }
	return authMethod, nil
}
