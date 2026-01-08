package api

import (
	"context"
	"encoding/base64"
	"encoding/json"
	"fmt"
	"next-dbm/server/common/dbm"
	"next-dbm/server/common/nd"
	"strconv"

	"next-dbm/server/common/term"
	"next-dbm/server/dto"
	"next-dbm/server/global/session"
	"next-dbm/server/model"
	"next-dbm/server/repository"
	"next-dbm/server/service"
	"next-dbm/server/utils"

	"github.com/gorilla/websocket"
	"github.com/labstack/echo/v4"
)

const (
	Closed    = 0
	Connected = 1
	Data      = 2
	Resize    = 3
	Ping      = 4
)

type WebTerminalApi struct {
}

func (api WebTerminalApi) SshEndpoint(c echo.Context) error {
	ws, err := UpGrader.Upgrade(c.Response().Writer, c.Request(), nil)
	if err != nil {
		return err
	}

	defer func() {
		_ = ws.Close()
	}()
	ctx := context.TODO()

	sessionId := c.Param("id")
	cols, _ := strconv.Atoi(c.QueryParam("cols"))
	rows, _ := strconv.Atoi(c.QueryParam("rows"))

	s, err := service.SessionService.FindByIdAndDecrypt(ctx, sessionId)
	if err != nil {
		return WriteMessage(ws, dto.NewMessage(Closed, "获取会话或解密数据失败"))
	}

	if err := api.permissionCheck(c, s.AssetId); err != nil {
		return WriteMessage(ws, dto.NewMessage(Closed, err.Error()))
	}

	var (
		username   = s.Username
		password   = s.Password
		privateKey = s.PrivateKey
		passphrase = s.Passphrase
		ip         = s.IP
		port       = s.Port
	)

	if s.AccessGatewayId != "" && s.AccessGatewayId != "-" {
		g, err := service.GatewayService.GetGatewayById(s.AccessGatewayId)
		if err != nil {
			return WriteMessage(ws, dto.NewMessage(Closed, "获取接入网关失败："+err.Error()))
		}

		defer g.CloseSshTunnel(s.ID)
		exposedIP, exposedPort, err := g.OpenSshTunnel(s.ID, ip, port)
		if err != nil {
			return WriteMessage(ws, dto.NewMessage(Closed, "创建隧道失败："+err.Error()))
		}
		ip = exposedIP
		port = exposedPort
	}

	recording := ""
	var isRecording = false
	// 屏不录制屏幕功能
	// property, err := repository.PropertyRepository.FindByName(ctx, guacamole.EnableRecording)
	// if err == nil && property.Value == "true" {
	// 	isRecording = true
	// }

	if isRecording {
		// recording = path.Join(config.GlobalCfg.Guacd.Recording, sessionId, "recording.cast")
	}

	attributes, err := repository.AssetRepository.FindAssetAttrMapByAssetId(ctx, s.AssetId)
	if err != nil {
		return WriteMessage(ws, dto.NewMessage(Closed, "获取资产属性失败："+err.Error()))
	}

	fmt.Println(" ###  attributes[nd.Protocol] " + attributes[nd.Protocol])
	fmt.Println(" ###  attributes[nd.SocksProxyEnable] " + attributes[nd.SocksProxyEnable])
	var xterm = "xterm-256color"
	// var nextT *term.NextT
	var nextDBM *dbm.NextDBM
	if attributes[nd.SocksProxyEnable] == "true" {
		nextDBM, err = dbm.NewNextDBMUseSocks(&s, ip,
			port,
			username,
			password,
			privateKey,
			passphrase,
			rows,
			cols,
			recording,
			xterm,
			true,
			attributes[nd.SocksProxyHost],
			attributes[nd.SocksProxyPort],
			attributes[nd.SocksProxyUsername],
			attributes[nd.SocksProxyPassword],
			attributes[nd.Protocol])
	} else {
		nextDBM, err = dbm.NewNextDBM(&s, ip,
			port,
			username,
			password,
			privateKey,
			passphrase,
			rows,
			cols,
			recording,
			xterm,
			true,
			attributes[nd.Protocol])
	}

	if err != nil {
		// return WriteMessage(ws, dto.NewMessage(Closed, "创建SSH客户端失败："+err.Error()))
		return WriteMessage(ws, dto.NewMessage(Closed, "创建DB客户端失败："+err.Error()))
	}

	if err := nextDBM.RequestPty(xterm, rows, cols); err != nil {
		return err
	}

	if err := nextDBM.Shell(); err != nil {
		return err
	}

	sessionForUpdate := model.Session{
		ConnectionId: sessionId,
		Width:        cols,
		Height:       rows,
		Status:       nd.Connecting,
		Recording:    recording,
	}
	if sessionForUpdate.Recording == "" {
		// 未录屏时无需审计
		sessionForUpdate.Reviewed = true
	}
	// 创建新会话
	if err := repository.SessionRepository.UpdateById(ctx, &sessionForUpdate, sessionId); err != nil {
		return err
	}

	if err := WriteMessage(ws, dto.NewMessage(Connected, "")); err != nil {
		return err
	}

	nextSession := &session.Session{
		ID:          s.ID,
		Protocol:    s.Protocol,
		Mode:        s.Mode,
		WebSocket:   ws,
		GuacdTunnel: nil,

		NextDBM:  nextDBM,
		Observer: session.NewObserver(s.ID),
	}
	session.GlobalSessionManager.Add(nextSession)

	termHandler := NewDBMHandler(s.Creator, s.AssetId, sessionId, isRecording, ws, nextDBM)
	termHandler.Start()
	defer termHandler.Stop()

	for {
		_, message, err := ws.ReadMessage()
		if err != nil {
			// web socket会话关闭后主动关闭ssh会话
			service.SessionService.CloseSessionById(sessionId, Normal, "用户正常退出")
			break
		}
		msg, err := dto.ParseMessage(string(message))
		if err != nil {
			continue
		}

		switch msg.Type {
		case Resize:
			decodeString, err := base64.StdEncoding.DecodeString(msg.Content)
			if err != nil {
				continue
			}
			var winSize dto.WindowSize
			err = json.Unmarshal(decodeString, &winSize)
			if err != nil {
				continue
			}
			if err := termHandler.WindowChange(winSize.Rows, winSize.Cols); err != nil {
			}
			_ = repository.SessionRepository.UpdateWindowSizeById(ctx, winSize.Rows, winSize.Cols, sessionId)
		case Data:
			input := []byte(msg.Content)
			err := termHandler.Write(input)
			if err != nil {
				service.SessionService.CloseSessionById(sessionId, TunnelClosed, "远程连接已关闭")
			}
		case Ping:
			err := termHandler.SendRequest()
			if err != nil {
				service.SessionService.CloseSessionById(sessionId, TunnelClosed, "远程连接已关闭")
			} else {
				_ = termHandler.SendMessageToWebSocket(dto.NewMessage(Ping, ""))
			}

		}
	}
	return err
}

func (api WebTerminalApi) SshMonitorEndpoint(c echo.Context) error {
	ws, err := UpGrader.Upgrade(c.Response().Writer, c.Request(), nil)
	if err != nil {
		return err
	}

	defer func() {
		_ = ws.Close()
	}()
	ctx := context.TODO()

	sessionId := c.Param("id")
	s, err := repository.SessionRepository.FindById(ctx, sessionId)
	if err != nil {
		return WriteMessage(ws, dto.NewMessage(Closed, "获取会话失败"))
	}

	nextSession := session.GlobalSessionManager.GetById(sessionId)
	if nextSession == nil {
		return WriteMessage(ws, dto.NewMessage(Closed, "会话已离线"))
	}

	obId := utils.UUID()
	obSession := &session.Session{
		ID:        obId,
		Protocol:  s.Protocol,
		Mode:      s.Mode,
		WebSocket: ws,
	}
	nextSession.Observer.Add(obSession)

	for {
		_, _, err := ws.ReadMessage()
		if err != nil {
			nextSession.Observer.Del(obId)
			break
		}
	}
	return nil
}

func (api WebTerminalApi) permissionCheck(c echo.Context, assetId string) error {
	user, _ := GetCurrentAccount(c)
	if nd.TypeUser == user.Type {
		// 检测是否有访问权限 TODO
		//assetIds, err := repository.ResourceSharerRepository.FindAssetIdsByUserId(context.TODO(), user.ID)
		//if err != nil {
		//	return err
		//}
		//
		//if !utils.Contains(assetIds, assetId) {
		//	return errors.New("您没有权限访问此资产")
		//}
	}
	return nil
}

func WriteMessage(ws *websocket.Conn, msg dto.Message) error {
	message := []byte(msg.ToString())
	return ws.WriteMessage(websocket.TextMessage, message)
}

func CreateNextTBySession(session model.Session) (*term.NextT, error) {
	var (
		username   = session.Username
		password   = session.Password
		privateKey = session.PrivateKey
		passphrase = session.Passphrase
		ip         = session.IP
		port       = session.Port
	)
	return term.NewNextT(ip, port, username, password, privateKey, passphrase, 10, 10, "", "", false)
}
