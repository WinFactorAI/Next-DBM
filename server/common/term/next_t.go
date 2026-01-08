package term

import (
	"bufio"
	"errors"
	"io"

	"github.com/pkg/sftp"
	"golang.org/x/crypto/ssh"
)

type NextT struct {
	SshClient    *ssh.Client
	SshSession   *ssh.Session
	StdinPipe    io.WriteCloser
	SftpClient   *sftp.Client
	Recorder     *Recorder
	StdoutReader *bufio.Reader
}

func NewNextT(ip string, port int, username, password, privateKey, passphrase string, rows, cols int, recording, term string, pipe bool) (*NextT, error) {
	sshClient, err := NewSshClient(ip, port, username, password, privateKey, passphrase)
	if err != nil {
		return nil, err
	}
	return newNT(sshClient, pipe, recording, term, rows, cols)
}

func NewNextTUseSocks(ip string, port int, username, password, privateKey, passphrase string, rows, cols int, recording, term string, pipe bool, socksProxyHost, socksProxyPort, socksProxyUsername, socksProxyPassword string) (*NextT, error) {
	sshClient, err := NewSshClientUseSocks(ip, port, username, password, privateKey, passphrase, socksProxyHost, socksProxyPort, socksProxyUsername, socksProxyPassword)
	if err != nil {
		return nil, err
	}
	return newNT(sshClient, pipe, recording, term, rows, cols)
}

func newNT(sshClient *ssh.Client, pipe bool, recording string, term string, rows int, cols int) (*NextT, error) {
	sshSession, err := sshClient.NewSession()
	if err != nil {
		return nil, err
	}

	var stdoutReader *bufio.Reader
	if pipe {
		stdoutPipe, err := sshSession.StdoutPipe()
		if err != nil {
			return nil, err
		}
		stdoutReader = bufio.NewReader(stdoutPipe)
	}

	var stdinPipe io.WriteCloser
	if pipe {
		stdinPipe, err = sshSession.StdinPipe()
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

	terminal := NextT{
		SshClient:    sshClient,
		SshSession:   sshSession,
		Recorder:     recorder,
		StdinPipe:    stdinPipe,
		StdoutReader: stdoutReader,
	}

	return &terminal, nil
}

func (ret *NextT) Write(p []byte) (int, error) {
	if ret.StdinPipe == nil {
		return 0, errors.New("pipe is not open")
	}
	return ret.StdinPipe.Write(p)
}

func (ret *NextT) Close() {

	if ret.SftpClient != nil {
		_ = ret.SftpClient.Close()
	}

	if ret.SshSession != nil {
		_ = ret.SshSession.Close()
	}

	if ret.SshClient != nil {
		_ = ret.SshClient.Close()
	}

	if ret.Recorder != nil {
		ret.Recorder.Close()
	}
}

func (ret *NextT) WindowChange(h int, w int) error {
	return ret.SshSession.WindowChange(h, w)
}

func (ret *NextT) RequestPty(term string, h, w int) error {
	modes := ssh.TerminalModes{
		ssh.ECHO:          1,
		ssh.TTY_OP_ISPEED: 14400,
		ssh.TTY_OP_OSPEED: 14400,
	}

	return ret.SshSession.RequestPty(term, h, w, modes)
}

func (ret *NextT) Shell() error {
	return ret.SshSession.Shell()
}
