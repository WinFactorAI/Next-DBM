import React, { useContext } from "react";
import toast from 'react-hot-toast';
import { debugLog } from "../../../../../common/logger";
import { VisibilityContext } from '../../../components/Utils/visibilityProvider';
function Buttons(props) {
  const {
    setTabWhere,
    setTabOrderBy,
    showConfirmModal ,
    getSQLConverter,
    webSocketSendData,
    setTabSrcObjDisObjReset,
    setOperationLabel
  } =  useContext(VisibilityContext);

  const [isRunBtn, setIsRunBtn] = React.useState(true);
  const extractPaths = (data) => {
    const paths = [];
    // 遍历每个子数组
    data?.forEach(subArray => {
      const databaseName = subArray[0].label;
      const tableName = subArray[2].label;
      paths.push(`${databaseName}.${tableName}`);
    });
    return paths;
  }

  const runQuery = async () => {
    setOperationLabel("对比表开始...")
    setIsRunBtn(false);
    setTabSrcObjDisObjReset();
    const srcObjArry = extractPaths(props.tabItem.srcObjArry);
    const distObjArry = extractPaths(props.tabItem.disObjArry)
    // 处理 srcObjArry 数组
    for (const [index, srcObj] of srcObjArry.entries()) {
      debugLog("srcObjArry index", index);
      const database = srcObj.split('.')[0];
      const tableName = srcObj.split('.')[1];
      
      // 获取查询指令
      const sqlStr = getSQLConverter( "getTableDDL", {
        database: database,
        tableName: tableName
      });
      
      if (sqlStr) {
        // 延时 index * 1000 毫秒
        setOperationLabel("获取表结构中..."+tableName)
        await new Promise((resolve) => setTimeout(resolve, 1000));
        webSocketSendData({
          "key": srcObj + "-getDiffTableDDL",
          "retType": "KeyValueJsonResult",
          "data": sqlStr,
          "attr": {
            tabId: props.tabItem.id,
            key: srcObj,
            dataType: 'srcObj',
            timestamp: new Date().getTime(),
            nextAction: 'getDiffTableDDL',
            sqlCommand: sqlStr,
          }
        });
      }
    }

    // 等待 2 秒后再处理 distObjArry 数组
    await new Promise(resolve => setTimeout(resolve, 2000));

    // 处理 distObjArry 数组
    for (const [index, distObj] of distObjArry.entries()) {
      debugLog("distObjArry index", index);
      const database = distObj.split('.')[0];
      const tableName = distObj.split('.')[1];

      // 获取查询指令
      const sqlStr = getSQLConverter("getTableDDL", {
        database: database,
        tableName: tableName
      });

      if (sqlStr) {
        // 延时 index * 1000 毫秒
        setOperationLabel("获取表结构中..."+tableName)
        await new Promise((resolve) => setTimeout(resolve, 1000));
        webSocketSendData({
          "key": distObj + "-getDiffTableDDL",
          "retType": "KeyValueJsonResult",
          "data": sqlStr,
          "attr": {
            tabId: props.tabItem.id,
            key: distObj,
            dataType: 'distObj',
            timestamp: new Date().getTime(),
            nextAction: 'getDiffTableDDL',
            sqlCommand: sqlStr,
          }
        });
      }
    }
    setIsRunBtn(true);
    setOperationLabel("获取差异表DDL完成")
  };

  const reset = () => {
    showConfirmModal("清空查询内容","确定要清空内容吗？",null,()=>{
      debugLog("清空查询内容");
      setTabSrcObjDisObjReset();
      setOperationLabel("清空差异内容")
    })

  };
  return (
    <div className="flex">
      <div className="p-1">
        <button
          title="重置"
          onClick={()=>reset()}
          className="flex mx-auto text-white bg-indigo-500 border-0 p-1 h-6 px-1 focus:outline-none hover:bg-indigo-600  text-lg justify-center items-center"
        >
           <svg t="1726208649438" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="3275" width="16" height="16"><path d="M899.1 869.6l-53-305.6H864c14.4 0 26-11.6 26-26V346c0-14.4-11.6-26-26-26H618V138c0-14.4-11.6-26-26-26H432c-14.4 0-26 11.6-26 26v182H160c-14.4 0-26 11.6-26 26v192c0 14.4 11.6 26 26 26h17.9l-53 305.6c-0.3 1.5-0.4 3-0.4 4.4 0 14.4 11.6 26 26 26h723c1.5 0 3-0.1 4.4-0.4 14.2-2.4 23.7-15.9 21.2-30zM204 390h272V182h72v208h272v104H204V390z m468 440V674c0-4.4-3.6-8-8-8h-48c-4.4 0-8 3.6-8 8v156H416V674c0-4.4-3.6-8-8-8h-48c-4.4 0-8 3.6-8 8v156H202.8l45.1-260H776l45.1 260H672z" p-id="3276" fill="#ffffff"></path></svg>
        </button>
      </div>
      <div className="p-1">
        <button
          title="执行"
          onClick={()=>{
            if(isRunBtn === false){
              toast.success("请等待上次查询完成");
              return;
            }
            runQuery();
          }}
          className="flex mx-auto text-white bg-indigo-500 border-0 py-1 h-6 px-1 focus:outline-none hover:bg-indigo-600 text-lg justify-center items-center"
        >
          <div className="pr-2">
          <svg t="1726209111999" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="19476" width="16" height="16"><path d="M116.364 837.818h279.272v93.091H23.273V93.091h372.363v93.09H116.364v651.637z m512 0h93.09v93.091h-93.09v-93.09z m139.636 0h93.09v93.091H768v-93.09z m139.636 93.091v-93.09h93.091v93.09h-93.09z m0-325.818V512h93.091v93.09h-93.09z m0 139.636v-93.09h93.091v93.09h-93.09z m0-279.272v-93.091h93.091v93.09h-93.09z m0-139.637v-93.09h93.091v93.09h-93.09z m0-139.636V93.09h93.091v93.09h-93.09z m-46.545 0H768V93.09h93.09v93.09z m-139.636 0h-93.091V93.09h93.09v93.09zM488.727 0h93.091v1024h-93.09V0z" fill="#ffffff" p-id="19477"></path></svg>
          </div>
          <div className="font-bold font-mono ">对比</div>
        </button>
      </div>
    </div>
  );
}

export default Buttons;
