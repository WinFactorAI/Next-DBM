import { AppstoreOutlined, ConsoleSqlOutlined, ContainerOutlined, DatabaseOutlined, FolderViewOutlined, FunctionOutlined, TableOutlined } from '@ant-design/icons';
import { Modal, notification, Progress, Tooltip } from 'antd';
import i18next from 'i18next';
import React, { createContext, useEffect, useRef, useState } from 'react';
import toast from 'react-hot-toast';
import { useSearchParams } from "react-router-dom";
import sqlsApi from "../../../../api/sqls";
import workCommandApi from "../../../../api/worker/command";
import workSqlsApi from "../../../../api/worker/sqls";
import { debugLog } from '../../../../common/logger.js';
import strings from "../../../../utils/strings";
import { download } from "../../../../utils/utils";
import Message from "../../../access/Message";
import * as dists from './dicts/mysql.js';
import * as utils from './index.js';
import * as mysql from './SQLConverter/mysql.js';
// import * as postgre from './SQLConverter/postgres.js';
import { WebSocketManager } from './webSocketManager';
const VisibilityContext = createContext();
const MemoTooltip = Tooltip || React.memo(Tooltip);
const VisibilityProvider = ({ children }) => {


  const [language, setLanguage] = useState();
  // 强制更新监听
  useEffect(() => {
    const handleStorageChange = (e) => {
      // debugLog('###语言发生变化，更新i18n', e.newValue);
      if (e.key === 'language' && e.newValue !== language) {
        i18next.changeLanguage(e.newValue).then(() => {
          setLanguage(e.newValue);
        });
      }
    };
    window.addEventListener('storage', handleStorageChange);
    // 保持国际化同步
    const updateTheme = () => {
      i18next.changeLanguage(localStorage.getItem('language')).then(() => {
        setLanguage(localStorage.getItem('language'));
      });
    };
    const intervalId = setInterval(updateTheme, 1000);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(intervalId);
    }
  }, [language]);
  // 动态更新宽度
  // const [width, setWidth] = useState('60%');
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth <= 768) { // 判断屏幕宽度
        // setWidth('100%');
        setTableTreePaneVisible(false);
        setIsPropertiesPanelVisible(false);
      } else {
        // setWidth('60%');
      }
    };
    window.addEventListener('resize', handleResize);
    handleResize(); // 初始时执行一次

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);
  const [webSocketManager, setWebSocketManager] = useState(new WebSocketManager());
  // const [assetId, setAssetId] = useState(null);
  // 模式编辑模式
  const SQL_EDIT_MODE = {
    EDITOR: 'editor',
    FILTER: 'fiter',
    DIFF: 'diff',
    DESIGNER: 'designer',
    VIEW: 'view',
    FUNCTION: 'function',
    PROCEDURE: 'procedure',
    ER: 'er',
  };
  const [defaultPageSize, setDefaultPageSize] = useState(20);

  const [connectionMode, setConnectionMode] = useState("single");
  const [dbNameList, setDBNameList] = useState([]);
  const [webSocket, setWebSocket] = useState(null);
  const [distMysqlCharstes, setDistMysqlCharstes] = useState('');
  const [jsonObject, setJsonObject] = useState();
  const [treeData, setTreeData] = useState([])
  const [dbVariables, setDBVariables] = useState(null)
  // 全局初始化数据

  const [qurtyValue, setCommands] = useState([])
  const [searchParams] = useSearchParams();
  const assetId = searchParams.get('assetId');
  const isWorker = searchParams.get('isWorker');
  const protocol = searchParams.get('protocol');
  const [protocolType, setProtocolType] = useState(protocol);
  const [erTabItem,setErTabItem] = useState(null)

  const sqlsGetId = async () => {

    if (strings.hasText(isWorker)) {
      let tabId = workSqlsApi.getId().then(res => {
        return res
      })
      debugLog(" tabId ", tabId)
      return tabId
    } else {
      let tabId = await sqlsApi.getId().then(res => {
        return res
      })
      debugLog(" tabId ", tabId)
      return tabId
    }
  }

  const sqlsAll = async (params) => {
    debugLog(" sqlsAll params ", params)
    let queryParams = {
      pageIndex: 1,
      pageSize: 10,
      dbAssetId: assetId,
      dbName: params.dbName,
    }
    await sqlsApi.getPaging(queryParams).then(res => {
      // debugLog("sqlsAll sqls",res)

      let sqlMenus = res.items.map(item => {
        // debugLog(" item ",item)
        return {
          id: item.id,
          key: params.key + "-" + item.id,
          title: item.name,
          dbName: item.dbName,
          icon: <ConsoleSqlOutlined />,
          menuType: "sqlMenu",
          content: item.content
        }
      })
      // 更新子节点
      const updatedTreeData = updateTreeIcons(sqlMenus);
      let newTreeData = updateNodeByKey(treeData, params.key, updatedTreeData)
      setTreeData(newTreeData);
    })
  }
  const sqlsCreateOrUpdate = async (params) => {
    params.dbAssetId = assetId
    await sqlsApi.createOrUpdate(params).then(res => {
      // debugLog("sqlsCreateOrUpdate sqls params",params)
      let tabKey = dbNameList.find(item => item.value === params.dbName)?.key + "-4";
      let allParmas = { key: tabKey, dbName: params.dbName }
      debugLog(" sqlsCreateOrUpdate allParmas ", allParmas)
      sqlsAll(allParmas)
    })
  }
  const sqlsCreate = async (params) => {
    await sqlsApi.create(params).then(res => {
      // debugLog("create sqls",res)
    })
  }
  const sqlsDetail = async (id) => {
    await sqlsApi.getById(id).then(res => {
      // debugLog("delete sqls",res)
    })
  }
  const sqlsUpdate = async (params) => {
    await sqlsApi.updateById(params.id, params).then(res => {
      // debugLog("update sqls",res)
    })
  }
  const sqlsDelete = async (params) => {
    await sqlsApi.deleteById(params.id).then(res => {
      let allParmas = { key: params.key + "-4", dbName: params.dbName }
      debugLog(" sqlsDelete allParmas ", allParmas)
      sqlsAll(allParmas)
    })
  }
  const addSqlLogs = async (sqlCommand, state, message, attrAssetId) => {
    let data = {
      assetId: attrAssetId ? attrAssetId : assetId,
      sqlCommand: sqlCommand,
      state: state ? '0' : '1',
      reason: message
    }
    // await sqlLogApi.create(data).then(res => {
    //   // debugLog("add sql-logs",res)
    // })
    return
  }
  const initialData = async () => {
    let field = '';
    let order = '';
    let queryParams = {
      pageIndex: 1,
      pageSize: 100,
      name: "",
      field: field,
      order: order
    }
    let result = await workCommandApi.getPaging(queryParams);
    // debugLog(" result command" ,result)
    setCommands(result['items'])
  }
  useEffect(() => {
    // const searchParams = new URLSearchParams(window.location.search);
    // const id = searchParams.get('assetId');
    // setAssetId(id);
    initialData();
  }, [])

  const resetLayout = () => {
    localStorage.removeItem('splitMainPanelPos')
    localStorage.removeItem('splitPredefinedPanelPos')
    localStorage.removeItem('splitSQLEditorPos')
    window.location.reload()
  }
  const percentToPx = (size, WWhight) => {
    return utils.percentToPx(size, WWhight);
  }
  const getCharsets = () => {
    return dists.getCharsets();
  }
  const getCollations = (charset) => {
    return dists.getCollations(charset);
  }
  const getColumnsType = (value) => {
    return dists.getColumnsType(value);
  }
  const getDist = (distType, params) => {
    if (distType === 'YesNo') {
      return dists.DistYesNo;
    }
    if (distType === 'Charsets') {

      let charsetsList = dists.getCharsets().map(item => {
        return {
          value: item,
          label: item
        }
      })

      return charsetsList;
    }
    if (distType === 'Collations') {
      // return dists.getCollations(params.charset);
      if (!params) {
        return []
      }
      let collationsList = dists.getCollations(params.charset).map(item => {
        return {
          value: item,
          label: item
        }
      })
      return collationsList;
    }
    if (distType === 'RowFormat') {
      return dists.RowFormat
    }
    if (distType === 'DataOptions1' || distType === 'DataOptions2') {
      return dists.DataOptions
    }
    if (distType === 'ColumnsType') {
      return dists.ColumnsType
    }
    if (distType === 'Engines') {
      return dists.Engines
    }
    if (distType === 'TableSpace') {
      return dists.TableSpace
    }
    if (distType === 'TriggerTimeType') {
      return dists.TriggerTimeType
    }
    if (distType === 'TriggerActionType') {
      return dists.TriggerActionType
    }

    if (distType === 'IndexType') {
      return dists.IndexType
    }
    if (distType === 'IndexFunction') {
      return dists.IndexFunction
    }
    if (distType === 'ForeigenKeyAction') {
      return dists.ForeigenKeyAction
    }
    if (distType === 'DefaultValue') {
      return dists.DefaultValue
    }
    if (distType === 'IndexPanelAttr') {
      return dists.IndexPanelAttr
    }
    if (distType === 'ViewPanelAttr') {
      return dists.ViewPanelAttr
    }

    if (distType === 'algorithm') {
      return dists.algorithm
    }
    if (distType === 'sqlSecurity') {
      return dists.sqlSecurity
    }
    if (distType === 'checkOptions') {
      return dists.checkOptions
    }
    if (distType === 'keywords') {
      return dists.keywords
    }
    if (distType === 'mysql-where-keywords') {
      return dists.whereKeywords
    }
    if (distType === 'mysql-orderby-keywords') {
      return dists.orderByKeywords
    }

  }
  // sql 转换器
  const getSQLConverter = (functionName, params) => {
    // console.log(" #### getSQLConverter protocolType ", protocolType);
    if (protocolType === 'MySQL' || protocolType === 'MariaDB') {
      if (functionName === 'getNow') {
        return postgre.getNow()
      }
      if (functionName === 'selectTableData') {
        return mysql.selectTableData(params)
      }
      if (functionName === 'getVariables') {
        return mysql.getAllVariables()
      }
      if (functionName === 'getTableDDL') {
        return mysql.getTableDDL(params)
      }
      if (functionName === 'createDatabase') {
        return mysql.createDatabase(params);
      }
      if (functionName === 'dropDatabase') {
        return mysql.dropDatabase(params);
      }


      if (functionName === 'createTable') {
        return mysql.createTable(params);
      }
      if (functionName === 'parseCreateTableSql') {
        return mysql.parseCreateTableSql(params);
      }
      if (functionName === 'alterTable') {
        return mysql.alterTable(params);
      }
      if (functionName === 'truncateTable') {
        return mysql.truncateTable(params);
      }
      if (functionName === 'copyTable') {
        return mysql.copyTable(params);
      }
      if (functionName === 'dropTable') {
        return mysql.dropTable(params);
      }
      if (functionName === 'renameTable') {
        return mysql.renameTable(params);
      }


      if (functionName === 'createView') {
        return mysql.createView(params);
      }
      if (functionName === 'createFunction') {
        return mysql.createFunction(params);
      }
      if (functionName === 'createProcedure') {
        return mysql.createProcedure(params);
      }
      if (functionName === 'getAllDatabases') {
        return mysql.getAllDatabases();
      }
      if (functionName === 'getAlltablesMenu' || functionName === 'getAlltables') {
        return mysql.getAllTables(params);
      }
      if (functionName === 'getAllcolumnsMenu' || functionName === 'getAllcolumns') {
        return mysql.getAllColumns(params);
      }
      if (functionName === 'getAllkeysMenu') {
        return mysql.getAllKeys(params);
      }
      if (functionName === 'getAllindexsMenu') {
        return mysql.getAllIndexs(params);
      }
      if (functionName === 'getAllviewsMenu') {
        return mysql.getAllViews(params);
      }
      if (functionName === 'getAllfunctionsMenu') {
        return mysql.getAllFunctions(params);
      }
      if (functionName === 'getAllproceduresMenu') {
        return mysql.getAllProcedures(params);
      }
      if (functionName === 'getAllsqlsMenu') {
        return mysql.getAllSqls(params);
      }

      if (functionName === 'dropView') {
        return mysql.dropView(params);
      }
      if (functionName === 'dropFunction') {
        return mysql.dropFunction(params);
      }
      if (functionName === 'dropProcedure') {
        return mysql.dropProcedure(params);
      }

      if (functionName === 'deleteRow') {
        return mysql.deleteRow(params);
      }
      if (functionName === 'insertRow') {
        return mysql.insertRow(params);
      }
      if (functionName === 'updateRow') {
        return mysql.updateRow(params);
      }
    }
    if (protocolType === 'PostgreSQL') {
      if (functionName === 'getNow') {
        return postgre.getNow()
      }
      if (functionName === 'selectTableData') {
        return postgre.selectTableData(params)
      }
      if (functionName === 'getVariables') {
        return postgre.getAllVariables()
      }
      if (functionName === 'getTableDDL') {
        return postgre.getTableDDL(params)
      }
      if (functionName === 'createDatabase') {
        return postgre.createDatabase(params);
      }
      if (functionName === 'dropDatabase') {
        return postgre.dropDatabase(params);
      }


      if (functionName === 'createTable') {
        return postgre.createTable(params);
      }
      if (functionName === 'parseCreateTableSql') {
        return postgre.parseCreateTableSql(params);
      }
      if (functionName === 'alterTable') {
        return postgre.alterTable(params);
      }
      if (functionName === 'truncateTable') {
        return postgre.truncateTable(params);
      }
      if (functionName === 'copyTable') {
        return postgre.copyTable(params);
      }
      if (functionName === 'dropTable') {
        return postgre.dropTable(params);
      }
      if (functionName === 'renameTable') {
        return postgre.renameTable(params);
      }


      if (functionName === 'createView') {
        return postgre.createView(params);
      }
      if (functionName === 'createFunction') {
        return postgre.createFunction(params);
      }
      if (functionName === 'createProcedure') {
        return postgre.createProcedure(params);
      }
      if (functionName === 'getAllDatabases') {
        return postgre.getAllDatabases();
      }
      if (functionName === 'getAlltablesMenu' || functionName === 'getAlltables') {
        return postgre.getAllTables(params);
      }
      if (functionName === 'getAllcolumnsMenu' || functionName === 'getAllcolumns') {
        return postgre.getAllColumns(params);
      }
      if (functionName === 'getAllkeysMenu') {
        return postgre.getAllKeys(params);
      }
      if (functionName === 'getAllindexsMenu') {
        return postgre.getAllIndexs(params);
      }
      if (functionName === 'getAllviewsMenu') {
        return postgre.getAllViews(params);
      }
      if (functionName === 'getAllfunctionsMenu') {
        return postgre.getAllFunctions(params);
      }
      if (functionName === 'getAllproceduresMenu') {
        return postgre.getAllProcedures(params);
      }
      if (functionName === 'getAllsqlsMenu') {
        return postgre.getAllSqls(params);
      }

      if (functionName === 'dropView') {
        return postgre.dropView(params);
      }
      if (functionName === 'dropFunction') {
        return postgre.dropFunction(params);
      }
      if (functionName === 'dropProcedure') {
        return postgre.dropProcedure(params);
      }

      if (functionName === 'deleteRow') {
        return postgre.deleteRow(params);
      }
      if (functionName === 'insertRow') {
        return postgre.insertRow(params);
      }
      if (functionName === 'updateRow') {
        return postgre.updateRow(params);
      }
    }
  }

  const updateTreeIcons = (data) => {
    return data.map(item => {
      // 更新当前节点的图标
      const updatedItem = {
        ...item,
        icon: getIcon(item.menuType)
      };

      // 如果有子节点，递归调用以更新子节点的图标
      if (item.children && item.children.length > 0) {
        updatedItem.children = updateTreeIcons(item.children);
      }

      return updatedItem;
    });
  };

  const getTableRsesultFormat = (infoStore) => {
    let tableHeaders = [];
    let tableRows = [];
    if (infoStore === null) {
      return { tableHeaders, tableRows };
    }
    for (var i = 0; i < infoStore.length; i++) {
      const row = infoStore[i];
      if (i === 0) {
        for (const item in row) {
          tableHeaders.push(row[item]);
        }
      } else {
        let temp = [];
        for (const item in row) {
          temp.push(row[item]);
        }
        tableRows.push(temp);
      }
    }
    return { tableHeaders, tableRows };
  }

  useEffect(() => {
    if (jsonObject) {
      const jsonObjectTmp = JSON.parse(jsonObject);
      if (!jsonObjectTmp.data) {
        toast(jsonObjectTmp.msg + ",返回结果为空", {
          // icon: <InfoCircleFilled style={{color: '#6d88ff'  ,fontSize: '20px',fontWeight: 'bold'}}/>,
          icon: <svg t="1723783672953" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="4428" width="25" height="25"><path d="M512.122285 65.828264c-246.61884 0-446.5258 199.906959-446.5258 446.582081 0 246.562559 199.906959 446.468494 446.5258 446.468494s446.524776-199.906959 446.524776-446.468494C958.647061 265.735224 758.741126 65.828264 512.122285 65.828264zM572.921 781.215488 451.265242 781.215488 451.265242 421.097664l121.655757 0L572.921 781.215488zM572.921 365.090069 451.265242 365.090069 451.265242 243.434312l121.655757 0L572.921 365.090069z" p-id="4429" fill="#6d88ff"></path></svg>
        })
        // 使用 custom 方法来自定义提示信息
        return
      }
      debugLog(" #### jsonObjectTmp.attr ", jsonObjectTmp.attr);

      switch (jsonObjectTmp.retType) {
        case 'erJsonResult':
           {
              // console.log(" jsonObjectTmp erJsonResult ",jsonObjectTmp)
              const keys = jsonObjectTmp.key 
              // const tabItme = getTabByID(keys);
              // setTabAttrProp(tabItme, "erUrl", jsonObjectTmp.attr.download);
              // setErTabItem(tabItme)
              addTab({
                  key: keys,
                  title: jsonObjectTmp.attr.database,
                  type:SQL_EDIT_MODE.ER,
                  assetId:jsonObjectTmp.attr.assetId,
                  dbName: jsonObjectTmp.attr.database,
                  erUrl : jsonObjectTmp.attr.download
              });
              setTabIndex(keys)
              break
           }
         
        case 'importDatabaseJsonResult':
          // debugLog(" jsonObjectTmp doImport ",jsonObjectTmp)
          if (jsonObjectTmp.key.includes("-Import")) {
            setTimeout(() => {
              doImport(jsonObjectTmp.key,
                'saveFile',
                jsonObjectTmp.attr.title,
                jsonObjectTmp.attr.content,
                jsonObjectTmp.attr.database);
            }, 1000);
            setTimeout(() => {
              doImport(jsonObjectTmp.key,
                'finish',
                jsonObjectTmp.attr.title,
                jsonObjectTmp.attr.content,
                jsonObjectTmp.attr.database);
            }, 2000);
          }
          break
        case 'exportDatabaseOnlyStructJsonResult':
        case 'exportDatabaseStructDataJsonResult':
          if (jsonObjectTmp.key.includes("-Export-onlyStruct")) {
            setTimeout(() => {
              doExport(jsonObjectTmp.key,
                'saveFile',
                jsonObjectTmp.attr.title,
                jsonObjectTmp.attr.content,
                jsonObjectTmp.attr.database,
                jsonObjectTmp.attr.download);
            }, 1000);
            setTimeout(() => {
              doExport(jsonObjectTmp.key,
                'finish',
                jsonObjectTmp.attr.title,
                jsonObjectTmp.attr.content,
                jsonObjectTmp.attr.database,
                jsonObjectTmp.attr.download);
            }, 2000);
          }
          if (jsonObjectTmp.key.includes("-Export-structData")) {
            setTimeout(() => {
              doExport(jsonObjectTmp.key,
                'saveFile',
                jsonObjectTmp.attr.title,
                jsonObjectTmp.attr.content,
                jsonObjectTmp.attr.database,
                jsonObjectTmp.attr.download);
            }, 1000);
            setTimeout(() => {
              doExport(jsonObjectTmp.key,
                'finish',
                jsonObjectTmp.attr.title,
                jsonObjectTmp.attr.content,
                jsonObjectTmp.attr.database,
                jsonObjectTmp.attr.download);
            }, 2000);
          }
          break

        case 'exportTableOnlyStructJsonResult':
        case 'exportTableStructDataJsonResult':
          if (jsonObjectTmp.key.includes("-Export-onlyStruct")) {
            setTimeout(() => {
              doExport(jsonObjectTmp.key,
                'saveFile',
                jsonObjectTmp.attr.title,
                jsonObjectTmp.attr.content,
                jsonObjectTmp.attr.database + '.' + jsonObjectTmp.attr.table,
                jsonObjectTmp.attr.download);
            }, 1000);
            setTimeout(() => {
              doExport(jsonObjectTmp.key,
                'finish',
                jsonObjectTmp.attr.title,
                jsonObjectTmp.attr.content,
                jsonObjectTmp.attr.database + '.' + jsonObjectTmp.attr.table,
                jsonObjectTmp.attr.download);
            }, 2000);
          }
          if (jsonObjectTmp.key.includes("-Export-structData")) {
            setTimeout(() => {
              doExport(jsonObjectTmp.key,
                'saveFile',
                jsonObjectTmp.attr.title,
                jsonObjectTmp.attr.content,
                jsonObjectTmp.attr.database + '.' + jsonObjectTmp.attr.table,
                jsonObjectTmp.attr.download);
            }, 1000);
            setTimeout(() => {
              doExport(jsonObjectTmp.key,
                'finish',
                jsonObjectTmp.attr.title,
                jsonObjectTmp.attr.content,
                jsonObjectTmp.attr.database + '.' + jsonObjectTmp.attr.table,
                jsonObjectTmp.attr.download);
            }, 2000);
          }
          break
        case 'KeyValueJsonResult':
          // 获取DB变量信息
          if (jsonObjectTmp.key.includes('-getVariables')) {
            if (jsonObjectTmp.data.version_comment !== undefined){
              setDbInfo(jsonObjectTmp.data.version_comment + " " + jsonObjectTmp.data.version)
            }
            if (jsonObjectTmp.data.version_compile_os !== undefined){
              setOsInfo(jsonObjectTmp.data.version_compile_os + " " + jsonObjectTmp.data.version_compile_machine)
            }
            if (jsonObjectTmp.data !== undefined){
              setDBVariables(jsonObjectTmp.data)
            }
          } else if (jsonObjectTmp.key.includes("-getTableDDL")) {
            // 获取表DDL信息
            // toast.success("表DDL信息");
            Object.keys(jsonObjectTmp.data).forEach(key => {
              setDdlValue(jsonObjectTmp.data[key]);
            });
          } else if (jsonObjectTmp.key.includes("-renameTable")) {
            // 表重命名
            const key = jsonObjectTmp.key.replace("-renameTable", "");
            toast.success("表重命名成功");
            updateTreeNode(key, currentNode => ({
              title: jsonObjectTmp.attr.newName
            }));
          } else if (jsonObjectTmp.key.includes("-getDiffTableDDL")) {
            // 获取表DDL信息
            // toast.success("表DDL信息");
            // debugLog(" #### jsonObjectTmp.data",jsonObjectTmp);


            // jsonObjectTmp.attr.dataType
            // jsonObjectTmp.attr.key
            // setDdlValue(jsonObjectTmp.data);
            const newTabs = tabs.map((tab) => {
              if (tab.id === jsonObjectTmp.attr.tabId) {
                // debugLog(" #### jsonObjectTmp.data ",jsonObjectTmp.data);
                Object.keys(jsonObjectTmp.data).forEach(key => {

                  if (jsonObjectTmp.attr.dataType == 'srcObj') {
                    // debugLog(" #### tab ",tab);
                    tab.srcObj = (tab.srcObj || '') + "\r\n\r\n" + jsonObjectTmp.data[key]
                    setTabAttrProp(tab, jsonObjectTmp.attr.dataType, tab.srcObj);
                  } else if (jsonObjectTmp.attr.dataType == 'distObj') {
                    tab.distObj = (tab.distObj || '') + "\r\n\r\n" + jsonObjectTmp.data[key]
                    setTabAttrProp(tab, jsonObjectTmp.attr.dataType, tab.distObj);
                  }

                  //  添加获取处理结果
                  const currentResults = tab.results || [];
                  const result = {
                    tabKey: jsonObjectTmp.key,
                    status: jsonObjectTmp.code == 0 ? 'success' : 'fail',
                    msg: jsonObjectTmp.msg,
                    attr: jsonObjectTmp.attr
                  };
                  setTabResults([...currentResults, result]);
                });
                return tab;
              }
              return tab;
            });
            setTabs(newTabs);
          }

          if (jsonObjectTmp.key.includes("-createTable")) {
            toast.success("创建" + jsonObjectTmp.attr.tableName + "成功");
            const key = jsonObjectTmp.key.replace("-createTable", "");
            const tablesMenuSql = getSQLConverter("getAlltablesMenu", {
              database: jsonObjectTmp.attr.database,
            })
            webSocketSendData({
              "key": key,
              "retType": 'tablesMenu',
              "data": tablesMenuSql,
              "attr": {
                timestamp: new Date().getTime(),
                sqlCommand: tablesMenuSql
              }
            });
          }
          if (jsonObjectTmp.key.includes("-dropTable")) {
            // 删除表
            const key = jsonObjectTmp.key.replace("-dropTable", "");
            toast.success("删除" + jsonObjectTmp.attr.tableName + "成功");
            deleteTreeNode(key)
          }
          if (jsonObjectTmp.key.includes("-alterTable")) {
            // toast.success("修改"+jsonObjectTmp.attr.tableName+"成功");
            // const key = jsonObjectTmp.key.replace("-alterTable", "");
            // debugLog(" ## jsonObjectTmp ",jsonObjectTmp)
            Object.keys(jsonObjectTmp.data).forEach(key => {
              // setDdlValue(jsonObjectTmp.data[key]);
              const newTabs = tabs.map((tab) => {
                if (tab.id === jsonObjectTmp.key) {
                  let tableStructs = getSQLConverter('parseCreateTableSql', { sql: jsonObjectTmp.data[key] })
                  // debugLog(" ### tableStructs ",tableStructs)
                  setTabAttrProp(tab, "ddl", jsonObjectTmp.data[key]);
                  return setTabAttrProp(tab, "tableStructs", tableStructs);
                }
                return tab;
              });
              setTabs(newTabs);
            });
          }


          if (jsonObjectTmp.key.includes("-createView")) {
            toast.success("创建" + jsonObjectTmp.attr.viewName + "成功");
            const key = jsonObjectTmp.key.replace("-createView", "");
            const viewsMenuSql = getSQLConverter("getAllviewsMenu", {
              database: jsonObjectTmp.attr.database,
            })
            webSocketSendData({
              "key": key,
              "retType": 'viewsMenu',
              "data": viewsMenuSql,
              "attr": {
                timestamp: new Date().getTime(),
                sqlCommand: viewsMenuSql
              }
            });
          }
          if (jsonObjectTmp.key.includes("-dropView")) {
            // 删除视图
            const key = jsonObjectTmp.key.replace("-dropView", "");
            toast.success("删除" + jsonObjectTmp.attr.viewName + "成功");
            deleteTreeNode(key)
          }

          if (jsonObjectTmp.key.includes("-createFunction")) {
            toast.success("创建" + jsonObjectTmp.attr.functionName + "成功");
            const key = jsonObjectTmp.key.replace("-createFunction", "");
            const functionsMenuSql = getSQLConverter("getAllfunctionsMenu", {
              database: jsonObjectTmp.attr.database,
            })
            webSocketSendData({
              "key": key,
              "retType": 'functionsMenu',
              "data": functionsMenuSql,
              "attr": {
                timestamp: new Date().getTime(),
                sqlCommand: functionsMenuSql
              }
            });
          }
          if (jsonObjectTmp.key.includes("-dropFunction")) {
            // 删除函数
            const key = jsonObjectTmp.key.replace("-dropFunction", "");
            toast.success("删除" + jsonObjectTmp.attr.functionName + "成功");
            deleteTreeNode(key)
          }

          if (jsonObjectTmp.key.includes("-createProcedure")) {
            toast.success("创建" + jsonObjectTmp.attr.functionName + "成功");
            const key = jsonObjectTmp.key.replace("-createProcedure", "");
            const proceduresMenuSql = getSQLConverter("getAllproceduresMenu", {
              database: jsonObjectTmp.attr.database,
            })
            webSocketSendData({
              "key": key,
              "retType": 'proceduresMenu',
              "data": proceduresMenuSql,
              "attr": {
                timestamp: new Date().getTime(),
                sqlCommand: proceduresMenuSql
              }
            });
          }
          if (jsonObjectTmp.key.includes("-dropProcedure")) {
            // 删除存储过程
            const key = jsonObjectTmp.key.replace("-dropProcedure", "");
            toast.success("删除" + jsonObjectTmp.attr.procedureName + "成功");
            deleteTreeNode(key)
          }

          if (jsonObjectTmp.key.includes("-deleteRow")) {
            toast.success("删除成功");
          }
          if (jsonObjectTmp.key.includes("-insertRow")) {
            toast.success("插入成功");
          }
          if (jsonObjectTmp.key.includes("-updateRow")) {
            toast.success("修改成功");
          }

          break;
        case 'executeResult':

          //执行完相关操作自动获取最新的库信息
          let sql = getSQLConverter("getAllDatabases")
          webSocketSendData({
            "key": "0001" + new Date().getTime(),
            "retType": 'databaseMenu',
            "data": sql,
            "attr": {
              timestamp: new Date().getTime(),
              sqlCommand: sql
            }
          });
          break;
        case 'getVariables':

          break;
        case 'tableRsesult':
          const keys = jsonObjectTmp.key.split('-')
          // const tabId = keys[0];
          // const newTabIndex = keys[1];
          jsonObjectTmp.attr.useTime = ((new Date().getTime() - jsonObjectTmp.attr.timestamp) / 1000).toFixed(3)
          const tabId = jsonObjectTmp.attr.tabId;
          const newTabIndex = jsonObjectTmp.attr.newTabIndex;
          // debugLog(" tabId ",tabId)
          // debugLog(" newTabIndex ",newTabIndex)

          const tabItem = getTabByID(tabId)
          if (tabItem.type === SQL_EDIT_MODE.EDITOR) {
            const currentResults = tabItem.results
            // 成功处理结果
            if (jsonObjectTmp.code == 0) {
              const { tableHeaders, tableRows } = getTableRsesultFormat(jsonObjectTmp.data);
              const existingIndex = currentResults.findIndex(item => item.key === newTabIndex);
              if (existingIndex !== -1) {
                // 如果存在相同的 key，则更新对应的项
                currentResults[existingIndex] = {
                  ...currentResults[existingIndex],
                  tabKey: jsonObjectTmp.key,
                  query: keys,
                  key: newTabIndex,
                  label: '查询结果' + String(newTabIndex),
                  status: 'success',
                  headers: tableHeaders,
                  rows: tableRows,
                  csvData: [],
                  attr: jsonObjectTmp.attr
                };
              } else {
                currentResults.push({
                  label: '查询结果' + String(newTabIndex),
                  status: 'success',
                  tabKey: jsonObjectTmp.key,
                  key: newTabIndex,
                  query: keys,
                  headers: tableHeaders,
                  rows: tableRows,
                  csvData: [],
                  attr: jsonObjectTmp.attr
                });
              }
            } else {
              currentResults.push({
                tabKey: jsonObjectTmp.key,
                label: '查询结果' + String(newTabIndex),
                status: 'fail',
                msg: jsonObjectTmp.msg,
                key: newTabIndex,
                query: newTabIndex,
                headers: [],
                rows: [],
                csvData: [],
                attr: jsonObjectTmp.attr
              });
            }
            setTabResults(currentResults);
            setTabQuery(jsonObjectTmp.attr.sqlCommand)
            addHistoryQueryList(jsonObjectTmp.attr.sqlCommand, jsonObjectTmp.code == 0 ? "成功" : "失败", jsonObjectTmp.msg)
          }
          if (tabItem.type === SQL_EDIT_MODE.FILTER) {
            const currentResults = []
            const { tableHeaders, tableRows } = getTableRsesultFormat(jsonObjectTmp.data);
            currentResults.push({
              tabKey: jsonObjectTmp.key,
              key: jsonObjectTmp.key,
              query: jsonObjectTmp.key,
              label: '查询结果' + String(newTabIndex),
              status: 'success',
              headers: tableHeaders,
              rows: tableRows,
              csvData: [],
              attr: jsonObjectTmp.attr
            });
            setTabResults(currentResults);
          }
          // 依赖下个请求
          debugLog(" ###### jsonObjectTmp.attr ", jsonObjectTmp.attr)

          if (jsonObjectTmp.attr.nextAction == 'getTableStruct') {
            debugLog(" ### jsonObjectTmp.attr.nextAction ")
            const sqlStr = getSQLConverter("getAllcolumns", { database: tabItem.dbName, tableName: tabItem.tableName })
            webSocketSendData({
              "key": "tab-getAllcolumns",
              "retType": "tableStruct",
              "data": sqlStr,
              "attr": {
                database: tabItem.dbName,
                tableName: tabItem.tableName,
                timestamp: new Date().getTime(),
                sqlCommand: sqlStr,
              }
            });
          }
          break;
        case 'tableStruct':
          debugLog(" jsonObjectTmp.data.length " + jsonObjectTmp.data.length)
          // 更新表结构
          setTableStruct(jsonObjectTmp.data);
          break;
        case 'databaseMenu':
          if (jsonObjectTmp.attr.assetId) {
            debugLog(" jsonObjectTmp.attr.assetId " + jsonObjectTmp.attr.assetId)
            // 多资产接入
            const updatedTreeData = updateTreeIcons(jsonObjectTmp.data);
            let newTreeData = updateNodeByKey(treeData, jsonObjectTmp.attr.assetId, updatedTreeData)
            setTreeData(newTreeData);
            // 更新数据库名称列表
            const dbNameListTmp = updatedTreeData.map(item => {
              return {
                value: item.title,
                label: item.title,
                key: item.key
              }
            });
            setDBNameList(dbNameListTmp)
          } else {
            // 单资产接入
            const updatedDatabaseMenu = updateTreeIcons(jsonObjectTmp.data);
            setTreeData(updatedDatabaseMenu);
            // 更新数据库名称列表
            const dbNameListTmp = updatedDatabaseMenu.map(item => {
              return {
                value: item.title,
                label: item.title,
                key: item.key
              }
            });
            setDBNameList(dbNameListTmp)
          }
          break;
        case 'tablesMenu':
        case 'viewsMenu':
        case 'functionsMenu':
        case 'proceduresMenu':
        case 'sqlsMenu':
          // 更新子节点
          const updatedTreeData = updateTreeIcons(jsonObjectTmp.data);
          let newTreeData = updateNodeByKey(treeData, jsonObjectTmp.key, updatedTreeData)
          setTreeData(newTreeData);
        case 'tableMenu':
          // 更新子节点
          const updatedTableMenu = updateTreeIcons(jsonObjectTmp.data);;
          let newTreeDataTableMenu = updateNodeByKey(treeData, jsonObjectTmp.key, updatedTableMenu);
          setTreeData(newTreeDataTableMenu);
          break;
        case 'columnsMenu':
          const updatedData = jsonObjectTmp.data.map(item => {
            return {
              ...item,
              icon: getIcon(item.menuType),
              title: (
                <MemoTooltip title={item.attr.Type} placement="right" color='#6366f1' size="small" fresh>
                  <span className='table-columns'>{item.attr.Field} <span className='text-xs ml-1'>{item.attr.Type}</span></span>
                </MemoTooltip>
              ) // 提供一个默认的 title 以防止空值
            };
          });
          let newTreeDataColumnsMenu = updateNodeByKey(treeData, jsonObjectTmp.key, updatedData);
          setTreeData(newTreeDataColumnsMenu);
          break;
        case 'keysMenu':
          const updatedKeysMenu = updateTreeIcons(jsonObjectTmp.data);;
          let newTreeDataKeysMenu = updateNodeByKey(treeData, jsonObjectTmp.key, updatedKeysMenu);
          setTreeData(newTreeDataKeysMenu);
          break;
        case 'indexsMenu':
          const updatedIndexsMenu = updateTreeIcons(jsonObjectTmp.data);;
          let newTreeDataIndexsMenu = updateNodeByKey(treeData, jsonObjectTmp.key, updatedIndexsMenu);
          setTreeData(newTreeDataIndexsMenu);
          break;
        default:
          break;
      }
    }
  }, [jsonObject]);

  // const webSocketSendData = (jsonObject) => {
  //   // const jsonObject = {
  //   //   "key": "0001",
  //   //   "data":"select * from sys_temp;"
  //   // };
  //   // 将JSON对象转换为字符串
  //   const jsonString = JSON.stringify(jsonObject);
  //   webSocket.send(new Message(Message.Data, jsonString).toString());
  // }

  const webSocketSendData = (data) => {
    if (connectionMode === "multiple") {
      debugLog(" ####  multiple ", data)
      debugLog(" ####  multiple data.assetId ", data.attr.assetId)
      // data.attr.assetId = assetId
      debugLog(" #### webSocketManager ", webSocketManager.printData())
      webSocketManager.sendData(data.attr.assetId, data);
    } else if (connectionMode === "single") {
      // 确保这个函数返回一个 Promise
      return new Promise((resolve, reject) => {
        // WebSocket 发送数据逻辑
        if (webSocket.readyState === WebSocket.OPEN) {
          // data.attr.assetId = assetId
          webSocket.send(new Message(Message.Data, JSON.stringify(data)).toString());
          resolve(); // 发送完成后调用 resolve
        } else {
          reject(new Error('WebSocket not open'));
        }
      });
    }
  }

  let buffer = ''; // 用于缓存未完成的数据包
  let attempts = 0; // 记录尝试组合数据包的次数

  const isJsonString = (str) => {
    try {
      JSON.parse(str);
    } catch (e) {
      return false;
    }
    return true;
  };
  // 服务端返回数据处理
  const webSocketOnData = (data) => {
    if (isJsonString(data)) {
      const jsonObjectTmp = JSON.parse(data);
      addSqlLogs(jsonObjectTmp.attr?.sqlCommand, jsonObjectTmp.code !== 0, jsonObjectTmp.msg, jsonObjectTmp.attr?.assetId);
    }
    if (isJsonString(data)) {
      const jsonObjectTmp = JSON.parse(data);
      // jsonObjectTmp.retType !== 'tableRsesult' &&
      if (jsonObjectTmp.retType !== 'tableRsesult' && jsonObjectTmp.code != 0 && jsonObjectTmp.retType !== 'tableStruct') {
        // 导入SQL错误提示
        if (jsonObjectTmp.retType === 'importDatabaseJsonResult') {
          doImport(jsonObjectTmp.key,
            'error',
            jsonObjectTmp.attr.title,
            jsonObjectTmp.attr.content + jsonObjectTmp.msg,
            jsonObjectTmp.attr.database);
        } else {
          toast.error(jsonObjectTmp.msg + " code = " + jsonObjectTmp.code);
        }
        return
      }
    }
    // 将新数据添加到缓存中
    buffer += data;
    // 检查缓存中的数据是否为有效的 JSON 字符串
    if (isJsonString(buffer)) {
      // 如果是有效的 JSON 字符串，则处理并清空缓存
      setJsonObject(buffer);
      buffer = '';
      attempts = 0; // 重置尝试计数器
    } else {
      // 如果不是有效的 JSON 字符串，增加尝试计数器
      attempts++;
      // 如果尝试次数超过最大限制，则抛出错误
      if (attempts > 5) {
        console.error('Exceeded maximum number of attempts to form a valid JSON message.');
        buffer = ''; // 清空缓存
        attempts = 0; // 重置尝试计数器
      }
    }
  }

  webSocketManager.setGetSQLConverter(getSQLConverter);
  webSocketManager.setWebSocketOnData(webSocketOnData);
  // 全局数据

  const [databaseList, setDatabaseList] = useState([{
    value: '',
    label: '',
  }, {
    value: 'abm',
    label: 'abm数据库',
  }, {
    value: 'test',
    label: 'test数据库',
  }, {
    value: 'test1',
    label: 'test1数据库',
  }]);
  const [tableList, setTableList] = useState([{
    value: '',
    label: '',
  }, {
    database: 'abm',
    value: 'abmTable',
    label: 'abmTable表',
  }, {
    database: 'abm',
    value: 'abmTable1',
    label: 'abmTable1表',
  }, {
    database: 'abm',
    value: 'abmTable2',
    label: 'abmTable2表',
  }, {
    database: 'test',
    value: 'testTable',
    label: 'testTable表',
  }, {
    database: 'test1',
    value: 'test1Table',
    label: 'test1Table表',
  }]);
  const [columnList, setColumnList] = useState([{
    value: '',
    label: '',
  }, {
    database: 'abm',
    table: 'abmTable',
    value: 'abmColumn',
    label: 'abmColumn列',
  }, {
    database: 'abm',
    table: 'abmTable',
    value: 'abmColumn1',
    label: 'abmColumn1列',
  }, {
    database: 'abm',
    table: 'abmTable',
    value: 'abmColumn2',
    label: 'abmColumn2列',
  }, {
    database: 'test',
    table: 'testTable',
    value: 'testColumn',
    label: 'testColumn列',
  }, {
    database: 'test1',
  }]);

  // 根据 menuType 返回相应的图标组件
  const getIcon = (menuType) => {
    switch (menuType) {
      case 'databaseMenu':
        return <DatabaseOutlined />;
      case 'tablesMenu':
        return <AppstoreOutlined />;
      case 'tableMenu':
        return <TableOutlined />;


      case 'viewsMenu':
        return <FolderViewOutlined />;
      case 'viewMenu':
        return <FolderViewOutlined />;

      case 'functionsMenu':
        return <FunctionOutlined />;
      case 'functionMenu':
        return <FunctionOutlined />;

      case 'proceduresMenu':
        return <ContainerOutlined />;
      case 'procedureMenu':
        return <ContainerOutlined />;

      case 'sqlsMenu':
        return <ConsoleSqlOutlined />;
      case 'sqlMenu':
        return <ConsoleSqlOutlined />;
      default:
        return null; // 或者返回一个默认图标
    }
  };

  // 更新数据中的每个节点，添加图标
  const addIconsToData = (data) => {
    return data.map(node => ({
      ...node,
      icon: getIcon(node.menuType),
      children: node.children ? addIconsToData(node.children) : [], // 递归处理子节点
    }));
  };
  const updateNodeFn = (node, newData) => {
    return { ...node, children: newData };
  }
  // 更新指定 key 的节点
  const updateNodeByKey = (data, key, newData) => {
    return data.map(node => {
      if (node.key === key) {
        // return updateNodeFn(node,newData);
        return { ...node, children: newData }
      }
      if (node.children) {
        return { ...node, children: updateNodeByKey(node.children, key, newData) };
      }
      return node;
    });
  };

  const [value, setValue] = useState("");
  const [defaults, setDefaults] = useState(1);

  // 历史查询
  const [historyQueryList, setHistoryQueryList] = useState([]);

  // 添加查询到历史记录
  const addHistoryQueryList = (query, status, msg) => {
    setHistoryQueryList([{
      query: query,
      default: 1,
      remark: "查询所有客户信息",
      timestamp: new Date().toLocaleString(),
      status: status,
      msg: msg
    }, ...historyQueryList]);
  }
  // 从历史记录中删除查询
  const delHistoryQueryList = (queryToRemove) => {
    setHistoryQueryList(historyQueryList.filter(query => query !== queryToRemove));
  }

  // UI面板布局
  const [mainPanel, setMainPanel] = useState('30%,30%,40%');

  const [isVisible, setIsVisible] = useState(true);
  const [isTableTreePanelVisible, setTableTreePaneVisible] = useState(true);
  const [isPropertiesPanelVisible, setIsPropertiesPanelVisible] = useState(true);
  const [isCmdPaneVisible, setIsCmdPaneVisible] = useState(true);
  const [isHistoryPaneVisible, setIsHistoryPaneVisible] = useState(true);
  const [isDDLPaneVisible, setIsDDLPaneVisible] = useState(true);

  const [isAboutModal, setShowAboutModal] = useState(false);
  const [isKeyBoardModalVisible, setIsKeyBoardModalVisible] = useState(false);
  const [isCreateDatabaseModalVisible, setShowCreateDatabaseModalVisible] = useState(false);

  const [renameModalObj, setRenameModalObj] = useState({});
  const [isRenameModalVisible, setShowRenameModalVisible] = useState(false);

  const [isTableRenameModalVisible, setShowTableRenameModalVisible] = useState(false);
  const [isTabNameVisible, setIsTabNameVisible] = useState(false);

  const [importSQLFileModalObj, setImportSQLFileModalObj] = useState({});
  const [exportSQLFileModalObj, setExportSQLFileModalObj] = useState({});
  const [isImportSQLFileModalVisible, setShowImportSQLFileModalVisible] = useState(false);
  const [isExportSQLFileModalVisible, setShowExportSQLFileModalVisible] = useState(false);

  const [confirmModal, confirmModalContextHolder] = Modal.useModal();
  const showConfirmModal = (title, content, icon, callback) => {
    confirmModal.confirm({
      size: 'small',
      closable: true,
      centered: false,
      title: title,
      icon: icon,
      content: content,
      okText: '确认',
      cancelText: '取消',
      onOk() {
        callback(true)
      },
      onCancel() {
        callback(false)
      }
    });

  };
  // 主面板历史状态
  const getMainPanelSize = (defSize, index) => {
    const splitMainPanelPos = localStorage.getItem('splitMainPanelPos')
    if (splitMainPanelPos) {
      return splitMainPanelPos.split(',')[index];
    } else {
      return defSize
    }
  }

  const [tableTreePanelSize, setTableTreePanelSize] = useState(getMainPanelSize('20%', 0))
  const [tabBoxPanelSize, setTabBoxPanelSize] = useState(getMainPanelSize('40%', 1))
  const [propertiesPanelSize, setPropertiesPanelSize] = useState(getMainPanelSize('20%', 2))

  // 属性面板历史状态
  const getPropertiesPanelSize = (defSize, index) => {
    const splitPredefinedPanelPos = localStorage.getItem('splitPredefinedPanelPos')
    if (splitPredefinedPanelPos) {
      return splitPredefinedPanelPos.split(',')[index];
    } else {
      return defSize
    }
  }

  const [libraryPanelSize, setLibraryPanelSize] = useState(getPropertiesPanelSize('30%', 0))
  const [dDLPanelSize, setDDLPanelSize] = useState(getPropertiesPanelSize('30%', 1))
  const [historyPanelSize, setHistoryPanelSize] = useState(getPropertiesPanelSize('40%', 2))


  const [libraryPanelSizePx, setLibraryPanelSizePx] = useState(utils.percentToPx(libraryPanelSize, window.innerHeight))
  const [dDLPanelSizePx, setDDLPanelSizePx] = useState(utils.percentToPx(dDLPanelSize, window.innerHeight))
  const [historyPanelSizePx, setHistoryPanelSizePx] = useState(utils.percentToPx(historyPanelSize, window.innerHeight))

  // 临时变量
  const [sqlEditorWidth, setSqlEditorWidth] = useState(window.innerWidth - (utils.percentToPx(tableTreePanelSize, window.innerHeight) + utils.percentToPx(propertiesPanelSize, window.innerHeight)));
  // 主框架大小变化事件
  const changeMainPanelSize = (size, WWhight) => {
    localStorage.setItem('splitMainPanelPos', size);

    const WWidth = window.innerWidth;
    const firstPaneWidth = utils.percentToPx(size[0], WWhight);
    const threadPaneWidth = utils.percentToPx(size[2], WWhight);
    // setSqlEditorWidth(window.innerWidth - (firstPaneWidth +threadPaneWidth))
    setTableTreePanelSize(size[0]);
    setPropertiesPanelSize(size[2])
  }
  //  属性面板大小变化事件
  const changeSplitPropertiesPanelSize = (size, WHeight) => {
    localStorage.setItem('splitPredefinedPanelPos', size);
    // const WHeight = window.innerHeight; 
    const firstPaneHeight = utils.percentToPx(size[0], WHeight);
    const secondPaneHeight = utils.percentToPx(size[1], WHeight);
    const threadPaneHeight = utils.percentToPx(size[2], WHeight);
    setDDLPanelSizePx(firstPaneHeight);
    setLibraryPanelSizePx(secondPaneHeight);
    setHistoryPanelSizePx(WHeight - firstPaneHeight - secondPaneHeight);
  }

  const [statusLabel, setStatusLabel] = useState("查询器");
  const [osInfo, setOsInfo] = useState("");
  const [dbInfo, setDbInfo] = useState("");
  const [operationLabel, setOperationLabel] = useState("");
  const getSplitPaneSize = (index) => {
    if (localStorage.getItem('splitPos')) {
      return localStorage.getItem('splitPos').split(',')[index];
    } else {
      return '20%'
    }
  }

  const getSplitPredefinedPaneSize = (index) => {
    if (localStorage.getItem('splitPredefinedPos')) {
      return localStorage.getItem('splitPredefinedPos').split(',')[index];
    } else {
      return '20%'
    }
  }

  // tree 相关处理逻辑
  // 递归函数用于查找并更新节点
  const updateTreeNodeByKey = (treeNodes, targetKey, updater) => {
    for (let i = 0; i < treeNodes.length; i++) {
      const node = treeNodes[i];
      if (node.key === targetKey) {
        // 如果找到了目标节点，应用更新器
        const updatedNode = { ...node, ...updater(node) };
        treeNodes[i] = updatedNode;
        // 更新状态，使更改生效
        setTreeData([...treeData]);
        return true; // 找到并更新了节点
      }

      if (node.children && node.children.length > 0) {
        // 如果当前节点有子节点，则递归搜索子节点
        if (updateTreeNodeByKey(node.children, targetKey, updater)) {
          // 如果在子节点中找到了目标节点并进行了更新，无需继续搜索
          return true;
        }
      }
    }

    return false; // 没有找到匹配的节点
  }
  // 
  const updateTreeNode = (key, updater) => {
    if (!updateTreeNodeByKey(treeData, key, updater)) {
      console.error(`No node found with key: ${key}`);
    }
  };
  const deleteTreeNodeByKey = (key, data = treeData) => {
    return data.reduce((acc, node) => {
      if (node.key !== key) {
        if (node.children) {
          node.children = deleteTreeNodeByKey(key, node.children);
          // if (node.children.length > 0) {
          if (node.key !== key) {
            acc.push({ ...node });
          }
        } else {
          acc.push({ ...node });
        }
      }
      return acc;
    }, []);
  };

  const deleteTreeNode = (key) => {
    setTreeData(deleteTreeNodeByKey(key));
  };

  // tab 相关处理逻辑
  const [historyQuery, setHistoryQuery] = useState([]);
  const [ddlQuery, setDDLQuery] = useState([]);

  const initialItems = [{
    id: "0",
    type: SQL_EDIT_MODE.EDITOR,
    title: utils.formatTimestamp(Date.now()),
    content: 'Content 1',
    assetId: '',
    askAi: false,
    selectSql: '',
    sql: '',
    where: '',
    orderBy: '',
    rows: [],
    headers: [],
    csvData: [],
    results: [],
    query: "",
    dbName: "",
    tabKey: "",
    erUrl: "",
  }]
  const newTabIndex = useRef(1);
  const [tabIndex, setTabIndex] = useState(initialItems[0].id);
  // type Editor 是编辑器 Filter 是过滤器 
  const [tabs, setTabs] = useState(initialItems);

  useEffect(() => {
    sqlsGetId().then(newId => {
      debugLog(" 更新ID ", newId)
      const updatedItems = initialItems.map(item => ({
        ...item,
        id: newId  // 使用接口返回的ID
      }));
      debugLog(" 更新ID ", updatedItems)
      setTabs(updatedItems);
      setTabIndex(newId);
    });

  }, []);
  const removeTab = (targetKey) => {
    // if(tabs.length > 1){
    let newActiveKey = tabIndex;
    let lastIndex = -1;
    tabs.forEach((item, i) => {
      if (item.id === targetKey) {
        lastIndex = i - 1;
      }
    });

    const newPanes = tabs.filter((tab) => tab.id !== targetKey);
    if (newPanes.length && newActiveKey === targetKey) {
      if (lastIndex >= 0) {
        newActiveKey = newPanes[lastIndex].id;
      } else {
        newActiveKey = newPanes[0].id;
      }
    }
    setTabs(newPanes);
    setTabIndex(newActiveKey);
    return true;
    // } else {
    //   return false;
    // }
  };

  const addTab = (params) => {
    // debugLog(" ## add ",type,key, title) type, key, title
    setOperationLabel("")
    if (getTabByID(params.key)) {
      setTabIndex(params.key)
    } else {
      const newTitle = params.title ? params.title : utils.formatTimestamp(Date.now())
      if (params.key) {
        const newActiveKey = params.key ? params.key : `newTab${newTabIndex.current++}`;
        const newPanes = [...tabs];
        newPanes.push({
          id: newActiveKey,
          title: newTitle,
          type: params.type,
          content: `Content ${newActiveKey}`,
          sql: params.sql ? params.sql : "",
          assetId: params.assetId ? params.assetId : "",
          askAi: false,
          selectSql: '',
          where: '',
          orderBy: '',
          rows: [],
          headers: [],
          csvData: [],
          results: [],
          query: "",
          dbName: params.dbName ? params.dbName : "",
          tableName: params.tableName ? params.tableName : "",
          erUrl: params.erUrl ? params.erUrl : "",
        })
        // console.log(" ## 33 params.key  ",newPanes)
        setTabs(newPanes);
        setTabIndex(newActiveKey);
      } else {
        sqlsGetId().then(newId => {
          debugLog(" 更新ID ", newId)
          const newActiveKey = newId;
          const newPanes = [...tabs];
          newPanes.push({
            id: newActiveKey,
            title: newTitle,
            type: params.type,
            content: `Content ${newActiveKey}`,
            sql: params.sql ? params.sql : "",
            assetId: params.assetId ? params.assetId : "",
            askAi: false,
            selectSql: '',
            where: '',
            orderBy: '',
            rows: [],
            headers: [],
            csvData: [],
            results: [],
            query: "",
            dbName: params.dbName ? params.dbName : "",
            tableName: params.tableName ? params.tableName : "",
            erUrl: params.erUrl ? params.erUrl : "",
          })
          setTabs(newPanes);
          setTabIndex(newActiveKey);
        })
      }
    }
  };

  const getTabByID = (tabIndex) => {
    return tabs.filter((tab) => {
      return tab.id === tabIndex ? tab : null
    })[0]
  }


  const setTabData = (query, headers, rows, csvData) => {
    const newTabs = tabs.map((tab) => {
      if (tab.id === tabs[tabIndex].id) {
        return { ...tab, query, headers, rows, csvData };
      }
      return tab;
    });
    setHistoryQuery([...historyQuery, { query: query, default: 1, status: rows.length > 0 ? true : false }]);
    setDDLQuery([...ddlQuery, { query: query, default: 1, status: rows.length > 0 ? true : false }]);
    setTabs(newTabs);
  }
  const setTabValue = (sql) => {
    try {
      const newTabs = tabs.map((tab) => {
        if (tab.id === getTabByID(tabIndex).id) {
          return { ...tab, sql };
        }
        return tab;
      });
      setTabs(newTabs);
    } catch (error) {
      debugLog(" setTabValue ", error);
    }
  }

  const setAskAi = (askAi) => {
    try {
      const newTabs = tabs.map((tab) => {
        if (tab.id === getTabByID(tabIndex).id) {
          tab.askAi = askAi
          return tab;
        }
        return tab;
      });
      console.log("setAskAi", newTabs)
      setTabs(newTabs);
    } catch (error) {
      debugLog(" setAskAi ", error);
    }
  }

  const setTabSelectSql = (selectSql) => {
    try {
      const newTabs = tabs.map((tab) => {
        if (tab.id === getTabByID(tabIndex).id) {
          tab.selectSql = selectSql
          return tab;
        }
        return tab;
      });
      console.log("newTabs", newTabs)
      // setTabs(newTabs);
    } catch (error) {
      debugLog(" setTabSelectSql ", error);
    }
  }

  const setTabAttrs = (attrs) => {
    try {
      const newTabs = tabs.map((tab) => {
        if (tab.id === getTabByID(tabIndex).id) {
          return { ...tab, ...attrs };
        }
        return tab;
      });
      setTabs(newTabs);
    } catch (error) {
      debugLog(" setTabValue ", error);
    }
  }

  const setTabAppleValue = (sql) => {
    const newTabs = tabs.map((tab) => {
      if (tab.id === getTabByID(tabIndex).id) {
        // return { ...tab, where };
        tab.sql = tab.sql + "\r\n" + sql;
        return tab;
      }
      return tab;
    });
    setTabs(newTabs);
  }
  const setTabWhere = (where) => {
    const newTabs = tabs.map((tab) => {
      if (tab.id === getTabByID(tabIndex).id) {
        // return { ...tab, where };
        tab.where = where;
        return tab;
      }
      return tab;
    });
    setTabs(newTabs);
  }
  const setTabOrderBy = (orderBy) => {
    const newTabs = tabs.map((tab) => {
      if (tab.id === getTabByID(tabIndex).id) {
        tab.orderBy = orderBy;
        return tab;
      }
      return tab;
    });
    setTabs(newTabs);
  }

  const setTabRows = (rows) => {
    const newTabs = tabs.map((tab) => {
      if (tab.id === getTabByID(tabIndex).id) {
        tab.rows = rows;
        return tab;
      }
      return tab;
    });
    setTabs(newTabs);
  };

  const setTabHeaders = (headers) => {
    const newTabs = tabs.map((tab) => {
      if (tab.id === getTabByID(tabIndex).id) {
        tab.headers = headers;
        return tab;
      }
      return tab;
    });
    setTabs(newTabs);
  };

  const setTabQuery = (query) => {
    const newTabs = tabs.map((tab) => {
      if (tab.id === getTabByID(tabIndex).id) {
        tab.query = query;
        return tab;
      }
      return tab;
    });
    setTabs(newTabs);
  };
  const setTabResults = (results) => {
    const newTabs = tabs.map((tab) => {
      if (tab.id === getTabByID(tabIndex).id) {
        tab.results = results;
        return tab;
      }
      return tab;
    });
    setTabs(newTabs);
  };
  const setTableStruct = (tableStruct) => {
    const newTabs = tabs.map((tab) => {
      if (tab.id === getTabByID(tabIndex).id) {
        // return { ...tab, tableStruct };
        tab.tableStruct = tableStruct;
        return tab;
      }
      return tab;
    });
    setTabs(newTabs);
  }
  const setTabSQL = (sql) => {
    // debugLog(" ### setTabSQL ", sql);
    const newTabs = tabs.map((tab) => {
      // debugLog(" ### setTabSQL ", tab);
      if (tab.id === getTabByID(tabIndex).id) {
        // debugLog(" ### 更新 setTabSQL ", tab);
        tab.sql = sql;
        return tab;
      }
      return tab;
    });
    setTabs(newTabs);
  };

  const setTabCSVData = (csvData) => {
    const newTabs = tabs.map((tab) => {
      if (tab.id === getTabByID(tabIndex).id) {
        return { ...tab, csvData };
      }
      return tab;
    });
    setTabs(newTabs);
  };

  const setTabName = (name) => {
    const newTabs = tabs.map((tab) => {
      if (tab.id === getTabByID(tabIndex).id) {
        tab.title = name;
        return tab;
      }
      return tab;
    });
    setTabs(newTabs);
  }

  const setTabNameByTabIndex = (name,currentTabIndex) => {
    const newTabs = tabs.map((tab) => {
      if (tab.id === getTabByID(currentTabIndex).id) {
        tab.title = name;
        return tab;
      }
      return tab;
    });
    setTabs(newTabs);
  }
  const setTabSrcObjDisObjReset = () => {
    const newTabs = tabs.map((tab) => {
      if (tab.id === getTabByID(tabIndex).id) {
        tab.srcObj = '';
        tab.distObj = '';
        tab.results = [];

        return tab;
      }
      return tab;
    });
    setTabs(newTabs);
  }

  // 添加新属性
  function setTabAttrProp(obj, propName, propValue) {
    obj[propName] = propValue;
    return obj;
  }

  // 获取新属性值
  function getTabAttrPropValue(obj, propName) {
    return obj[propName];
  }

  // 删除新属性
  function delTabAttrProp(obj, propName) {
    delete obj[propName];
    return obj;
  }

  // DDL 面板相关
  const [ddlValue, setDdlValue] = useState('');

  const utilsCutStringAtDash = utils.cutStringAtDash
  const utilsFindNodeByKey = utils.findNodeByKey
  const utilsFormatTimestampStr = utils.formatTimestampStr

  function doImport(key, type, message, title, content) {

    if (type == 'start') {
      let description = (
        <React.Fragment>
          <div>{title}</div>
          <div>{content}</div>
          <Progress percent={30} status="active" />
        </React.Fragment>
      );
      notification.info({
        key,
        message: message,
        duration: 100,
        description: description,
        placement: 'bottomRight'
      });
    }
    if (type == 'saveFile') {
      let description = (
        <React.Fragment>
          <div>{title}</div>
          <div>{content}</div>
          <Progress percent={40} />
        </React.Fragment>
      );
      notification.success({
        key,
        message: message,
        duration: 5,
        description: description,
        placement: 'bottomRight'
      });
    }
    if (type == 'finish') {
      let description = (
        <React.Fragment>
          <div>{title}</div>
          <div>{content}</div>
          <Progress percent={100} />
        </React.Fragment>
      );
      notification.success({
        key,
        message: message,
        duration: 5,
        description: description,
        placement: 'bottomRight'
      });
    }
    if (type == 'error') {
      let description = (
        <React.Fragment>
          <div>{title}</div>
          <div>{content}</div>
          <Progress percent={80} />
        </React.Fragment>
      );
      notification.error({
        key,
        message: message,
        duration: 5,
        description: description,
        placement: 'bottomRight'
      });
    }
  }
  function doExport(key, type, message, title, content, downloadUrl) {

    if (type === 'start') {
      let description = (
        <React.Fragment>
          <div>{title}</div>
          <div>{content}</div>
          <Progress percent={30} status="active" />
        </React.Fragment>
      );
      notification.info({
        key,
        message: message,
        duration: 100,
        description: description,
        placement: 'bottomRight'
      });
    }
    if (type === 'saveFile') {
      let description = (
        <React.Fragment>
          <div>{title}</div>
          <div>{content}</div>
          <Progress percent={40} />
        </React.Fragment>
      );
      notification.success({
        key,
        message: message,
        duration: 5,
        description: description,
        placement: 'bottomRight'
      });
    }
    if (type === 'finish') {
      let description = (
        <React.Fragment>
          <div>{title}</div>
          <div>{content}</div>
          <Progress percent={100} />
        </React.Fragment>
      );
      notification.success({
        key,
        message: message,
        duration: 5,
        description: description,
        placement: 'bottomRight'
      });
      download(downloadUrl)
    }
    if (type === 'error') {
      let description = (
        <React.Fragment>
          <div>{title}</div>
          <div>{content}</div>
          <Progress percent={80} />
        </React.Fragment>
      );
      notification.error({
        key,
        message: message,
        duration: 5,
        description: description,
        placement: 'bottomRight'
      });
    }
  }
  return (
    <VisibilityContext.Provider value={{
      setTabAttrProp,
      getTabAttrPropValue,
      delTabAttrProp,

      utilsCutStringAtDash,
      utilsFindNodeByKey,
      utilsFormatTimestampStr,

      defaultPageSize,
      dbVariables,
      webSocket, setWebSocket,
      webSocketOnData,
      webSocketSendData,

      getCharsets, getCollations,

      databaseList, setDatabaseList,
      tableList, setTableList,
      columnList, setColumnList,

      treeData, setTreeData,
      updateTreeNode, deleteTreeNode,

      SQL_EDIT_MODE,
      qurtyValue,
      value, setValue,
      defaults, setDefaults,

      historyQueryList, setHistoryQueryList,
      addHistoryQueryList, delHistoryQueryList,

      isVisible, setIsVisible,
      isTableTreePanelVisible, setTableTreePaneVisible,
      isPropertiesPanelVisible, setIsPropertiesPanelVisible,
      isCmdPaneVisible, setIsCmdPaneVisible,
      isHistoryPaneVisible, setIsHistoryPaneVisible,
      isDDLPaneVisible, setIsDDLPaneVisible,
      resetLayout,

      isAboutModal, setShowAboutModal,
      isKeyBoardModalVisible, setIsKeyBoardModalVisible,
      isCreateDatabaseModalVisible, setShowCreateDatabaseModalVisible,

      isRenameModalVisible, setShowRenameModalVisible,
      renameModalObj, setRenameModalObj,
      isTableRenameModalVisible, setShowTableRenameModalVisible,
      isTabNameVisible, setIsTabNameVisible,

      importSQLFileModalObj, setImportSQLFileModalObj,
      exportSQLFileModalObj, setExportSQLFileModalObj,
      isImportSQLFileModalVisible, setShowImportSQLFileModalVisible,
      isExportSQLFileModalVisible, setShowExportSQLFileModalVisible,
      confirmModal, confirmModalContextHolder, showConfirmModal,


      tableTreePanelSize, setTableTreePanelSize,
      tabBoxPanelSize, setTabBoxPanelSize,
      propertiesPanelSize, setPropertiesPanelSize,

      libraryPanelSize, setLibraryPanelSize,
      dDLPanelSize, setDDLPanelSize,
      historyPanelSize, setHistoryPanelSize,

      libraryPanelSizePx, setLibraryPanelSizePx,
      dDLPanelSizePx, setDDLPanelSizePx,
      historyPanelSizePx, setHistoryPanelSizePx,


      tabs, setTabs,
      tabIndex, setTabIndex,
      removeTab,
      addTab,
      getTabByID,
      setTabData,
      setTabValue,
      setAskAi,
      setTabSelectSql,
      setTabAttrs,
      setTabAppleValue,
      setTabWhere,
      setTabOrderBy,
      setTabRows,
      setTabHeaders,
      setTabQuery,
      setTabSQL,
      setTabCSVData,
      setTabResults,
      setTabName,
      setTabNameByTabIndex,
      setTabSrcObjDisObjReset,
      sqlEditorWidth, setSqlEditorWidth,


      statusLabel, setStatusLabel,
      dbInfo, setDbInfo,
      osInfo, setOsInfo,
      operationLabel, setOperationLabel,

      changeMainPanelSize,
      changeSplitPropertiesPanelSize,


      ddlValue, setDdlValue,

      getColumnsType,
      getDist,
      percentToPx,
      getSQLConverter,
      doExport,

      sqlsCreateOrUpdate, sqlsCreate, sqlsUpdate, sqlsDelete, sqlsDetail, sqlsAll,
      dbNameList,
      webSocketManager,
      connectionMode, setConnectionMode,

      language,
      protocolType,
      setProtocolType,

      erTabItem,setErTabItem
    }}>
      {children}
    </VisibilityContext.Provider>
  );
};

export { VisibilityContext, VisibilityProvider };
