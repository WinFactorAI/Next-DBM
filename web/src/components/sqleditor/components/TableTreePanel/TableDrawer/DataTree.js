import { AppstoreAddOutlined, BranchesOutlined, ClearOutlined, CloudDownloadOutlined, CopyOutlined, DeleteOutlined, DeploymentUnitOutlined, DownloadOutlined, EditOutlined, FormOutlined, FullscreenExitOutlined, FullscreenOutlined, FunnelPlotOutlined, GatewayOutlined, HighlightOutlined, ProductOutlined, SyncOutlined, UploadOutlined } from '@ant-design/icons';

import { Button, Input, Menu } from 'antd';
import React, { useContext, useEffect, useRef, useState } from "react";
import { VisibilityContext } from '../../Utils/visibilityProvider';
// import { NodeRendererProps, Tree } from "react-arborist";
import { Tree } from 'antd';
import i18next from 'i18next';
import toast from 'react-hot-toast';
import { server } from "../../../../../common/env";
import { debugLog } from '../../../../../common/logger';
import { getCurrentUser } from "../../../../../service/permission";
import { getToken } from "../../../../../utils/utils";
import './DataTree.css';

const { DirectoryTree } = Tree;
function Node({ node, style, dragHandle }: NodeRendererProps<any>) {
    /* This node instance can do many things. See the API reference. */
    return (
      <div className="m-2" style={style} ref={dragHandle} onClick={() => node.toggle()}>
        <div className="flex items-center cursor-pointer"  >
        
            {node.data.isMain ? 
                    node.data.icon === "table" ?
                    <svg   width="22px" height="22.00px" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg"><path fill="#6366f1" d="M959.825 384.002V191.94c0-70.692-57.308-128-128-128H191.94c-70.692 0-128 57.308-128 128v639.885c0 70.692 57.308 128 128 128h639.885c70.692 0 128-57.308 128-128V384.002z m-813.16-237.337a63.738 63.738 0 0 1 45.336-18.785H832a63.962 63.962 0 0 1 63.886 64.121v128.061H127.88v-128.06a63.738 63.738 0 0 1 18.785-45.337z m269.127 461.308v-223.97h192.181v223.97H415.792z m192.181 63.94v223.972H415.792V671.914h192.181z m-256.121-63.94H127.88v-223.97h223.972v223.97zM146.665 877.21a63.467 63.467 0 0 1-18.785-45.21V671.914h223.972v223.97h-159.85a63.626 63.626 0 0 1-45.337-18.675z m749.22-45.21a63.763 63.763 0 0 1-63.886 63.886H671.914V671.914h223.97v160.085z m0-224.026H671.914v-223.97h223.97v223.97z" /></svg>
                    :
                    node.data.icon === "view" ?
                    <svg   width="20px" height="19.30px" viewBox="0 0 1065 1024" version="1.1" xmlns="http://www.w3.org/2000/svg"><path fill="#6366f1" d="M819.2 854.308571l117.028571-257.462857h122.88l-210.651428 415.451429h-70.217143l-216.502857-415.451429h128.731428zM532.48 977.188571v-35.108571H386.194286v-263.314286h146.285714v-70.217143H386.194286V333.531429h263.314285v175.542857h70.217143v-175.542857h257.462857v175.542857H1053.257143V117.028571c0-64.365714-52.662857-117.028571-117.028572-117.028571H117.028571C52.662857 0 0 52.662857 0 117.028571v789.942858c0 64.365714 52.662857 117.028571 117.028571 117.028571h427.154286c-5.851429-17.554286-11.702857-29.257143-11.702857-46.811429zM76.068571 117.028571c0-23.405714 17.554286-40.96 40.96-40.96h819.2c23.405714 0 40.96 17.554286 40.96 40.96v152.137143H76.068571V117.028571z m245.76 825.051429H117.028571c-23.405714 0-40.96-17.554286-40.96-40.96v-228.205714h239.908572v269.165714z m0-333.531429H76.068571V333.531429h239.908572v275.017142z" /></svg>
                    :
                    node.data.icon === "function" ?
                    <svg   width="20px" height="18.84px" viewBox="0 0 1102 1024" version="1.1" xmlns="http://www.w3.org/2000/svg"><path fill="#6366f1" d="M940.268308 1024H760.648205v-81.132308h179.698872a81.394872 81.394872 0 0 0 81.26359-81.394871V162.527179a81.394872 81.394872 0 0 0-81.237334-81.394871H734.391795V0h205.955282A162.789744 162.789744 0 0 1 1102.769231 162.527179v698.945642A163.026051 163.026051 0 0 1 940.268308 1024z m-255.894975-690.018462a33.214359 33.214359 0 0 1-37.257846-24.681025c-0.210051-2.100513-5.592615-45.42359-41.668923-45.42359-38.833231 0-64.039385 66.691282-74.699487 95.310769l-2.940718 7.614359c-2.625641 6.826667-9.268513 27.044103-18.379487 55.138462h84.466872a27.779282 27.779282 0 1 1 0 53.825641h-101.691077q-46.132513 145.723077-91.346052 291.18359A118.285128 118.285128 0 0 1 289.188103 840.205128a138.633846 138.633846 0 0 1-130.205539-87.69641 26.781538 26.781538 0 0 1 23.630769-33.345641 36.969026 36.969026 0 0 1 42.929231 18.379487 76.931282 76.931282 0 0 0 63.698051 48.836923 54.744615 54.744615 0 0 0 45.108513-34.133333c5.093744-16.278974 51.016205-164.365128 86.646154-276.48h-104.027897a27.779282 27.779282 0 1 1 0-53.825641h121.147077c11.395282-35.446154 20.164923-61.965128 23.630769-70.629744l2.625641-7.351795c16.357744-43.323077 50.412308-133.907692 141.180718-133.907692a106.023385 106.023385 0 0 1 110.749538 94.785641 30.194872 30.194872 0 0 1-31.927795 29.144615zM524.760615 0h79.425641v79.294359h-79.425641V0zM81.26359 162.527179v698.945642a81.394872 81.394872 0 0 0 81.237333 81.132307h232.237949V1024H162.500923A163.026051 163.026051 0 0 1 0 861.472821V162.527179A162.789744 162.789744 0 0 1 162.500923 0h232.237949v81.132308H162.500923A81.394872 81.394872 0 0 0 81.394872 162.527179zM604.186256 1024h-79.425641v-79.556923h79.425641V1024z m-29.039589-280.681026a28.356923 28.356923 0 0 1 11.264-21.79282l73.517948-67.478975-67.058871-60.127179a29.748513 29.748513 0 0 1 24.155897-53.563077 50.83241 50.83241 0 0 1 38.071795 16.278974l53.116718 55.138462 54.193231-55.138462a50.911179 50.911179 0 0 1 35.446153-16.278974 33.450667 33.450667 0 0 1 38.071795 27.569231 30.798769 30.798769 0 0 1-11.211487 21.79282l-69.842051 63.277949 71.890051 64.328205a29.722256 29.722256 0 0 1-24.103384 53.563077 51.803897 51.803897 0 0 1-38.098052-16.278974l-57.974154-59.339487-57.921641 59.339487a50.54359 50.54359 0 0 1-35.446153 16.01641 33.319385 33.319385 0 0 1-38.203077-27.306667z m227.485538 27.569231z"  /></svg>
                    :
                    node.data.icon === "redis" ?
                    <svg   width="20px" height="18.84px" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="3522" ><path d="M922.9 719.1c-47.5 25-294.9 126.6-347.3 154-52.4 27.4-81.9 27-123.3 7.4-41.4-19.7-304.3-126.2-351.9-148.7-23.8-11.5-36-20.9-36-29.9v-90.5s342.4-74.6 397.7-94.2c55.3-19.7 74.6-20.5 121.7-3.3 47.1 17.2 328.1 68 374.8 84.8v88.9c-0.1 8.1-11.2 18.8-35.7 31.5z m0 0" fill="#A42122" p-id="3523"></path><path d="M922.9 628.6c-47.5 25-294.9 126.6-347.3 154-52.4 27.4-81.9 27-123.3 7.4-41.4-19.7-304.3-126.2-351.9-148.7-47.5-22.5-48.3-38.1-1.6-56.5 46.7-18.4 308-120.8 363.3-140.5 55.3-19.7 74.6-20.5 121.7-3.3 47.1 17.2 292.5 115.1 339.2 131.9 46.6 16.7 47.8 31.1-0.1 55.7z m0 0" fill="#D82F27" p-id="3524"></path><path d="M922.9 571.6c-47.5 25-294.9 126.6-347.3 154-52.4 27.4-81.9 27-123.3 7.4-41.4-19.7-304.3-126.2-351.9-148.7-23.8-11.5-36-20.9-36-29.9v-90.5s342.4-74.6 397.7-94.2c55.3-19.7 74.6-20.5 121.7-3.3 47.1 17.2 328.1 68 374.8 84.8v88.9c-0.1 8.2-11.2 18.8-35.7 31.5z m0 0" fill="#A42122" p-id="3525"></path><path d="M922.9 481.5c-47.5 25-294.9 126.6-347.3 154-52.4 27.4-81.9 27-123.3 7.4-41.4-19.7-304.3-126.2-351.9-148.7-47.5-22.5-48.3-38.1-1.6-56.5 46.7-18.4 308-121.2 363.3-140.9 55.3-19.7 74.6-20.5 121.7-3.3 47.1 17.2 292.5 115.1 338.7 131.9 46.2 16.8 48.3 31.1 0.4 56.1z m0 0" fill="#D82F27" p-id="3526"></path><path d="M922.9 418.8c-47.5 25-294.9 126.6-347.3 154-52.4 27.4-81.9 27-123.3 7.4C410.9 560.5 148 454 100.4 431.5c-23.8-11.5-36-20.9-36-29.9v-90.5s342.4-74.5 397.7-94.2c55.3-19.7 74.6-20.5 121.7-3.3 47.1 17.2 327.7 68 374.4 84.8v88.9c-0.1 8.2-10.8 18.8-35.3 31.5z m0 0" fill="#A42122" p-id="3527"></path><path d="M922.9 328.7c-47.5 25-294.9 126.6-347.3 154-52.4 27.4-81.9 27-123.3 7.4-41.5-19.6-304.4-126.6-351.9-149.1s-48.3-38.1-1.6-56.5c46.7-18.4 308-120.8 363.3-140.5 55.3-19.7 74.6-20.5 121.7-3.3 47.1 17.2 292.5 115.1 339.2 131.9 46.6 16.8 47.8 31.1-0.1 56.1z m0 0" fill="#D82F27" p-id="3528"></path><path d="M628.3 241.5l-77.4 8.2-17.2 41.8-28.3-46.7-89.3-7.8 66.8-24.2-20.1-36.9 62.3 24.2 59-19.3-16 38.1 60.2 22.6z m-99.5 202.3L384.2 384l207.3-32-62.7 91.8z m0 0M217.9 307.8c0 15.4 21.1 29.6 55.3 37.2 34.2 7.7 76.4 7.7 110.6 0 34.2-7.7 55.3-21.9 55.3-37.2 0-23.8-49.5-43-110.6-43s-110.6 19.3-110.6 43z m0 0" fill="#FFFFFF" p-id="3529"></path><path d="M719.7 252.9l122.9 48.3L720.1 350l-0.4-97.1z m0 0" fill="#791514" p-id="3530"></path><path d="M584.1 306.6l135.6-53.7 0.4 97.1-13.5 4.9-122.5-48.3z m0 0" fill="#AD2524" p-id="3531"></path></svg>
                    :
                    node.data.icon === "mongo" ?
                    <svg t="1712109973458"  viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="5992" width="20" height="20"><path d="M498.054095 386.876952c0-92.647619 0-282.819048-4.87619-365.714285l-4.876191 4.87619c-34.133333 24.380952-199.92381 156.038095-214.552381 424.228572-9.752381 209.67619 136.533333 351.085714 195.047619 399.847619 14.628571-63.390476 34.133333-219.428571 29.257143-380.342858v-82.895238z" fill="#5AAF4F" p-id="5993"></path><path d="M517.558857 854.991238c-4.87619 14.628571-4.87619 24.380952-9.752381 34.133333l-4.87619 9.752381c9.752381 39.009524 9.752381 87.771429 9.752381 87.771429l29.257143 9.752381s-4.87619-73.142857 0-107.276191v-4.87619c-9.752381-9.752381-19.504762-19.504762-24.380953-29.257143z" fill="#B8B79C" p-id="5994"></path><path d="M741.863619 382.000762c-53.638095-238.933333-185.295238-312.07619-199.923809-346.209524 4.87619 58.514286 4.87619 165.790476 4.87619 351.085714v82.895238c4.87619 107.27619-4.87619 199.92381-9.752381 258.438096 0 58.514286 24.380952 112.152381 34.133333 117.028571 4.87619-4.87619 9.752381-9.752381 19.504762-14.628571 68.266667-58.514286 195.047619-204.8 151.161905-448.609524z" fill="#439744" p-id="5995"></path></svg>
                    :
                    ""

                    
                :
                node.data.isLast ?
                    <span className="tree-switcher ant-tree-switcher-noop">
                        <span className="tree-switcher-leaf-line"></span>
                    </span>
                    :
                    <span className="tree-switcher ant-tree-switcher-noop">
                        <span className="tree-switcher-line"></span>
                    </span>
                    
            }
            
            {
                node.data.isMain && node.data.children ? 
                     node.isOpen ? (
                    <p className="font-bold text-lg ml-3 text-gray-500">{node.data.name} [-]</p>
                    ):(
                    <p className="font-bold text-lg ml-3 text-gray-500">{node.data.name} [+]</p>
                    )
                :
                <p className="font-bold text-lg ml-3 text-gray-500 tree-switcher-nowrap">
                    {node.data.name} {' '}
                    {
                        node.data.isAttr ?
                        <span className="text-indigo-300 hover:text-indigo-400">
                            [varchar(411110)]
                        </span>
                        :''
                    }
                </p>
            }
             
         </div>
       </div>
    );
  }
function filterNodes(data, filter) {
  return data.reduce((acc, node) => {
    const nameMatches =  (
      (typeof node.title === 'string' && node.title?.toLowerCase().includes(filter.toLowerCase())) ||
      (typeof node.name === 'string' && node.name?.toLowerCase().includes(filter.toLowerCase()) )
    );
    const children = node.children || [];
    const filteredChildren = filterNodes(children, filter);

    if (nameMatches || filteredChildren.length > 0) {
      acc.push({
        ...node,
        children: filteredChildren.length > 0 ? filteredChildren : node.children,
      });
    }
    return acc;
  }, []);
}

function getAllKeys(treeData) {
  return treeData.reduce((keys, item) => {
    keys.push(item.key);
    if (Array.isArray(item.children)) {
      keys = keys.concat(getAllKeys(item.children));
    }
    return keys;
  }, []);
}


function DataTree(){
    const { 
      SQL_EDIT_MODE,
      addTab,
      tabIndex,
      setTabName,
      setTabNameByTabIndex,
      getTabByID,
      setTabIndex,
      isRenameModalVisible, setShowRenameModalVisible,
      setRenameModalObj,
      
      importSQLFileModalObj,setImportSQLFileModalObj, 
      exportSQLFileModalObj,setExportSQLFileModalObj,
      setShowImportSQLFileModalVisible,
      setShowExportSQLFileModalVisible,
      setDdlValue,
      showConfirmModal,
      treeData,setTreeData,
      updateTreeNode,
      deleteTreeNode,
      setShowCreateDatabaseModalVisible,
      webSocket,
      defaultPageSize,
      webSocketSendData,
      getSQLConverter,
      doExport,
      utilsFormatTimestampStr,
      sqlsAll,
      setTabAttrProp,
      setTabValue,
      sqlsDelete,
      webSocketManager,
      protocolType,
      sqlsCreateOrUpdate
     } = useContext(VisibilityContext);

    const { Item, Divider } = Menu;
    const handleMenuClick = ({ key }) => {
    };
    
 
    // const menu = (
    //     <Menu onClick={handleMenuClick}>
    //       <Item key="1">选项一</Item>
    //       <Item key="2">选项二</Item>
    //       <Divider />
    //       <Item key="3">选项三</Item>
    //     </Menu>
    // );
    const [currentNode, setCurrentNode] = useState(null);
 
 
    
    const [expanded, setExpanded] = useState(false);
    const [expandedKeys, setExpandedKeys] = useState([]);
    const handleExpandAll = () => {
      // setExpanded(true);
      const allKeys = getAllKeys(treeData);
      if (expandedKeys.length < allKeys.length) {
        setExpandedKeys(allKeys);
      }
    };
  
    const handleCollapseAll = () => {
      // setExpanded(false);
      setExpandedKeys([]);
    };
    
    const [filter, setFilter] = useState("");
    const [filteredData, setFilteredData] = useState(treeData);
  
    useEffect(() => {
      if(treeData){
        setFilteredData(treeData);
      }
    }, [treeData]);

    useEffect(() => {
      const filteredNodes = filterNodes(treeData, filter);
      setFilteredData(filteredNodes);
    }, [filter]);
  
    const handleSearchChange = (e) => {
      setFilter(e.target.value);
    };
    const handleClear = () => {
      setFilter(''); // 清除搜索框内容
    };

    // 递归查找节点信息
    const findNodeByKey = (data, key) => {
      for (let i = 0; i < data.length; i++) {
        const node = data[i];
        if (node.key === key) {
          return node;
        }
        if (node.children) {
          const foundNode = findNodeByKey(node.children, key);
          if (foundNode) {
            return foundNode;
          }
        }
      }
      return null;
    };
  
    const onSelect = (keys, info) => {
      debugLog(' ## selected', keys, info);
      if(info.node.menuType == "tableMenu"){
        //获取DDL信息
        // const node = findNodeByKey(treeData, keys[0]);
        const databaseKey = cutStringAtDash(info.node.key,2)
        const nodeInfo = findNodeByKey(filteredData, databaseKey)
        debugLog(" nodeInfo ",nodeInfo)
        const tableDDLStr  = getSQLConverter("getTableDDL",{
          database: nodeInfo.title, 
          tableName: info.node.title
        })
        webSocketSendData({
          "key": info.node.key+"-getTableDDL",
          "retType": "KeyValueJsonResult",
          "data":  tableDDLStr,
          "attr":{
            assetId : nodeInfo.attr.assetId,
            timestamp : new Date().getTime(),
            sqlCommand : tableDDLStr
          }
        });
      }
    };

    const cutStringAtDash = (str, dashPosition) => {
        let targetIndex = -1;

        if (dashPosition === -1) {
            // 查找最后一个 "-" 的位置
            targetIndex = str.lastIndexOf('-');
        } else {
            let currentPosition = 0;
            // 查找第 dashPosition 个 "-" 的位置
            for (let i = 0; i < str.length; i++) {
                if (str[i] === '-') {
                    currentPosition++;
                    if (currentPosition === dashPosition) {
                        targetIndex = i;
                        break;
                    }
                }
            }
        }

        // 如果找到了目标位置，则截取并返回
        if (targetIndex !== -1) {
            return str.substring(0, targetIndex);
        }

        // 如果没有找到，返回整个字符串
        return str;
    }

 
    // 准备生成SQL的参数
    const onExpand = (expandedKeys, info) => {
      debugLog(' ## onExpand', expandedKeys, info);
      setExpandedKeys(expandedKeys);
      if( info.node.menuType == 'asset'){
        const { expanded, node } = info; // `info` contains details about the current node
        debugLog(" 点击 ",info)
        if (!expanded) {
          // Node has been collapsed
          debugLog(` Node with key ${node.key} has been collapsed.`);
          webSocketManager.closeConnection(cutStringAtDash(info.node.key,5))
        } else {
          // Node has been expanded
          debugLog(` Node with key ${node.key} has been expanded.`);
          webSocketManager.init(cutStringAtDash(info.node.key,5))
        }
      } else {
        // debugLog(" info.node ",info.node)
        // 树形统一处理 getAllcolumnsMenu 获取所有字段 getAllkeys 获取所有键 getAllindexs 获取所有索引 getAllviews 获取所有视图  等
        let nodeInfo = null
        let tableName = null
        if( info.node.menuType == 'sqlsMenu'){
          // debugLog(" 点击sqls菜单 ")
          const databaseKey = cutStringAtDash(info.node.key,-1);
          nodeInfo = findNodeByKey(filteredData, databaseKey)
          sqlsAll({key:info.node.key,dbName:nodeInfo.title}).then(res=>{
            // debugLog("sqlsUpdate res ",res);
          })
          return 
        }
        if(info.node.menuType == 'tablesMenu' || info.node.menuType == 'viewsMenu' || info.node.menuType == 'functionsMenu' || info.node.menuType == 'proceduresMenu' ){
          const databaseKey = cutStringAtDash(info.node.key,-1);
          nodeInfo = findNodeByKey(filteredData, databaseKey)
        }
        else if(info.node.menuType == 'columnsMenu' || info.node.menuType == 'keysMenu' || info.node.menuType == 'indexsMenu'){
          const databaseKey = cutStringAtDash(info.node.key,2)
          nodeInfo = findNodeByKey(filteredData, databaseKey)
          const tableKey = cutStringAtDash(info.node.key,-1);
          tableName = findNodeByKey(filteredData, tableKey)
        }
      
        if (nodeInfo){
          // 获取查询指令
          const sqlStr  = getSQLConverter("getAll"+info.node.menuType,{
            database: nodeInfo.title,
            tableName: tableName?.title
          })
          if(sqlStr){
            debugLog(' ## nodeInfo  ', nodeInfo);
            // webSocketManager.sendData();
            webSocketSendData({
              "key": info.node.key,
              "retType": info.node.menuType,
              "data": sqlStr,
              "attr":{
                assetId : nodeInfo.attr.assetId,
                database: nodeInfo.title,
                tableName: tableName?.title,
                timestamp :new Date().getTime(),
                sqlCommand: sqlStr,
              }
            });
          }
        }
      }
    };

    // 数据库树右键弹出菜单
    const databaseMenu = (
      <Menu className='tree-node-menu-box' selectable={false} style={{width: '130px'}}
        items={[
          ...( currentNode && expandedKeys.includes(currentNode.key) ? [{ // 只有当currentNode存在且具有key属性时，才添加'closeDB'菜单项
            key: 'closeDB',
            label: <span>{i18next.t('dbmEditor.treeMenu.closeDatabase')}</span>,
            onClick: (item) => {
              setExpandedKeys(expandedKeys.filter(key => key !== currentNode.key));
              setShowMenu(false);
            }
          }] : [
            { // 只有当currentNode存在且具有key属性时，才添加'closeDB'菜单项
              key: 'openDB',
              label: <span>{i18next.t('dbmEditor.treeMenu.openDatabase')}</span>,
              onClick: (item) => {
                //展开当前节点
                setExpandedKeys([...expandedKeys,currentNode.key])
                setShowMenu(false);
              }
            }
          ]),
          { type: 'divider', key: null, label: null, },
          {
            icon: <DeploymentUnitOutlined />,
            key: 'graphs',
            label: <span>模型设计</span>,
            onClick: (item) => {
              // console.log(" item ", item);
              const databaseKey = cutStringAtDash(currentNode.key,2)
              const nodeInfo = findNodeByKey(filteredData, databaseKey)
              const allTablesStr  = getSQLConverter("getAlltables",{
                  database: nodeInfo.title,
                })
              let timestamp = utilsFormatTimestampStr(new Date().getTime())
              let fileName = nodeInfo.title+'-onlyStruct.json'
              let filePath = '/export/'+timestamp+'/'
              let download  =`${server}/storages/${getCurrentUser().id}/download?file=${window.encodeURIComponent(filePath+fileName)}&X-Auth-Token=${getToken()}&t=${new Date().getTime()}`
              webSocketSendData({
                  "key": "er-" + databaseKey,
                  "retType": 'erJsonResult',
                  "data":  allTablesStr,
                  "attr":{
                      assetId : nodeInfo.attr.assetId,
                      title:'转存SQL文件',
                      content:'转存SQL文件-仅结构',
                      database: nodeInfo.title,
                      filePath: filePath,
                      fileName: fileName,
                      download: download,
                      storageId:getCurrentUser().id,
                      timestamp :timestamp,
                      sqlCommand: allTablesStr,
                  }
              })
              setShowMenu(false);
            }
          },
          {
            icon: <EditOutlined />,
            key: 'editDB',
            label: <span>{i18next.t('dbmEditor.treeMenu.editDatabase')}</span>,
            onClick: (item) => {
              setShowCreateDatabaseModalVisible(true)
              setShowMenu(false);
            }
          },
          {
            icon: <AppstoreAddOutlined />,
            key: 'addDB',
            label: <span>{i18next.t('dbmEditor.treeMenu.newDatabase')}</span>,
            onClick: (item) => {
              setShowCreateDatabaseModalVisible(true)
              setShowMenu(false);
            }
          },
          {
            icon: <DeleteOutlined />,
            key: 'deleteDB',
            label: <span>{i18next.t('dbmEditor.treeMenu.delDatabase')}</span>,
            onClick: () => {
              showConfirmModal("删除数据库","确定要数据库吗？",null,()=>{
                const dropDatabaseStr  = getSQLConverter("dropDatabase",{
                  database: currentNode.title
                })
                webSocketSendData({
                  "key": currentNode.key,
                  "retType": "executeResult",
                  "data":  dropDatabaseStr,
                  "attr":{
                    timestamp :new Date().getTime(),
                    sqlCommand: dropDatabaseStr,
                  }
                });
              })
              setShowMenu(false);
            },
          },
          { type: 'divider', key: null, label: null, },
          {
            icon: <FormOutlined />,
            key: 'queryDB',
            label: <span>{i18next.t('dbmEditor.treeMenu.newQueryPanel')}</span>,
            onClick: () => {
              const databaseKey = cutStringAtDash(currentNode.key,2)
              const nodeInfo = findNodeByKey(filteredData, databaseKey)
              addTab({type:SQL_EDIT_MODE.EDITOR,assetId:nodeInfo.attr.assetId});
              setShowMenu(false);
            },
          },
          { type: 'divider', key: null, label: null, },
          {
            icon: <UploadOutlined />,
            key: 'runSQLFile',
            label: <span>{i18next.t('dbmEditor.treeMenu.runSqlFile')}</span>,
            onClick: () => {
              setImportSQLFileModalObj({
                key: currentNode.key+"-Import",
                title: '运行SQL文件',
                label: '运行SQL文件',
                labelCol: { span: 6 },
                value: "",
                database: currentNode.title,
                callback:(filePath,fileName)=>{
                  //请求解压导入SQL
                  const allTablesStr  = getSQLConverter("getAlltables",{
                    database: currentNode.title,
                  })
                  let timestamp = utilsFormatTimestampStr(new Date().getTime())
                  // let upload  =`${server}/storages/${getCurrentUser().id}/download?file=${window.encodeURIComponent(filePath+fileName)}&X-Auth-Token=${getToken()}&t=${new Date().getTime()}`
                  webSocketSendData({
                    "key": currentNode.key+"-Import",
                    "retType": "importDatabaseJsonResult",
                    "data":  allTablesStr,
                    "attr":{
                      title:'运行SQL文件',
                      content:'运行SQL文件',
                      database: currentNode.title,
                      filePath: filePath,
                      fileName: fileName,
                      // upload: upload,
                      storageId:getCurrentUser().id,
                      timestamp :timestamp,
                      sqlCommand: allTablesStr,
                    }
                  });
                  doExport(currentNode.key+'-Import','start',"导入",'运行SQL文件',currentNode.title);
                }
              })
              setShowImportSQLFileModalVisible(true);
              setShowMenu(false);
            },
          },
          {
            icon: <DownloadOutlined />,
            key: 'saveSqlFile',
            label: <span>{i18next.t('dbmEditor.treeMenu.saveSqlFile')}</span>,
            children: [
              {
                key: 'saveSSLFile',
                label: <span>{i18next.t('dbmEditor.treeMenu.onlyStructure')}</span>,
                onClick: () => {
                  const databaseKey = cutStringAtDash(currentNode.key,2)
                  const nodeInfo = findNodeByKey(filteredData, databaseKey)
                  const allTablesStr  = getSQLConverter("getAlltables",{
                    database: nodeInfo.title,
                  })
                  let timestamp = utilsFormatTimestampStr(new Date().getTime())
                  let fileName = nodeInfo.title+'-onlyStruct.zip'
                  let filePath = '/export/'+timestamp+'/'
                  let download  =`${server}/storages/${getCurrentUser().id}/download?file=${window.encodeURIComponent(filePath+fileName)}&X-Auth-Token=${getToken()}&t=${new Date().getTime()}`
                  webSocketSendData({
                    "key": currentNode.key+"-Export-onlyStruct",
                    "retType": "exportDatabaseOnlyStructJsonResult",
                    "data":  allTablesStr,
                    "attr":{
                      assetId : nodeInfo.attr.assetId,
                      title:'转存SQL文件',
                      content:'转存SQL文件-仅结构',
                      database: nodeInfo.title,
                      filePath: filePath,
                      fileName: fileName,
                      download: download,
                      storageId:getCurrentUser().id,
                      timestamp :timestamp,
                      sqlCommand: allTablesStr,
                    }
                  });
                  doExport(currentNode.key+'-Export-onlyStruct','start',"导出",'转存SQL文件-仅结构',currentNode.title);
                  setShowMenu(false);
                },
              },
              {
                key: 'saveSSLDATAFile',
                label: <span>{i18next.t('dbmEditor.treeMenu.structureAndData')}</span>,
                onClick: () => {
                  const databaseKey = cutStringAtDash(currentNode.key,2)
                  const nodeInfo = findNodeByKey(filteredData, databaseKey)
                  const allTablesStr  = getSQLConverter("getAlltables",{
                    database: nodeInfo.title,
                  })
                  let timestamp = utilsFormatTimestampStr(new Date().getTime())
                  let fileName = nodeInfo.title+'-structData.zip'
                  let filePath = '/export/'+timestamp+'/'
                  let download  =`${server}/storages/${getCurrentUser().id}/download?file=${window.encodeURIComponent(filePath+fileName)}&X-Auth-Token=${getToken()}&t=${new Date().getTime()}`
                  webSocketSendData({
                    "key": currentNode.key+"-Export-structData",
                    "retType": "exportDatabaseStructDataJsonResult",
                    "data":  allTablesStr,
                    "attr":{
                      assetId: nodeInfo.attr.assetId,
                      title: '转存SQL文件',
                      content: '转存SQL文件-结构与数据',
                      database: nodeInfo.title,
                      filePath: filePath,
                      fileName: fileName,
                      download: download,
                      storageId: getCurrentUser().id,
                      timestamp: timestamp,
                      sqlCommand: allTablesStr,
                    }
                  });
                  doExport(currentNode.key+'-Export-structData','start',"导出",'转存SQL文件-结构与数据',currentNode.title);
                  setShowMenu(false);
                },
              },
            ],
          },
          { type: 'divider', key: null, label: null, },
          {
            icon: <SyncOutlined />,
            key: 'reflish',
            label: <span>{i18next.t('dbmEditor.treeMenu.refresh')}</span>,
            onClick: () => {
               toast.success('刷新成功');
               setShowMenu(false);
            },
          },
        ]}
      />
    );
    // 表右键弹出菜单
    const tablesMenu = (
      <Menu className='tree-node-menu-box' selectable={false}
        items={[
          {
            icon: <AppstoreAddOutlined />,
            key: 'add',
            label: <span>{i18next.t('dbmEditor.treeMenu.newTable')}</span>,
            onClick: () => {
              setRenameModalObj({
                title: '创建表',
                label: '新建表名',
                labelCol: { span: 6 },
                rules: [
                 {
                   required: true,
                   message: '请输入新建表名',
                 },
                ],
                value: "",
                placeholder:'请输入新建表名',
                callback:(value)=>{
                  const databaseKey = cutStringAtDash(currentNode.key,2)
                  const nodeInfo = findNodeByKey(filteredData, databaseKey)
                  addTab({
                    type:SQL_EDIT_MODE.DESIGNER,
                    key:currentNode.key+"-createTable",
                    title:nodeInfo.title+"."+value.newName,
                    assetId:nodeInfo.attr.assetId
                  })
                }
              })
              setShowRenameModalVisible(true);
              setShowMenu(false);
            },
          },
          // {
          //   key: 'Import',
          //   label: <span>导入</span>,
          //   onClick: () => {
          //     setShowImportSQLFileModalVisible(true);
          //     setShowMenu(false);
          //   },
          // },
          // {
          //   key: 'Export',
          //   label: <span>导出</span>,
          //   children: [
          //     {
          //       key: 'Export1',
          //       label: <span>仅数据</span>,
          //       onClick: () => {
          //         // toast.success('导出仅数据');
          //         // setShowExportSQLFileModalVisible(true);
          //         doExport(currentNode.title+'-Export-onlyStruct','start',"导出库表",'导出库表-仅结构',currentNode.title);
          //         setShowMenu(false);
          //       },
          //     },
          //     {
          //       key: 'Export2',
          //       label: <span>结构+数据</span>,
          //       onClick: () => {
          //         // toast.success('导出结构+数据');
          //         // setShowExportSQLFileModalVisible(true);
          //         doExport(currentNode.title+'-Export-structData','start',"导出库表",'导出库表-结构与数据',currentNode.title);
          //         setShowMenu(false);
          //       },
          //     },
          //   ],
          // },
          { type: 'divider', key: null, label: null, },
          {
            icon: <SyncOutlined />,
            key: 'reflish',
            label: <span>{i18next.t('dbmEditor.treeMenu.refresh')}</span>,
            onClick: () => {
              setShowMenu(false);
            },
          },
        ]}
      />
    );

    // 视图右键弹出菜单
    const viewsMenu = (
      <Menu className='tree-node-menu-box' selectable={false}
        items={[
          {
            icon: <AppstoreAddOutlined />,
            key: 'add',
            label: <span>{i18next.t('dbmEditor.treeMenu.newView')}</span>,
            onClick: () => {
              setRenameModalObj({
                title: '创建视图',
                label: '新建视图名',
                labelCol: { span: 6 },
                rules: [
                 {
                   required: true,
                   message: '请输入新建视图名',
                 },
                ],
                value: "",
                placeholder:'请输入新建视图名',
                callback:(value)=>{
                  const databaseKey = cutStringAtDash(currentNode.key,2)
                  const nodeInfo = findNodeByKey(filteredData, databaseKey)
                  addTab({
                    type: SQL_EDIT_MODE.VIEW,
                    key: currentNode.key+"-createView",
                    title: nodeInfo.title+"."+value.newName,
                    assetId:nodeInfo.attr.assetId
                  })
                }
              })
              setShowRenameModalVisible(true);
              setShowMenu(false)
            },
          },
          { type: 'divider', key: null, label: null, },
          {
            icon: <SyncOutlined />,
            key: 'reflish',
            label: <span>{i18next.t('dbmEditor.treeMenu.refresh')}</span>,
            onClick: () => {
              toast.success("刷新视图成功")
              setShowMenu(false)
            },
          },
        ]}
      />
    );

    // 函数右键弹出菜单
    const functionsMenu = (
      <Menu className='tree-node-menu-box' selectable={false}
        items={[
          {
            icon: <AppstoreAddOutlined />,
            key: 'add',
            label: <span>{i18next.t('dbmEditor.treeMenu.newFun')}</span>,
            onClick: () => {
              setRenameModalObj({
                title: '创建函数',
                label: '新建函数名',
                labelCol: { span: 6 },
                rules: [
                 {
                   required: true,
                   message: '请输入新建函数名',
                 },
                ],
                value: "",
                placeholder:'请输入新建函数名',
                callback:(value)=>{
                 const databaseKey = cutStringAtDash(currentNode.key,2)
                 const nodeInfo = findNodeByKey(filteredData, databaseKey)
                 addTab({
                  type: SQL_EDIT_MODE.FUNCTION,
                  key: currentNode.key+"-createFunction",
                  title: nodeInfo.title+"."+value.newName,
                  assetId: nodeInfo.attr.assetId
                 })
                }
              })
              setShowRenameModalVisible(true);
              setShowMenu(false)
            },
          },
          { type: 'divider', key: null, label: null, },
          {
            icon: <SyncOutlined />,
            key: 'reflish',
            label: <span>{i18next.t('dbmEditor.treeMenu.refresh')}</span>,
            onClick: () => {
              toast.success("刷新成功")
              setShowMenu(false)
            }
          },
        ]}
      />
    );

    // 流程右键弹出菜单
    const proceduresMenu = (
      <Menu className='tree-node-menu-box' selectable={false}
        items={[
          {
            icon: <AppstoreAddOutlined />,
            key: 'add',
            label: <span>{i18next.t('dbmEditor.treeMenu.newProcedure')}</span>,
            onClick: () => {
              setRenameModalObj({
                title: '创建存储过程',
                label: '新建存储过程名',
                labelCol: { span: 6 },
                rules: [
                 {
                   required: true,
                   message: '请输入新建存储过程名',
                 },
                ],
                value: "",
                placeholder:'请输入新建存储过程名',
                callback:(value)=>{
                 const databaseKey = cutStringAtDash(currentNode.key,2)
                 const nodeInfo = findNodeByKey(filteredData, databaseKey)
                 addTab({
                    type: SQL_EDIT_MODE.PROCEDURE,
                    key: currentNode.key+"-createProcedure",
                    title: nodeInfo.title+"."+value.newName,
                    assetId: nodeInfo.attr.assetId
                 })
                }
              })
              setShowRenameModalVisible(true);
              setShowMenu(false)
            }
          },
          { type: 'divider', key: null, label: null, },
          {
            icon: <SyncOutlined />,
            key: 'reflish',
            label: <span>{i18next.t('dbmEditor.treeMenu.refresh')}</span>,
            onClick: () => {
              toast.success("刷新成功")
              setShowMenu(false)
            }
          },
        ]}
      />
    );

    // SQLs右键弹出菜单
    const sqlsMenu = (
      <Menu className='tree-node-menu-box' selectable={false}
        items={[
          {
            icon: <AppstoreAddOutlined />,
            key: 'add',
            label: <span>{i18next.t('dbmEditor.treeMenu.newQueryTab')}</span>,
            onClick: (item) => {
              toast.success("新建成功")
              const databaseKey = cutStringAtDash(currentNode.key,2)
              const nodeInfo = findNodeByKey(filteredData, databaseKey)
              addTab({type:SQL_EDIT_MODE.EDITOR,assetId:nodeInfo.attr.assetId})
              setShowMenu(false)
            }
          },
          { type: 'divider', key: null, label: null, },
          {
            icon: <SyncOutlined />,
            key: 'reflish',
            label: <span>{i18next.t('dbmEditor.treeMenu.refresh')}</span>,
            onClick: () => {
              toast.success("刷新成功")
              setShowMenu(false)
            }
          },
        ]}
      />
    );

    const handleMenuClick1 = (info) => {
      // 这里你可以根据 info.key 来执行不同的操作
    };



    // 表右键弹出菜单 BranchesOutlined, FormOutlined, FunnelPlotOutlined 
    const tableMenu = (
      <Menu className='tree-node-menu-box' selectable={false}
        items={[
          {
            icon: <FormOutlined />,
            key: 'openTable',
            label: <span>{i18next.t('dbmEditor.treeMenu.queryTab')}</span>,
            onClick: () => {
              const databaseKey = cutStringAtDash(currentNode.key,2)
              const nodeInfo = findNodeByKey(filteredData, databaseKey)
              addTab({type:SQL_EDIT_MODE.EDITOR,assetId:nodeInfo.attr.assetId})
              setShowMenu(false);
            },
          },
          {
            icon: <FunnelPlotOutlined/>,
            key: 'tableFilter',
            label: <span>{i18next.t('dbmEditor.treeMenu.filterTab')}</span>,
            onClick: (e) => {
              const databaseKey = cutStringAtDash(currentNode.key,2)
              const nodeInfo = findNodeByKey(filteredData, databaseKey)
              addTab({
                type: SQL_EDIT_MODE.FILTER,
                key: nodeInfo.title+"."+currentNode.title,
                title: nodeInfo.title+"."+currentNode.title,
                dbName: nodeInfo.title,
                tableName: currentNode.title,
                assetId: nodeInfo.attr.assetId
              })
              const params ={
                database: nodeInfo.title,
                tableName: currentNode.title,
              }
              let selectTableDataStr = getSQLConverter('selectTableData',params);
              webSocketSendData({
                "key": nodeInfo.title+"."+currentNode.title,
                "retType": 'tableRsesult',
                "data": selectTableDataStr,
                "attr": {
                  assetId: nodeInfo.attr.assetId,
                  totalRows: 0,
                  pageSize: defaultPageSize,
                  currentPage: 1,
                  tabId: nodeInfo.title+"."+currentNode.title,
                  // nextAction: 'getTableStruct',
                  newTabIndex: null,
                  timestamp: new Date().getTime(),
                  database: nodeInfo.title,
                  sqlCommand: selectTableDataStr,
                }
              });
              setShowMenu(false);
            }
          },
          {
            icon: <ProductOutlined />,
            key: 'dbm',
            label: <span>{i18next.t('dbmEditor.treeMenu.desigerTab')}</span>,
            onClick: (e) => {
              // 表已经存在修改表结构
              const databaseKey = cutStringAtDash(currentNode.key,2)
              const nodeInfo = findNodeByKey(filteredData, databaseKey)
              addTab({
                type: SQL_EDIT_MODE.DESIGNER,
                key: currentNode.key+"-alterTable",
                title: nodeInfo.title+'.'+currentNode.title,
                assetId: nodeInfo.attr.assetId
              })
              setShowMenu(false);
            }
          },
          {
            icon: <BranchesOutlined />,
            key: 'tableDiff',
            label: <span>{i18next.t('dbmEditor.treeMenu.diffTab')}</span>,
            onClick: (e) => {
              const databaseKey = cutStringAtDash(currentNode.key,2)
              const nodeInfo = findNodeByKey(filteredData, databaseKey)
              addTab({
                type: SQL_EDIT_MODE.DIFF,
                key: currentNode.key+"-diffTable",
                title: nodeInfo.title+'.'+currentNode.title,
                assetId:nodeInfo.attr.assetId
              })
              setShowMenu(false);
            }
          },
          

          { type: 'divider', key: null, label: null, },
          {
            icon: <HighlightOutlined />,
            key: 'tableRename',
            label: <span>{i18next.t('dbmEditor.treeMenu.tableRename')}</span>,
            onClick: (e) => {
               setRenameModalObj({
                 title: '重命名',
                 label: '新表名',
                 labelCol: { span: 4 },
                 rules: [
                  {
                    required: true,
                    message: '请输入新表名',
                  },
                 ],
                 value: currentNode.title,
                 placeholder:'请输入新表名',
                 callback:(value)=>{
                  const databaseKey = cutStringAtDash(currentNode.key,2)
                  const nodeInfo = findNodeByKey(filteredData, databaseKey)
                  const renameTableStr  = getSQLConverter("renameTable",{
                    database: nodeInfo.title, 
                    oldName: currentNode.title,
                    newName: value.newName
                  })
                  webSocketSendData({
                    "key": currentNode.key+"-renameTable",
                    "retType": "KeyValueJsonResult",
                    "data":  renameTableStr,
                    "attr": {
                       assetId: nodeInfo.attr.assetId,
                       newName: value.newName,
                       timestamp: new Date().getTime(),
                       sqlCommand: renameTableStr,
                    }
                  });
            
                 }
               })
               setShowRenameModalVisible(true);
               setShowMenu(false);
            }
          },
          {
            icon: <GatewayOutlined />,
            key: 'tableDDL',
            label: <span>{i18next.t('dbmEditor.treeMenu.tableDDL')}</span>,
            onClick: (e) => {
              const databaseKey = cutStringAtDash(currentNode.key,2)
              const nodeInfo = findNodeByKey(filteredData, databaseKey)
              const tableDDLStr  = getSQLConverter("getTableDDL",{
                database: nodeInfo.title, 
                tableName: currentNode.title
              })
              webSocketSendData({
                "key": currentNode.key+"-getTableDDL",
                "retType": "KeyValueJsonResult",
                "data":  tableDDLStr,
                "attr":{
                  assetId: nodeInfo.attr.assetId,
                  timestamp: new Date().getTime(),
                  sqlCommand: tableDDLStr
                }
              });
              // setDdlValue('CREATE TABLE' );
              // toast.success("表DDL信息");
              setShowMenu(false);
            }
          },
          {
            icon: <DeleteOutlined />,
            key: 'tableDelete',
            label: <span>{i18next.t('dbmEditor.treeMenu.tableDelete')}</span>,
            onClick: (e) => {
              showConfirmModal("删除表","确定要删除表吗？",null,()=>{
                const databaseKey = cutStringAtDash(currentNode.key,2)
                const nodeInfo = findNodeByKey(filteredData, databaseKey)
                const dropTableStr  = getSQLConverter("dropTable",{
                  database: nodeInfo.title, 
                  tableName: currentNode.title
                })
                webSocketSendData({
                  "key": currentNode.key,
                  "retType": "KeyValueJsonResult",
                  "data":  dropTableStr,
                  "attr": {
                    assetId: nodeInfo.attr.assetId,
                    database: nodeInfo.title,
                    viewName: currentNode.title,
                    timestamp :new Date().getTime(),
                    sqlCommand : dropTableStr
                  }
                });
                deleteTreeNode(currentNode.key);
              })
              setShowMenu(false);
            }
          },
          {
            icon: <ClearOutlined />,
            key: 'tableEmpty',
            label: <span>{i18next.t('dbmEditor.treeMenu.tableEmpty')}</span>,
            onClick: (e) => {
              showConfirmModal("清空表数据","确定要清空表数据吗？",null,()=>{
                const databaseKey = cutStringAtDash(currentNode.key,2)
                const nodeInfo = findNodeByKey(filteredData, databaseKey)
                const truncateTableStr  = getSQLConverter("truncateTable",{
                  database: nodeInfo.title,
                  tableName: currentNode.title
                })
                webSocketSendData({
                  "key": currentNode.key,
                  "retType": "executeResult",
                  "data":  truncateTableStr,
                  "attr":{
                    assetId: nodeInfo.attr.assetId,
                    timestamp: new Date().getTime(),
                    sqlCommand: truncateTableStr
                  }
                });
              })
              setShowMenu(false);
            }
          },
          {
            icon: <CopyOutlined />,
            key: 'tableCopy',
            label: <span>{i18next.t('dbmEditor.treeMenu.tableCopy')}</span>,
            onClick: (e) => {
              const databaseKey = cutStringAtDash(currentNode.key,2)
              const nodeInfo = findNodeByKey(filteredData, databaseKey)
              const copyTableStr  = getSQLConverter("copyTable",{
                database: nodeInfo.title,
                tableName: currentNode.title
              })
              webSocketSendData({
                "key": currentNode.key,
                "retType": "executeResult",
                "data":  copyTableStr,
                "attr":{
                  assetId: nodeInfo.attr.assetId,
                  timestamp: new Date().getTime(),
                  sqlCommand: copyTableStr
                }
              });
              setShowMenu(false);
            }
          },
          { type: 'divider', key: null, label: null, },
          // {
          //   icon: <></>,
          //   key: 'tableImport',
          //   label: <span>导入表</span>,
          //   onClick: (e) => {
          //     setShowImportSQLFileModalVisible(true);
          //     setShowMenu(false);
          //   }
          // },
          {
            icon: <CloudDownloadOutlined />,
            key: 'tableExport',
            label: <span>{i18next.t('dbmEditor.treeMenu.tableExport')}</span>,
            // onClick: (e) => {
            //   setShowExportSQLFileModalVisible(true);
            //   setShowMenu(false);
            // },
            children: [
              {
                icon: <></>,
                key: 'tableExportSql',
                label: <span>{i18next.t('dbmEditor.treeMenu.tableExportSql')}</span>,
                onClick: (e) => {
                  const databaseKey = cutStringAtDash(currentNode.key,2)
                  const nodeInfo = findNodeByKey(filteredData, databaseKey)
                  const tableDDLStr  = getSQLConverter("getTableDDL",{
                    database: nodeInfo.title, 
                    tableName: currentNode.title
                  })
                  let timestamp = utilsFormatTimestampStr(new Date().getTime())
                  let fileName = nodeInfo.title+'-'+currentNode.title+'-onlyStruct.zip'
                  let filePath = '/export/'+timestamp+'/'
                  let download  =`${server}/storages/${getCurrentUser().id}/download?file=${window.encodeURIComponent(filePath+fileName)}&X-Auth-Token=${getToken()}&t=${new Date().getTime()}`
                  webSocketSendData({
                    "key": currentNode.key+"-Export-onlyStruct",
                    "retType": "exportTableOnlyStructJsonResult",
                    "data":  tableDDLStr,
                    "attr":{
                      assetId: nodeInfo.attr.assetId,
                      title:'导出表',
                      content:'导出表-仅结构',
                      database: nodeInfo.title,
                      table: currentNode.title,
                      filePath: filePath,
                      fileName: fileName,
                      download: download,
                      storageId:getCurrentUser().id,
                      timestamp :timestamp,
                      sqlCommand: tableDDLStr
                    }
                  });
                  doExport(currentNode.key+'-Export-onlyStruct','start',"导出表",'导出表-仅结构',nodeInfo.title+'.'+currentNode.title);
                  setShowMenu(false);
                },
              },
              {
                icon: <></>,
                key: 'tableExportData',
                label: <span>{i18next.t('dbmEditor.treeMenu.tableExportData')}</span>,
                onClick: (e) => {
                  const databaseKey = cutStringAtDash(currentNode.key,2)
                  const nodeInfo = findNodeByKey(filteredData, databaseKey)
                  const tableDDLStr  = getSQLConverter("getTableDDL",{
                    database: nodeInfo.title, 
                    tableName: currentNode.title
                  })
                  let timestamp = utilsFormatTimestampStr(new Date().getTime())
                  let fileName = nodeInfo.title+'-'+currentNode.title+'-structData.zip'
                  let filePath = '/export/'+timestamp+'/'
                  let download  =`${server}/storages/${getCurrentUser().id}/download?file=${window.encodeURIComponent(filePath+fileName)}&X-Auth-Token=${getToken()}&t=${new Date().getTime()}`
                  webSocketSendData({
                    "key": currentNode.key+"-Export-structData",
                    "retType": "exportTableStructDataJsonResult",
                    "data":  tableDDLStr,
                    "attr":{
                      assetId: nodeInfo.attr.assetId,
                      title:'导出表',
                      content:'导出表-结构与数据',
                      database: nodeInfo.title,
                      table: currentNode.title,
                      filePath: filePath,
                      fileName: fileName,
                      download: download,
                      storageId:getCurrentUser().id,
                      timestamp :timestamp,
                      sqlCommand: tableDDLStr
                    }
                  });
                  doExport(currentNode.key+'-Export-structData','start',"导出表",'导出表-结构与数据',nodeInfo.title+'.'+currentNode.title);
                  setShowMenu(false);
                },
              }
            ]
          },
          
          { type: 'divider', key: null, label: null, },
          {
            icon: <SyncOutlined />,
            key: 'tableReflish',
            label: <span>{i18next.t('dbmEditor.treeMenu.refresh')}</span>,
            onClick: () => {
              toast.success("刷新成功")
              setShowMenu(false)
            },
          },
        ]}
      />
    );
    // 字段右键弹出菜单
    const columnsMenu = (
      <Menu className='tree-node-menu-box' selectable={false}
        items={[
          {
            key: 'add',
            label: <span>编辑字段</span>,
            onClick: () => {
              toast.success("编辑字段成功")
              setShowMenu(false)
            },
          },
          {
            key: 'delete',
            label: <span>添加字段</span>,
            onClick: () => {
              toast.success("添加字段成功")
              setShowMenu(false)
            },
          },
          {
            key: 'update',
            label: <span>删除字段</span>,
            onClick: () => {
              toast.success("删除字段成功")
              showConfirmModal("删除字段","确定要删除字段吗？",null,()=>{
                // todo 删除字段
              })
              setShowMenu(false)
            },
          },
          {
            key: 'rename',
            label: <span>重命名</span>,
            onClick: () => {
              setRenameModalObj({
                title: '重命名',
                label: '新字段名',
                labelCol: { span: 4 },
                rules: [
                 {
                   required: true,
                   message: '请输入新字段名',
                 },
                ],
                value: currentNode.title,
                placeholder:'请输入新字段名',
                callback:(value)=>{
                 toast.success("重命名")
                }
              })
              setShowRenameModalVisible(true);
              setShowMenu(false)
            },
          },
          { type: 'divider', key: null, label: null, },
          {
            key: 'reflish',
            label: <span>{i18next.t('dbmEditor.treeMenu.refresh')}</span>,
            onClick: () => {
              toast.success("刷新成功")
              setShowMenu(false)
            },
          },
        ]}
      />
    );

    // 视图右键弹出菜单
    const viewMenu = (
      <Menu className='tree-node-menu-box' selectable={false}
        items={[
          {
            key: 'add',
            label: <span>{i18next.t('dbmEditor.treeMenu.editView')}</span>,
            onClick: () => {
              const databaseKey = cutStringAtDash(currentNode.key,2)
              const nodeInfo = findNodeByKey(filteredData, databaseKey)
              toast.success("编辑")
              addTab({
                type:SQL_EDIT_MODE.VIEW,
                key:currentNode.key,
                title:currentNode.title,
                assetId:nodeInfo.attr.assetId
              })
              setShowMenu(false)
            },
          },
          {
            key: 'rename',
            label: <span>{i18next.t('dbmEditor.treeMenu.renameView')}</span>,
            onClick: () => {
             
              setRenameModalObj({
                title: '重命名',
                label: '新视图名',
                labelCol: { span: 4 },
                rules: [
                 {
                   required: true,
                   message: '请输入新视图名',
                 },
                ],
                value: currentNode.title,
                placeholder:'请输入新视图名',
                callback:(value)=>{
                 toast.success("重命名")
                }
              })
              setShowRenameModalVisible(true);
              setShowMenu(false)
            },
          },
          { type: 'divider', key: null, label: null, },
          {
            key: 'delete',
            label: <span>{i18next.t('dbmEditor.treeMenu.delView')}</span>,
            onClick: () => {
              showConfirmModal("删除视图","确定要删除视图吗？",null,()=>{
                const databaseKey = cutStringAtDash(currentNode.key,2)
                const nodeInfo = findNodeByKey(filteredData, databaseKey)
                const dropViewStr  = getSQLConverter("dropView",{
                  database: nodeInfo.title, 
                  viewName: currentNode.title,
                })
                webSocketSendData({
                  "key": currentNode.key+"-dropView",
                  "retType": "KeyValueJsonResult",
                  "data":  dropViewStr,
                  "attr": {
                    assetId: nodeInfo.attr.assetId,
                    database: nodeInfo.title,
                    viewName: currentNode.title,
                    timestamp :new Date().getTime(),
                    sqlCommand : dropViewStr
                  }
                });
              })
              setShowMenu(false)
            },
          },
        ]}
      />
    );

    // 函数右键弹出菜单
    const functionMenu = (
      <Menu className='tree-node-menu-box' selectable={false}
        items={[
          {
            key: 'add',
            label: <span>{i18next.t('dbmEditor.treeMenu.editFun')}</span>,
            onClick: () => {
              toast.success("新建函数成功")
              const databaseKey = cutStringAtDash(currentNode.key,2)
              const nodeInfo = findNodeByKey(filteredData, databaseKey)
              addTab({
                  type:SQL_EDIT_MODE.FUNCTION,
                  key:currentNode.key,
                  title:currentNode.title,
                  assetId:nodeInfo.attr.assetId
                })
              setShowMenu(false)
            },
          },
          // {
          //   key: 'rename',
          //   label: <span>重命名</span>,
          //   onClick: () => {
          //     setRenameModalObj({
          //       title: '重命名',
          //       label: '新函数名',
          //       labelCol: { span: 4 },
          //       rules: [
          //        {
          //          required: true,
          //          message: '请输入新函数名',
          //        },
          //       ],
          //       value: currentNode.title,
          //       placeholder:'请输入新函数名',
          //       callback:(value)=>{
          //        toast.success("重命名成功")
          //       }
          //     })
          //     setShowRenameModalVisible(true);
          //     setShowMenu(false)
          //   },
          // },
          { type: 'divider', key: null, label: null, },
          {
            key: 'delete',
            label: <span>{i18next.t('dbmEditor.treeMenu.delFun')}</span>,
            onClick: () => {
              showConfirmModal("删除函数","确定要删除函数吗？",null,()=>{
                const databaseKey = cutStringAtDash(currentNode.key,2)
                const nodeInfo = findNodeByKey(filteredData, databaseKey)
                const dropFunctionStr  = getSQLConverter("dropFunction",{
                  database: nodeInfo.title, 
                  functionName: currentNode.title,
                })
                webSocketSendData({
                  "key": currentNode.key+"-dropFunction",
                  "retType": "KeyValueJsonResult",
                  "data":  dropFunctionStr,
                  "attr": {
                    assetId: nodeInfo.attr.assetId,
                    database: nodeInfo.title,
                    functionName: currentNode.title,
                    timestamp :new Date().getTime(),
                    sqlCommand : dropFunctionStr
                  }
                });
              })
              setShowMenu(false)
            }
          },
        ]}
      />
    );

    // 流程右键弹出菜单
    const procedureMenu = (
      <Menu className='tree-node-menu-box' selectable={false}
        items={[
          {
            key: 'add',
            label: <span>{i18next.t('dbmEditor.treeMenu.editProcedure')}</span>,
            onClick: () => {
              const databaseKey = cutStringAtDash(currentNode.key,2)
              const nodeInfo = findNodeByKey(filteredData, databaseKey)
              toast.success("新建成功")
              addTab({
                type:SQL_EDIT_MODE.PROCEDURE,
                key:currentNode.key,
                title:currentNode.title,
                assetId:nodeInfo.attr.assetId
              })
              setShowMenu(false)
            }
          },
          // {
          //   key: 'rename',
          //   label: <span>重命名</span>,
          //   onClick: () => {
          //     setRenameModalObj({
          //       title: '重命名',
          //       label: '新存储过程名',
          //       labelCol: { span: 6 },
          //       rules: [
          //        {
          //          required: true,
          //          message: '请输入新存储过程名',
          //        },
          //       ],
          //       value: currentNode.title,
          //       placeholder:'请输入新存储过程名',
          //       callback:(value)=>{
          //        toast.success("重命名成功")
          //       }
          //     })
          //     setShowRenameModalVisible(true);
          //     setShowMenu(false)
          //   }
          // },
          { type: 'divider', key: null, label: null, },
          {
            key: 'delete',
            label: <span>{i18next.t('dbmEditor.treeMenu.delProcedure')}</span>,
            onClick: () => {
              showConfirmModal("删除存储过程","确定要删除存储过程吗？",null,()=>{
                const databaseKey = cutStringAtDash(currentNode.key,2)
                const nodeInfo = findNodeByKey(filteredData, databaseKey)
                const dropProcedureStr  = getSQLConverter("dropProcedure",{
                  database: nodeInfo.title, 
                  procedureName: currentNode.title,
                })
                webSocketSendData({
                  "key": currentNode.key+"-dropProcedure",
                  "retType": "KeyValueJsonResult",
                  "data":  dropProcedureStr,
                  "attr": {
                    assetId: nodeInfo.attr.assetId,
                    database: nodeInfo.title,
                    procedureName: currentNode.title,
                    timestamp :new Date().getTime(),
                    sqlCommand : dropProcedureStr
                  }
                });
              })
              setShowMenu(false)
            }
          },
        ]}
      />
    );

    // SQLs右键弹出菜单
    const sqlMenu = (
      <Menu className='tree-node-menu-box' selectable={false}
        items={[
          {
            key: 'add',
            label: <span>{i18next.t('dbmEditor.treeMenu.openSql')}</span>,
            onClick: () => {
              // toast.success("打开查询器")
              const node = expandedKeys.filter(key => key !== currentNode.key)
              const startKey = cutStringAtDash(currentNode.key,3)
              const sqlsId = currentNode.key.replace(startKey+"-","")
              const databaseKey = cutStringAtDash(currentNode.key,2)
              const nodeInfo = findNodeByKey(filteredData, databaseKey)
              debugLog(" currentNode ",currentNode)
              addTab({
                type: SQL_EDIT_MODE.EDITOR,
                key: sqlsId,
                title: currentNode.title,
                dbName: currentNode.dbName,
                sql: currentNode.content,
                assetId:nodeInfo.attr.assetId 
              })
              // setTabValue(currentNode.content)
              setShowMenu(false)
            }
          },
          {
            key: 'rename',
            label: <span>{i18next.t('dbmEditor.treeMenu.renameSql')}</span>,
            onClick: () => {
              setRenameModalObj({
                title: '重命名',
                label: '新查询器名',
                labelCol: { span: 6 },
                rules: [
                 {
                   required: true,
                   message: '请输入新查询器名',
                 },
                ],
                value: currentNode.title,
                placeholder:'请输入新查询器名',
                callback:(value)=>{
                  // console.log(" ####currentNode  ",currentNode)
                   let param = {
                    id:currentNode.id,
                    name: value.newName,
                    dbName: currentNode.dbName
                  }
                  sqlsCreateOrUpdate(param).then(res=>{ 
                    let tabsCurrentTmp = getTabByID(currentNode.id)
                    if(tabsCurrentTmp){
                      setTabNameByTabIndex(value.newName,tabsCurrentTmp.id)
                    }
                    toast.success("重命名成功")
                  })
                }
              })
              setShowRenameModalVisible(true);
              setShowMenu(false)
            }
          },
          { type: 'divider', key: null, label: null, },
          {
            key: 'delete',
            label: <span>{i18next.t('dbmEditor.treeMenu.delSql')}</span>,
            onClick: () => {
              const startKey = cutStringAtDash(currentNode.key,3)
              const sqlsId = currentNode.key.replace(startKey+"-","")
              debugLog(" sqlsId ",sqlsId)
              const databaseKey = cutStringAtDash(currentNode.key,2)
              const nodeInfo = findNodeByKey(filteredData, databaseKey)
              debugLog(" nodeInfo ",nodeInfo)
              toast.success("删除查询器成功 ")
              showConfirmModal("删除查询器","确定要删除查询器吗？",null,()=>{
                // todo 删除查询器
                sqlsDelete({id:sqlsId,key:databaseKey,dbName:nodeInfo.title}).then(res=>{
                  // sqlsAll({key:databaseKey,dbName:database.title})
                })
              })
              setShowMenu(false)
            }
          },
        ]}
      />
    );
    const [pageX, setPageX] = useState(0);
    const [pageY, setPageY] = useState(0);
    const [showMenu, setShowMenu] = useState(false);

    const dropdownElement: React.RefObject<HTMLDivElement> = useRef(null);
  
    useEffect(() => {
      focusDropdown();
    }, [showMenu]);
  
 
  
    const focusDropdown = () => {
      if (dropdownElement.current) {
        dropdownElement.current?.focus();
      }
    };
  
    const renderMenu = () => {
      if (pageX && pageY) {
        return (
          <div
            tabIndex={-1}
            className='tree-node-menu'
            style={{
              display: showMenu ? 'inherit' : 'none',
              position: 'fixed',
              left: pageX - 16,
              top: pageY + 8,
            }}
            ref={dropdownElement}
            onBlur={(e) => {
              e.preventDefault();
              e.stopPropagation();
              if (!dropdownElement.current.contains(e.relatedTarget)) {
                setShowMenu(false);
              }
            }}
          >
           { currentNode.menuType === 'databaseMenu' && databaseMenu}
           { currentNode.menuType === 'tablesMenu' && tablesMenu}
           { currentNode.menuType === 'tableMenu' && tableMenu}
           {/* { currentNode.menuType === 'columnsMenu' && columnsMenu} */}
           { currentNode.menuType === 'viewsMenu' && viewsMenu}
           { currentNode.menuType === 'viewMenu' && viewMenu}
           
           { currentNode.menuType === 'functionsMenu' && functionsMenu}
           { currentNode.menuType === 'functionMenu' && functionMenu}

           { currentNode.menuType === 'proceduresMenu' && proceduresMenu}
           { currentNode.menuType === 'procedureMenu' && procedureMenu}

           { currentNode.menuType === 'sqlsMenu' && sqlsMenu}
           { currentNode.menuType === 'sqlMenu' && sqlMenu}
          </div>
        );
      }
      return null;
    };
  
    const handleRightClick = ({ event, node }: any) => {
      event.stopPropagation();
      setPageX(event.pageX);
      setPageY(event.pageY);
      setShowMenu(true);
      setCurrentNode(node);
      //模拟选中
      // onSelect(null, {node:node});
    };
 


    return (
      <div>
        <div className="flex items-center ml-1 mt-2 mb-2">
            <Input  type="text"
              value={filter}
              placeholder="输入搜索内容"
              className="search-bar"
              allowClear
              onChange={handleSearchChange} ></Input>
            <div className="ml-2 mr-2">
              {expandedKeys.length === 0 && (
                  <Button  size="small" icon={<FullscreenOutlined />} onClick={handleExpandAll}/>
              )}
              {expandedKeys.length > 0 && (
                 <Button  size="small" icon={<FullscreenExitOutlined />}  onClick={handleCollapseAll}/>
              )}
            </div>
        </div>
        <div className="overflow-auto" style={{ height: 'calc(100vh - 110px)' }}>
          {filteredData.length ==0 ?
              <div className="w-full flex text-center h-80 justify-center items-center font-bold font-mono text-gray-400 text-2xl px-6">暂无数据</div>
              :
              <DirectoryTree
                directoryNodeSelectedBg="#6366f1"
                directoryNodeSelectedColor="#6366f1"
                showLine={true}
                showIcon={true}
                // multiple
                expandedKeys={expandedKeys}
                autoExpandParent={false}
                defaultExpandAll={false}
                //  defaultExpandedKeys={['0-0-0']}
                onSelect={onSelect}
                onExpand={onExpand}
                treeData={filteredData}
                onRightClick={handleRightClick}
                // titleRender={titleRender}
                // titleRender={(item) => {
                //  return  <Dropdown overlay={menu} trigger={['contextMenu']}>
                //             <span title={item.title} className='tree-Node'>{item.title}</span> 
                //          </Dropdown>
                // }}
            />
            
          }
        </div>
        {renderMenu()}
      </div>
    ); 
};

export default DataTree;