import React, { useContext } from "react";
import toast from "react-hot-toast";
import { debugLog } from "../../../../../common/logger";
import { VisibilityContext } from '../../../components/Utils/visibilityProvider';
function Buttons({sql}) {
  const { tabs,tabIndex,
    getTabByID,
    setTabValue ,
    setTabWhere,setTabOrderBy,
    showConfirmModal ,
    webSocketSendData
  } =  useContext(VisibilityContext);
  const runQuery = () => {

    const tabItem = getTabByID(tabIndex)
    debugLog(" DesignerPanle Buttons sql ", sql)
    // debugLog(" tabItem ",tabItem)
    // const key = tabItem.id+ "-createFunction";
    // debugLog(" tabItem.sql ",tabItem.sql)
    if(!sql){
      toast.error("请输入正确的表信息");
      return 
    }
    webSocketSendData({
      "key": tabItem.id,
      "retType": 'KeyValueJsonResult',
      "data": sql ,
      "attr":{
        database: tabItem.title.split(".")[0],
        tableName: tabItem.title,
        timestamp :new Date().getTime(),
        sqlCommand : sql
      }
    });
    // setShowTableRenameModalVisible(true);
    // const { tableHeaders, tableRows } = getTableInfo(1);
    // setTabQuery("value");
    // setTabHeaders(tableHeaders);
    // setTabRows(tableRows);

    // const temp = [];
    // if (tableHeaders.length > 0 && tableRows.length > 0) {
    //   temp.push(tableHeaders);
    //   tableRows.forEach((row) => {
    //     temp.push(row);
    //   });
    //   // setCSVData(temp);
    //   if (temp.length > 0) {
    //     toast.success("Query run");
    //   } else {
    //     toast.error("This didn't work.");
    //   }
    // }
    // // setTabData("",tableHeaders,tableRows,temp);
    // setTabValue("select * from customers;")
  };

  const reset = () => {
    showConfirmModal("清空查询内容","确定要清空内容吗？",null,()=>{
      debugLog("清空查询内容");
      setTabWhere('');
      setTabOrderBy('');
    })

  };
  return (
    <div className="flex">
      {/* <div className="p-1">
        <button
          title="重置"
          onClick={()=>reset()}
          className="flex mx-auto text-white bg-indigo-500 border-0 p-1 h-6 px-1 focus:outline-none hover:bg-indigo-600  text-lg justify-center items-center"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 30 37.243"
          >
            <g
              id="Icon_feather-repeat"
              data-name="Icon feather-repeat"
              transform="translate(-3 0.621)"
            >
              <path
                id="Path_22"
                data-name="Path 22"
                d="M25.5,1.5l6,6-6,6"
                fill="none"
                stroke="#ffffff"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="3"
              />
              <path
                id="Path_23"
                data-name="Path 23"
                d="M4.5,16.5v-3a6,6,0,0,1,6-6h21"
                fill="none"
                stroke="#ffffff"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="3"
              />
              <path
                id="Path_24"
                data-name="Path 24"
                d="M10.5,34.5l-6-6,6-6"
                fill="none"
                stroke="#ffffff"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="3"
              />
              <path
                id="Path_25"
                data-name="Path 25"
                d="M31.5,19.5v3a6,6,0,0,1-6,6H4.5"
                fill="none"
                stroke="#ffffff"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="3"
              />
            </g>
          </svg>
        </button>
      </div> */}
      <div className="p-1">
        <button
          title="保存"
          onClick={()=>runQuery()}
          className="flex mx-auto text-white bg-indigo-500 border-0 py-1 h-6 px-1 focus:outline-none hover:bg-indigo-600 text-lg justify-center items-center"
        >
          <div className="pr-2">
          <svg t="1726208923359" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="11295" width="16" height="16"><path d="M725.333333 128l-512 0c-47.146667 0-85.333333 38.186667-85.333333 85.333333l0 597.333333c0 47.146667 38.186667 85.333333 85.333333 85.333333l597.333333 0c47.146667 0 85.333333-38.186667 85.333333-85.333333l0-512-170.666667-170.666667zM512 810.666667c-70.613333 0-128-57.386667-128-128s57.386667-128 128-128 128 57.386667 128 128-57.386667 128-128 128zM640 384l-426.666667 0 0-170.666667 426.666667 0 0 170.666667z" fill="#ffffff" p-id="11296"></path></svg>
          </div>
          <div className="font-bold font-mono ">保存</div>
        </button>
      </div>
    </div>
  );
}

export default Buttons;
