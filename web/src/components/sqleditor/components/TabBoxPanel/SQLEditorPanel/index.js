import { Empty, Select, Space, Tabs } from 'antd';
import React, { useContext, useEffect, useRef, useState } from 'react';
import SplitPane from 'react-split-pane';
import { debugLog } from "../../../../../common/logger";
import { VisibilityContext } from '../../../components/Utils/visibilityProvider';
import Table from '../components/Table';
import Buttons from './Buttons';
import SqlEditor from './SqlEditor';

const { TabPane } = Tabs;
type TargetKey = React.MouseEvent | React.KeyboardEvent | string;

// 应用组件
function SQLEditorPanel({currentTab}) {
  const {
    tabs,
    tabIndex,
    setTabValue,
    setTabAttrs,
    getTabByID,
    showConfirmModal,
    dbNameList,
    setOperationLabel
  } = useContext(VisibilityContext);

  const [sqlEditorHeight, setSqlEditorHeight] = useState(window.innerHeight * 0.4);
  const [tableHeight, setTableHeight] = useState(window.innerHeight * 0.6);
  

  const tabBoxEmptyRef = useRef(null);
  const change=(size) =>{
    localStorage.setItem('splitSQLEditorPos', size);
    // debugLog(" ### size ",size)
    const totalHeight = window.innerHeight; 
    const firstPaneHeight = (totalHeight * parseFloat(size[0])) / 100;
    const secondPaneHeight = (totalHeight - firstPaneHeight -178)  ;
    setSqlEditorHeight(firstPaneHeight);
    setTableHeight(secondPaneHeight);
 
    if (tabBoxEmptyRef.current) {  
      tabBoxEmptyRef.current.style.height = `${secondPaneHeight}px`;
    }
  }
  const [tab,setTab] =  useState(getTabByID(tabIndex));
  useEffect(() => {
    // 当切窗口按是恢复高度
    if( localStorage.getItem('splitSQLEditorPos') ) {
      const totalHeight = window.innerHeight; 
      const firstPaneHeight = (totalHeight * parseFloat(localStorage.getItem('splitSQLEditorPos').split(',')[0])) / 100;
      const secondPaneHeight = (totalHeight - firstPaneHeight -176) ;
      setSqlEditorHeight(firstPaneHeight);
      setTableHeight(secondPaneHeight);
      if (tabBoxEmptyRef.current) {  
        tabBoxEmptyRef.current.style.height = `${secondPaneHeight}px`;
      }
    } 
    setTab(getTabByID(tabIndex))
  },[tabs,tabIndex]);
  
  // tabs
  const newTabIndex = useRef(1);
  const defaultPanes = new Array(1).fill(null).map((_, index) => {
    const id = String(`${newTabIndex.current}`);
    return { label: `查询结果 ${id}`, children: `Content of Tab Pane ${index + 1}`, key: id };
  });

  const [activeKey, setActiveKey] = useState(defaultPanes[0].key);
  const [items, setItems] = useState(defaultPanes);


  const onChange = (key: string) => {
    setActiveKey(key);
  };

  const add = () => {
    newTabIndex.current++
    const newActiveKey = `${newTabIndex.current}`;
    const id = String(newActiveKey);
    setItems([...items, { label: `查询结果 ${id}`, children: 'New Tab Pane', key: newActiveKey }]);
    setActiveKey(newActiveKey);
  };

  const remove = (targetKey: TargetKey) => {
    const targetIndex = items.findIndex((pane) => pane.key === targetKey);
    const newPanes = items.filter((pane) => pane.key !== targetKey);
    if (newPanes.length && targetKey === activeKey) {
      const { key } = newPanes[targetIndex === newPanes.length ? targetIndex - 1 : targetIndex];
      setActiveKey(key);
    }
    setItems(newPanes);
  };

  const onEdit = (targetKey: TargetKey, action: 'add' | 'remove') => {
    if (action === 'add') {
      add();
    } else {
      showConfirmModal("删除查询结果","确定要删除查询结果吗？",null,()=>{
        debugLog("删除查询结果");
        remove(targetKey);
      })
    }
  };
  const handleChange = (value) => {
    setTabAttrs({dbName:value})
    setOperationLabel('切换数据库 '+value)
  };
  return (
      <SplitPane 
        className="height100vh1"
        split="horizontal" 
        initialSize={'20%,80%'}
        onChange={change} >
          <div initialSize={'20%'} minSize="118px">
              <div className="flex w-full justify-between sqledit-bat">
                <div className="text-gray-600 m-1">
                  <Space> 
                    <span className="text-sm panel-title">查询器 </span>
                    <Select
                      defaultValue={tab?.dbName}
                      style={{ width: 140}}
                      size='small'
                      allowClear
                      placeholder="选择数据库"
                      onChange={handleChange}
                      options={dbNameList}
                    />
                  </Space>
                </div>
                <Buttons/>
              </div>
              <SqlEditor sqlEditorHeight={sqlEditorHeight} currentTab={currentTab} value={tab?.sql} setValue={setTabValue} />
          </div>
          <div initialSize={'80%'} minSize="118px" >
            {tab?.results?.length >0  ? (
                <Tabs
                  hideAdd
                  onChange={onChange}
                  activeKey={activeKey}
                  type="editable-card"
                  onEdit={onEdit}
                  size="small"> 
                  {tab.results.map((item) => (
                    <TabPane tab={item.label} key={item.key} closable={false} >
                      {
                        item.status === 'success' && <Table listHeight={tableHeight} item={item} query={item.query} headers={item.headers} rows={item.rows} csvData={item.csvData} />
                      }
                      {
                        item.status === 'fail' && 
                        <Space direction="vertical" style={{padding:'10px',width:'100%'}}>
                          <span >执行语句:{item.query}</span>
                          <span  style={{color:'red'}}>错误信息:{item.msg}</span>
                        </Space>
                      }
                    </TabPane>
                  ))}
                </Tabs>
              ) : (
                <div ref={tabBoxEmptyRef} className="table-empty-box w-full flex text-center justify-center items-center font-bold font-mono text-gray-400 text-2xl px-6">
                    <Empty description={'暂无数据'} image={Empty.PRESENTED_IMAGE_SIMPLE}/>
                </div>
              )
            }
          </div>
      </SplitPane>
  );
}

export default SQLEditorPanel;