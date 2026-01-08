package api

import (
	"bytes"
	"context"
	"sync"
	"time"
	"unicode/utf8"

	"next-dbm/server/common/dbm"
	"next-dbm/server/dto"
	"next-dbm/server/global/session"

	"github.com/gorilla/websocket"
)

type DBMHandler struct {
	sessionId    string
	isRecording  bool
	webSocket    *websocket.Conn
	nextDBM 	 *dbm.NextDBM
	ctx          context.Context
	cancel       context.CancelFunc
	dataChan     chan rune
	tick         *time.Ticker
	mutex        sync.Mutex
	buf          bytes.Buffer
}

func NewDBMHandler(userId, assetId, sessionId string, isRecording bool, ws *websocket.Conn, nextDBM *dbm.NextDBM) *DBMHandler {
	ctx, cancel := context.WithCancel(context.Background())
	tick := time.NewTicker(time.Millisecond * time.Duration(60))

	return &DBMHandler{
		sessionId:    sessionId,
		isRecording:  isRecording,
		webSocket:    ws,
		nextDBM: 	  nextDBM,
		ctx:          ctx,
		cancel:       cancel,
		dataChan:     make(chan rune),
		tick:         tick,
	}
}

func (r *DBMHandler) Start() {
	go r.readFormTunnel()
	go r.writeToWebsocket()
}

func (r *DBMHandler) Stop() {
	// 会话结束时记录最后一个命令
	r.tick.Stop()
	r.cancel()
}

func (r *DBMHandler) readFormTunnel() {
	for {
		select {
		case <-r.ctx.Done():
			return
		default:
			rn, size, err := r.nextDBM.StdoutReader.ReadRune()
			if err != nil {
				return
			}
			if size > 0 {
				r.dataChan <- rn
			}
		}
	}
}

func (r *DBMHandler) writeToWebsocket() {
	for {
		select {
		case <-r.ctx.Done():
			return
		case <-r.tick.C:
			s := r.buf.String()
			if s == "" {
				continue
			}
			if err := r.SendMessageToWebSocket(dto.NewMessage(Data, s)); err != nil {
				return
			}
			// 录屏
			if r.isRecording {
				_ = r.nextDBM.Recorder.WriteData(s)
			}
			// 监控
			DBMSendObData(r.sessionId, s)
			r.buf.Reset()
		case data := <-r.dataChan:
			if data != utf8.RuneError {
				p := make([]byte, utf8.RuneLen(data))
				utf8.EncodeRune(p, data)
				r.buf.Write(p)
			} else {
				r.buf.Write([]byte("@"))
			}
		}
	}
}

func (r *DBMHandler) Write(input []byte) error {
	// 正常的字符输入
	_, err := r.nextDBM.Write(input)
	return err
}

func (r *DBMHandler) WindowChange(h int, w int) error {
	return r.nextDBM.WindowChange(h, w)
}

func (r *DBMHandler) SendRequest() error {
	// _, _, err := r.nextDBM.Conn.SendRequest("zsvc@163.com", true, nil)
	// return err
	return nil
}

func (r *DBMHandler) SendMessageToWebSocket(msg dto.Message) error {
	if r.webSocket == nil {
		return nil
	}
	defer r.mutex.Unlock()
	r.mutex.Lock()
	message := []byte(msg.ToString())
	return r.webSocket.WriteMessage(websocket.TextMessage, message)
}

func DBMSendObData(sessionId, s string) {
	nextSession := session.GlobalSessionManager.GetById(sessionId)
	if nextSession != nil && nextSession.Observer != nil {
		nextSession.Observer.Range(func(key string, ob *session.Session) {
			_ = ob.WriteMessage(dto.NewMessage(Data, s))
		})
	}
}
