import { message } from "antd";
import qs from "qs";

import { wsServer } from "../../../../common/env";
import { debugLog } from "../../../../common/logger";
import request from "../../../../common/request";
import { getToken } from "../../../../utils/utils";
import Message from "../../../access/Message";

export class WebSocketManager {

  constructor() {
    this.sessions = new Map(); // 存储 assetId 和 session 的映射
    this.webSockets = new Map(); // 存储 assetId 和 webSocket 实例
    this.pingIntervals = new Map(); // 存储每个连接的 ping 定时器
  }

  printData() {
    debugLog(" printData this.webSockets assetId Promise this.webSockets ", this.webSockets)
  }
  setGetSQLConverter(header) {
    this.getSQLConverter = header;
  }
  setWebSocketOnData(header) {
    this.webSocketOnData = header;
  }
 

  async createSession(assetId) {
    let result = await request.post(`/sessions?assetId=${assetId}&mode=native`);
    if (result['code'] !== 1) {
      return [undefined, result['message']];
    }
    return [result['data'], ''];
  }

  async updateSessionStatus(sessionId) {
    let result = await request.post(`/sessions/${sessionId}/connect`);
    if (result['code'] !== 1) {
      message.error(result['message']);
    }
  }

  writeCommand(assetId, command) {
    const webSocket = this.webSockets.get(assetId);
    if (webSocket) {
      webSocket.send(new Message(Message.Data, command));
    }
  }

  // async getCommands(isWorker, setCommands) {
  //   let items;
  //   if (strings.hasText(isWorker)) {
  //     items = await workCommandApi.getAll();
  //   } else {
  //     items = await commandApi.getAll();
  //   }
  //   setCommands(items);
  // }

  async init(assetId) {
    debugLog(` #### init assetId `, assetId);
    if (!assetId) {
      message.error({ className: 'DBEditor', content: `参数缺失，请关闭此页面后重新打开。` });
      return;
    }

    // 创建会话
    let [session, errMsg] = await this.createSession(assetId);
    if (!session) {
      message.error({ className: 'DBEditor', content: `创建会话失败，${errMsg}` });
      return;
    }

    let sessionId = session['id'];
    this.sessions.set(assetId, session);

    let token = getToken();
    let params = {
      'cols': 100,
      'rows': 100,
      'X-Auth-Token': token
    };

    let paramStr = qs.stringify(params);
    let webSocketTmp = new WebSocket(`${wsServer}/sessions/${sessionId}/ssh?${paramStr}`);
    this.webSockets.set(assetId, webSocketTmp);
    debugLog(" #### this.webSockets  assetId ", this.webSockets)

    let pingInterval;

    webSocketTmp.onopen = (e => {
      pingInterval = setInterval(() => {
        webSocketTmp.send(new Message(Message.Ping, "").toString());
      }, 10000);
      this.pingIntervals.set(assetId, pingInterval);
    });

    webSocketTmp.onerror = (e) => {
      message.error({ className: 'DBEditor', content: `websocket error ${e.data}` });
    };

    webSocketTmp.onclose = (e) => {

      debugLog(`e`, e);
      // message.error({ className: 'DBEditor', content: `连接已关闭` });
      clearInterval(this.pingIntervals.get(assetId));
      this.pingIntervals.delete(assetId);
      this.webSockets.delete(assetId);
      this.sessions.delete(assetId);
    };

    webSocketTmp.onmessage = (e) => {
      let msg = Message.parse(e.data);
      switch (msg['type']) {
        case Message.Connected:
          this.updateSessionStatus(sessionId);
          // this.getCommands(isWorker, setCommands);

          const systemInfoCommand = JSON.stringify({
            "key": new Date().getTime() + "-getVariables",
            "retType": 'KeyValueJsonResult',
            "data": this.getSQLConverter("getVariables"),
            "attr": {
              sqlCommand: this.getSQLConverter("getVariables"),
              assetId: assetId
            }
          });
          webSocketTmp.send(new Message(Message.Data, systemInfoCommand).toString());

          setTimeout(() => {
            const databaseCommand = JSON.stringify({
              "key": "0001" + new Date().getTime(),
              "retType": 'databaseMenu',
              "data": this.getSQLConverter("getAllDatabases"),
              "attr": {
                sqlCommand: this.getSQLConverter("getAllDatabases"),
                assetId: assetId
              }
            });
            webSocketTmp.send(new Message(Message.Data, databaseCommand).toString());
          }, 1000);
          break;
        case Message.Data:
          this.webSocketOnData(msg['content']);
          break;
        case Message.Closed:
          message.error({ className: 'DBEditor', content: `服务端通知需要关闭连接:` + msg['content'] });
          webSocketTmp.close();
          break;
        default:
          break;
      }
    };
    // this.printData()
    //   setSession(session);
    //   setWebSocket(webSocketTmp);
  }

  closeConnection(assetId) {
    const webSocket = this.webSockets.get(assetId);
    if (webSocket) {
      debugLog(` onclose assetId = `, assetId);
      webSocket.close();
      clearInterval(this.pingIntervals.get(assetId));
      this.pingIntervals.delete(assetId);
      this.webSockets.delete(assetId);
      this.sessions.delete(assetId);
    }
  }

  /**
   * 根据 assetId 发送数据，返回 Promise
   * @param {string} assetId - 资产ID
   * @param {object} data - 发送的数据
   * @returns {Promise} - 返回一个 Promise，用于处理发送结果
   */
  sendData(assetId, data) {
    debugLog(" sendData this.webSockets assetId this.webSockets ", this.webSockets)
    return new Promise((resolve, reject) => {
      debugLog(" sendData this.webSockets assetId ", assetId)
      debugLog(" sendData this.webSockets assetId Promise this.webSockets ", this.webSockets)
      const webSocket = this.webSockets.get(assetId);
      if (!webSocket) {
        return reject(new Error(`WebSocket for assetId ${assetId} not found`));
      }

      if (webSocket.readyState === WebSocket.OPEN) {
        // 在发送数据时附加 assetId
        data.attr = data.attr || {};
        data.attr.assetId = assetId;

        // 将数据转成字符串并通过 WebSocket 发送
        webSocket.send(new Message(Message.Data, JSON.stringify(data)).toString());
        resolve(); // 发送完成后调用 resolve
      } else {
        reject(new Error(`WebSocket for assetId ${assetId} is not open`));
      }
    });
  }
}



