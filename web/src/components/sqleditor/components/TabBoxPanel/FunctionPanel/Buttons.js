import React, { useContext } from "react";
import toast from "react-hot-toast";
import { debugLog } from "../../../../../common/logger";
import { VisibilityContext } from '../../../components/Utils/visibilityProvider';
function Buttons({sql}) {
  const { 
    tabs,tabIndex,
    getTabByID,
    setTabValue ,
    setTabWhere,setTabOrderBy,
    showConfirmModal ,
    setTabRows,setTabHeaders ,
    setTabQuery,
    webSocketSendData
  } =  useContext(VisibilityContext);

  const removeNewlinesAndTabs = (str) => {
    return str.replace(/[\n\t]/g, '');
  }
  const runQuery = () => {
    const tabItem = getTabByID(tabIndex)
    // debugLog(" tabItem ",tabItem)
    // const key = tabItem.id+ "-createFunction";
    // debugLog(" tabItem.sql ",tabItem.sql)
    if(!sql){
      toast.error("请输入正确的函数信息");
      return 
    }
    webSocketSendData({
      "key": tabItem.id,
      "retType": 'KeyValueJsonResult',
      "data": tabItem.sql ,
      "attr":{
        database: tabItem.title.split(".")[0],
        functionName: tabItem.title,
        timestamp :new Date().getTime(),
        sqlCommand : tabItem.sql
      }
    });
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
      <div className="p-1">
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
      </div>
      <div className="p-1">
        <button
          title="保存"
          onClick={()=>runQuery()}
          className="flex mx-auto text-white bg-indigo-500 border-0 py-1 h-6 px-1 focus:outline-none hover:bg-indigo-600 text-lg justify-center items-center"
        >
          <div className="pr-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="12"
              height="12"
              viewBox="0 0 31.499 36.001"
              className="fill-current"
            >
              <path
                id="Icon_awesome-play"
                data-name="Icon awesome-play"
                d="M29.841,15.1,5.091.464A3.356,3.356,0,0,0,0,3.368V32.625a3.372,3.372,0,0,0,5.091,2.9L29.841,20.9a3.372,3.372,0,0,0,0-5.808Z"
                transform="translate(0 -0.002)"
              />
            </svg>
          </div>
          <div className="font-bold font-mono ">保存</div>
        </button>
      </div>
    </div>
  );
}

export default Buttons;
