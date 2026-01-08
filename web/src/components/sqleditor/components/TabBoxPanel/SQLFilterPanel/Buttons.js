import { useContext } from "react";
import toast from "react-hot-toast";
import { debugLog } from "../../../../../common/logger";
import { VisibilityContext } from '../../../components/Utils/visibilityProvider';
function Buttons() {
  const {
    tabIndex,
    getTabByID,
    setTabWhere, setTabOrderBy,
    showConfirmModal,
    getSQLConverter,
    defaultPageSize,
    webSocketSendData,
    setOperationLabel
  } = useContext(VisibilityContext);
  const runQuery = () => {
    setOperationLabel("运行查询")
    const tabItem = getTabByID(tabIndex)

    // debugLog(" tabItem ",tabItem)
    // const key = tabItem.id+ "-createFunction";
    // debugLog(" tabItem.sql ",tabItem.sql)
    const params = {
      database: tabItem.title.split(".")[0],
      tableName: tabItem.title.split(".")[1],
    }
    // debugLog(" ### params ",params)
    let sqlStr = getSQLConverter('selectTableData', params).replace(/;/g, '')
    if (tabItem.where) {
      sqlStr += " where " + tabItem.where
    }
    if (tabItem.orderBy) {
      sqlStr += " order by " + tabItem.orderBy
    }
    sqlStr += ";"
    // debugLog(" ### sqlStr  ",sqlStr)
    if (!sqlStr) {
      toast.error("请输入正确的过滤器信息");
      return
    }

    webSocketSendData({
      "key": tabItem.id,
      "retType": 'tableRsesult',
      "data": sqlStr,
      "attr": {
        totalRows: 0,
        pageSize: defaultPageSize,
        currentPage: 1,
        tabId: tabItem.id,
        newTabIndex: null,
        timestamp: new Date().getTime(),
        database: params.database,
        sqlCommand: sqlStr,
        timeInSeconds: 0,
      }
    });

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
    showConfirmModal("清空查询内容", "确定要清空内容吗？", null, () => {
      debugLog("清空查询内容");
      setTabWhere('');
      setTabOrderBy('');
      setOperationLabel("清空查询条件")
    })

  };
  return (
    <div className="flex">
      <div className="p-1">
        <button
          title="重置"
          onClick={() => reset()}
          className="flex mx-auto text-white bg-indigo-500 border-0 p-1 h-6 px-1 focus:outline-none hover:bg-indigo-600  text-lg justify-center items-center"
        >
          <svg t="1726208649438" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="3275" width="16" height="16"><path d="M899.1 869.6l-53-305.6H864c14.4 0 26-11.6 26-26V346c0-14.4-11.6-26-26-26H618V138c0-14.4-11.6-26-26-26H432c-14.4 0-26 11.6-26 26v182H160c-14.4 0-26 11.6-26 26v192c0 14.4 11.6 26 26 26h17.9l-53 305.6c-0.3 1.5-0.4 3-0.4 4.4 0 14.4 11.6 26 26 26h723c1.5 0 3-0.1 4.4-0.4 14.2-2.4 23.7-15.9 21.2-30zM204 390h272V182h72v208h272v104H204V390z m468 440V674c0-4.4-3.6-8-8-8h-48c-4.4 0-8 3.6-8 8v156H416V674c0-4.4-3.6-8-8-8h-48c-4.4 0-8 3.6-8 8v156H202.8l45.1-260H776l45.1 260H672z" p-id="3276" fill="#ffffff"></path></svg>
        </button>
      </div>
      <div className="p-1">
        <button
          title="执行"
          onClick={() => runQuery()}
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
          <div className="font-bold font-mono ">执行</div>
        </button>
      </div>
    </div>
  );
}

export default Buttons;
