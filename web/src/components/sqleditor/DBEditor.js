import { message } from "antd";
import qs from "qs";
import { useContext, useEffect, useState } from "react";
import { Toaster } from "react-hot-toast";
import { useSearchParams } from "react-router-dom";
import 'react-tabs/style/react-tabs.css';
import commandApi from "../../api/command";
import workAssetApi from "../../api/worker/asset";
import workCommandApi from "../../api/worker/command";
import { wsServer } from "../../common/env";
import { debugLog } from '../../common/logger';
import request from "../../common/request";
import { debounce } from "../../utils/fun";
import '../../utils/i18n';
import strings from "../../utils/strings";
import { getToken } from "../../utils/utils";
import Message from "../access/Message";
import Loading from './components/Loading/Loading';
import MainPanel from "./components/MainPanel";
import MenuPanel from "./components/MenuPanel";
import { VisibilityContext, VisibilityProvider } from "./components/Utils/visibilityProvider";
import './index.css';
function WebSocketComponent() {
  const {
    setTreeData,
    webSocket,
    setWebSocket,
    webSocketOnData,
    getSQLConverter,
    setConnectionMode,
  } = useContext(VisibilityContext);
  // 设置title DBEditor
  document.title = "Next-DBM | DBEditor";
  // 获取URI参数
  const [searchParams] = useSearchParams();
  const assetId = searchParams.get('assetId');
  const assetName = searchParams.get('assetName');
  const protocol = searchParams.get('protocol');


  // debugLog(" assetId !! ",assetId)
  // setAssetId(assetId)
  // debugLog(" assetId ",assetId)
  // debugLog(" assetName ",assetName)
  // debugLog(" protocol ",protocol)

  const isWorker = searchParams.get('isWorker');
  const [box, setBox] = useState({ width: window.innerWidth, height: window.innerHeight });

  let isReConnect = true;
  let [commands, setCommands] = useState([]);
  let [session, setSession] = useState({});
  let [websocket, setWebsocket] = useState(); //局部变量无用
  let reWebsocketInterval = null;

  const onWindowResize = () => {
    setBox({ width: window.innerWidth, height: window.innerHeight });
  };
  const initWebSocket = async (assetId) => {
    debugLog(" 单个资产 ")
    const createSession = async (assetsId) => {
      let result = await request.post(`/sessions?assetId=${assetsId}&mode=native`);
      if (result['code'] !== 1) {
        return [undefined, result['message']];
      }
      return [result['data'], ''];
    }

    const updateSessionStatus = async (sessionId) => {
      let result = await request.post(`/sessions/${sessionId}/connect`);
      if (result['code'] !== 1) {
        message.error(result['message']);
      }
    }

    const writeCommand = (command) => {
      if (webSocket) {
        webSocket.send(new Message(Message.Data, command));
      }
    }

    const getCommands = async () => {
      if (strings.hasText(isWorker)) {
        let items = await workCommandApi.getAll();
        setCommands(items);
      } else {
        let items = await commandApi.getAll();
        setCommands(items);
      }
    }

    let elementDBEditor = document.getElementById('DBEditor');
    // elementDBEditor.focus();
    if (!assetId) {
      message.error({ className: 'DBEditor', content: `参数缺失，请关闭此页面后重新打开。` })
      return;
    }


    let [session, errMsg] = await createSession(assetId);
    if (!session) {
      message.error({ className: 'DBEditor', content: `创建会话失败，${errMsg}` })
      return;
    }
    let sessionId = session['id'];

    let token = getToken();
    let params = {
      'cols': 100,
      'rows': 100,
      'X-Auth-Token': token
    };

    let paramStr = qs.stringify(params);

    let webSocketTmp = new WebSocket(`${wsServer}/sessions/${sessionId}/ssh?${paramStr}`);
    let pingInterval;

    webSocketTmp.onopen = (e => {
      pingInterval = setInterval(() => {
        webSocketTmp.send(new Message(Message.Ping, "").toString());
      }, 10000);
      if (reWebsocketInterval) {
        message.destroy();
        clearInterval(reWebsocketInterval);
      }
    });

    webSocketTmp.onerror = (e) => {
      message.error({ className: 'DBEditor', content: `websocket error ${e.data}` })
    }

    const ReConnect = () => {
      console.log(" isReConnect ", isReConnect)
      if (isReConnect) {
        reWebsocketInterval = setInterval(() => {
          debugLog("重新连接")
          init();
        }, 1000);
      }
    }
    webSocketTmp.onclose = (e) => {
      debugLog(`webSocketTmp e`, e);
      // term.writeln("connection is closed.");
      message.error({ className: 'DBEditor', content: `连接已关闭`, duration: 0, })
      if (pingInterval) {
        clearInterval(pingInterval);
      }
      ReConnect();

    }

    webSocketTmp.onmessage = (e) => {
      let msg = Message.parse(e.data);
      // debugLog(" msg ",msg)
      switch (msg['type']) {
        case Message.Connected:
          // term.clear();
          updateSessionStatus(sessionId);
          getCommands();
          // 获取系统信息
          const jsonObject = {
            "key": new Date().getTime() + "-getVariables",
            "retType": 'KeyValueJsonResult',
            "data": getSQLConverter("getVariables"),
            "attr": {
              sqlCommand: getSQLConverter("getVariables")
            }
          };
          // 将JSON对象转换为字符串
          const jsonString = JSON.stringify(jsonObject);
          webSocketTmp.send(new Message(Message.Data, jsonString).toString());

          setTimeout(() => {
            // 加载,
            const jsonObject = {
              "key": "0001" + new Date().getTime(),
              "retType": 'databaseMenu',
              "data": getSQLConverter("getAllDatabases"),
              "attr": {
                sqlCommand: getSQLConverter("getAllDatabases"),
              }
            };
            // 将JSON对象转换为字符串
            const jsonString = JSON.stringify(jsonObject);
            webSocketTmp.send(new Message(Message.Data, jsonString).toString());
          }, 1000); // 延迟2秒
          break;
        case Message.Data:
          if (msg['content'] === "license is out of user count") {
            message.error({ className: 'DBEditor', content: `${msg['content']}`, duration: 0, })
            isReConnect = false;
            if (reWebsocketInterval) {
              clearInterval(reWebsocketInterval);
            }
          }
          webSocketOnData(msg['content'])
          break;
        case Message.Closed:
          debugLog(`服务端通知需要关闭连接`)
          message.error({ className: 'DBEditor', content: `服务端通知需要关闭连接:` + msg['content'], duration: 0, })
          webSocketTmp.close();
          break;
        default:
          break;
      }
    }

    // setWebsocket(webSocketTmp);
    setSession(session);
    setWebSocket(webSocketTmp);
  }
  const handleUnload = (e) => {
    const message = "要离开网站吗？";
    (e || window.event).returnValue = message; //Gecko + IE
    return message;
  }

  const initAssets = async () => {
    let queryParams = {
      pageIndex: 1,
      pageSize: 10,
    }
    // if(isAdmin()){
    //   let assetsList = await assetApi.getTree(queryParams);
    //   setTreeData(assetsList.items)
    // } else {

    // }
    let assetsList = await workAssetApi.getTree(queryParams);
    setTreeData(assetsList.items)
    debugLog(" assetsList ", assetsList)
  }
  const init = async () => {
    const hash = window.location.hash.includes('#/ndbm');
    // debugLog(` ### hash`, hash)
    if (!hash) {
      setConnectionMode("single")
      initWebSocket(assetId);
    } else {
      setConnectionMode("multiple")
      initAssets();
    }
  }
  useEffect(() => {
    document.title = assetName;
    init();
  }, [assetId]);

  useEffect(() => {
    if (webSocket && webSocket.readyState === WebSocket.OPEN) {
      // fit();
      // focus();
      let terminalSize = {
        cols: 100,
        rows: 100
      }
      webSocket.send(new Message(Message.Resize, window.btoa(JSON.stringify(terminalSize))).toString());
    }
    window.addEventListener('beforeunload', handleUnload);

    let resize = debounce(() => {
      onWindowResize();
    });

    window.addEventListener('resize', resize);

    return () => {
      // if (websocket) {
      //     websocket.close();
      // }
      window.removeEventListener('resize', resize);
      window.removeEventListener('beforeunload', handleUnload);
    }
  }, [box.width, box.height]);

  useEffect(() => {
    const updateTheme = () => {
      let theme = localStorage.getItem('theme');
      const root = document.documentElement; // 获取根元素
      root.setAttribute('data-theme', theme);

      const themeColorMeta = document.querySelector('meta[name="theme-color"]');
      if (themeColorMeta) {
        if (theme === 'default') {
          themeColorMeta.setAttribute('content', '#433bbb');
        } else if (theme === 'light') {
          themeColorMeta.setAttribute('content', '#ffffff');
        } else {
          themeColorMeta.setAttribute('content', '#000000');
        }
      }
    };

    // Initial theme update
    updateTheme();

    // Set interval to check and update theme every 5 seconds (5000 ms)
    const intervalId = setInterval(updateTheme, 3000);

    // Cleanup interval on component unmount
    return () => clearInterval(intervalId);
  }, []);

  return (
    <div />
  )
}
function DBEditor() {
  const [loading, setLoading] = useState(true);
  // 监听编辑器容器的contextmenu事件
  const editorContainer = document.getElementById('container');
  editorContainer?.addEventListener('contextmenu', event => {
    // 允许Monaco Editor处理其内部的contextmenu事件
    event.stopPropagation();
  });
  document.addEventListener('contextmenu', event => {
    event.preventDefault();
  });

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 3000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="flex flex-wrap justify-center items-start w-full DBEditor">
      <VisibilityProvider>
        <WebSocketComponent />
        <MenuPanel />
        <MainPanel></MainPanel>
      </VisibilityProvider>
      <Toaster position="top-right" gutter={8} toastOptions={{ duration: 3000, }} />
      <Loading message="Loading, please wait..." loading={loading} size={40} />
    </div>
  );
}

export default DBEditor;
