import React, { useContext, useEffect, useState } from 'react';
import SplitPane from 'react-split-pane';
import { debugLog } from "../../../../../common/logger";
import { VisibilityContext } from '../../Utils/visibilityProvider';
import Table from '../components/Table';
import Buttons from './Buttons';
import FilterSqlEditor from './FilterSqlEditor';
// 应用组件
function SQLFilterPanel({ currentTab }) {
  const {
    tabs,
    tabIndex,
    setTabValue,
    getTabByID,
    getSQLConverter,
    webSocketSendData
  } = useContext(VisibilityContext);

  const [sqlEditorHeight, setSqlEditorHeight] = React.useState(window.innerHeight * 0.4);
  const [tableHeight, setTableHeight] = React.useState(0);
  const [tab, setTab] = useState(getTabByID(tabIndex));
  const change = (size) => {
    const totalHeight = window.innerHeight;
    setTableHeight(totalHeight - 172);
    debugLog(" tableHeight ", tableHeight)
  }
  useEffect(() => {
    change()
  }, [tabs, tabIndex]);

  return (
    <SplitPane
      className="height100vh1"
      split="horizontal"
      initialSize={'20%,80%'}
      onChange={change} >
      <div initialSize={'20%'} minSize="118px">
        <div className="flex w-full justify-between sqledit-bat">
          <div className="text-gray-600 text-center m-1 panel-title">
            过滤器
          </div>
          <Buttons />
        </div>
        <FilterSqlEditor currentTab={currentTab} value={tab.sql} setValue={setTabValue}></FilterSqlEditor>
      </div>
      <div initialSize={'80%'} minSize="118px" >
        {tab?.results?.map((item) => (
          <Table listHeight={tableHeight} isOperation={true} tab={tab} item={item} query={item.query} headers={item.headers} rows={item.rows} csvData={item.csvData} />
        ))}
      </div>
    </SplitPane>
  );
}

export default SQLFilterPanel;