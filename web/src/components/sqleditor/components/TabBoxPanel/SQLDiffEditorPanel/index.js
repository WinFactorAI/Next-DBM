import React, { useContext, useEffect, useState } from 'react';
import SplitPane from 'react-split-pane';
import { debugLog } from "../../../../../common/logger";
import Loading from '../../Loading/Loading';
import { VisibilityContext } from '../../Utils/visibilityProvider';
import Buttons from './Buttons';
import DiffEditor from './DiffEditor';
import FilterSelect from './FilterSelect';
// 比较器
function SQLFilterPanel() {
  const {
    tabs,
    tabIndex,
    getTabByID,
    getSQLConverter,
    webSocketSendData,
  } = useContext(VisibilityContext);

  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const interval = setInterval(() => {
      setLoading(false);
    }, 1000);

    // 清理定时器
    return () => clearInterval(interval);
  }, []);

  const [sqlEditorHeight, setSqlEditorHeight] = React.useState(window.innerHeight * 0.4);
  const [tableHeight, setTableHeight] = React.useState(0);

  const change = (size) => {
    const totalHeight = window.innerHeight;
    setTableHeight(totalHeight - 140);
    // debugLog(" tableHeight ",tableHeight )
  }
  const [tab, setTab] = useState(getTabByID(tabIndex));
  useEffect(() => {
    change()
    // debugLog(" tab ",tab)
  }, [tabs, tabIndex]);

  useEffect(() => {
    // 请求获取最新的DDL信息
    const database = tab.title.split('.')[0]
    const table = tab.title.split('.')[1]
    const tableDDLStr = getSQLConverter("getTableDDL", {
      database: database,
      tableName: table
    })
    webSocketSendData({
      "key": tab.id,
      "retType": "KeyValueJsonResult",
      "data": tableDDLStr,
      "attr": {
        timestamp: new Date().getTime(),
        sqlCommand: tableDDLStr
      }
    });

  }, []);
  useEffect(() => {
    debugLog(" ##  tab detail ", tab)
  }, [tab.results]);



  return (
    <SplitPane
      className="height100vh1"
      split="horizontal"
      initialSize={'20%,80%'}
      onChange={change} >

      <div initialSize={'20%'} minSize="118px">
        <div className="flex w-full justify-between sqledit-bat">
          <div className="text-gray-600 text-center m-1 panel-title">
            对比器
          </div>
          <Buttons tabItem={tab} />
        </div>
        <FilterSelect tabItem={tab} ></FilterSelect>
      </div>
      <div initialSize={'80%'} minSize="118px" >
        <DiffEditor tabItem={tab} listHeight={tableHeight} />
      </div>
      <Loading message="Loading, please wait..." loading={loading} size={40} />
    </SplitPane>
  );
}

export default SQLFilterPanel;