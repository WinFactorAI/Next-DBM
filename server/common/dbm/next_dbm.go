package dbm

import (
	"bufio"
	"errors"
	"fmt"
	"io"
	"next-dbm/server/log"
	"next-dbm/server/model"

	"github.com/pkg/sftp"
)

type NextDBM struct {
	DBClient     *DBClient
	DBSession    *DBSession
	StdinPipe    io.WriteCloser
	SftpClient   *sftp.Client
	Recorder     *Recorder
	StdoutReader *bufio.Reader
}

func NewNextDBM(session *model.Session, ip string, port int, username, password, privateKey, passphrase string, rows, cols int, recording, term string, pipe bool, protocol string) (*NextDBM, error) {
	log.Info(" #### NewNextDBMUseSocks connect ")

	// 打印全部参数
	strPort := fmt.Sprintf("%d", port)
	log.Info(" #### NewNextDBMUseSocks connect " + ip + ":" + strPort + " " + username + " " + password + " " + privateKey + " " + passphrase + " " + string(rows) + " " + string(cols) + " " + recording + " " + term + " ")
	dbClient, err := NewDBMClient(ip, port, username, password, privateKey, passphrase)
	if err != nil {
		return nil, err
	}
	dbClient.dbConfig.DBType = protocol
	return newND(session, dbClient, pipe, recording, term, rows, cols)
}

func NewNextDBMUseSocks(session *model.Session, ip string, port int, username, password, privateKey, passphrase string, rows, cols int, recording, term string, pipe bool, socksProxyHost, socksProxyPort, socksProxyUsername, socksProxyPassword string, protocol string) (*NextDBM, error) {
	log.Info(" #### NewNextDBMUseSocks use socks proxy")

	dbClient, err := NewDBMClientUseSocks(ip, port, username, password, privateKey, passphrase, socksProxyHost, socksProxyPort, socksProxyUsername, socksProxyPassword)
	if err != nil {
		return nil, err
	}
	dbClient.dbConfig.DBType = protocol
	return newND(session, dbClient, pipe, recording, term, rows, cols)
}

func newND(session *model.Session, dbClient *DBClient, pipe bool, recording string, term string, rows int, cols int) (*NextDBM, error) {
	dbSession, err := dbClient.NewSession()
	if err != nil {
		return nil, err
	}

	dbSession.Session = session
	dbSession.DBType = dbClient.dbConfig.DBType

	var stdoutReader *bufio.Reader
	if pipe {
		stdoutPipe, err := dbSession.StdoutPipe()
		if err != nil {
			return nil, err
		}
		stdoutReader = bufio.NewReader(stdoutPipe)
	}

	var stdinPipe io.WriteCloser
	if pipe {
		stdinPipe, err = dbSession.StdinPipe()
		if err != nil {
			return nil, err
		}
	}

	var recorder *Recorder
	if recording != "" {
		recorder, err = NewRecorder(recording, term, rows, cols)
		if err != nil {
			return nil, err
		}
	}

	dbm := NextDBM{
		DBClient:     dbClient,
		DBSession:    dbSession,
		Recorder:     recorder,
		StdinPipe:    stdinPipe,
		StdoutReader: stdoutReader,
	}

	return &dbm, nil
}

func (ret *NextDBM) Write(p []byte) (int, error) {
	if ret.StdinPipe == nil {
		return 0, errors.New("pipe is not open")
	}
	return ret.StdinPipe.Write(p)
}

func (ret *NextDBM) Close() {

	if ret.SftpClient != nil {
		_ = ret.SftpClient.Close()
	}

	if ret.DBSession != nil {
		_ = ret.DBSession.Close()
	}

	if ret.DBClient != nil {
		_ = ret.DBClient.Close()
	}

	if ret.Recorder != nil {
		ret.Recorder.Close()
	}
	log.Info(" #### NextDBM Close ")

}

func (ret *NextDBM) WindowChange(h int, w int) error {
	// return ret.DBSession.WindowChange(h, w)
	return nil
}

func (ret *NextDBM) RequestPty(term string, h, w int) error {
	// modes := ssh.TerminalModes{
	// 	ssh.ECHO:          1,
	// 	ssh.TTY_OP_ISPEED: 14400,
	// 	ssh.TTY_OP_OSPEED: 14400,
	// }

	// return ret.DBSession.RequestPty(term, h, w, modes)
	return nil
}

func (ret *NextDBM) Shell() error {
	// return ret.DBSession.Shell()
	return nil
}
