import { Tabs } from 'antd';
import React, { useCallback, useContext, useEffect, useState } from 'react';
import SplitPane from 'react-split-pane';
import { VisibilityContext } from '../../Utils/visibilityProvider';
import Buttons from './Buttons';
import AttrPanel from './components/AttrPanel';
import DDLPanel from './components/DDLPanel';
import EditorFunctionPanel from './components/EditorFunctionPanel';
const { TabPane } = Tabs;
// type TargetKey = React.MouseEvent | React.KeyboardEvent | string;
// 设计器面板
function FunctionPanel() {
  const {
    tabs,
    tabIndex,
    getTabByID,
    getSQLConverter,
  } = useContext(VisibilityContext);

  const [sqlEditorHeight, setSqlEditorHeight] = React.useState(window.innerHeight * 0.4);
  const [tableHeight, setTableHeight] = React.useState(0);
  const [ddlData,setDdlData] = useState('')
  const [functionSql,setFunctionSql] = useState('');
  const [optionData,setOptionData] = useState({})
  const [createViewStructure,setViewTableStructure] = useState('')
  const convertToDdl = useCallback(() => {
    // 通过设计器结构生成创建表语句
    let ddlSql = getSQLConverter('createFunction', createViewStructure)
    // debugLog(" ### ddlSql",ddlSql)
    setDdlData(ddlSql);
    // setTabValue(ddlSql);
  }, [createViewStructure]);
  
  useEffect(() => { 
    //更新设计器总体结构
    setViewTableStructure(prevState => ({
      ...prevState,
      functionName: tab.title,
      sql:functionSql,
      optionData: optionData,
    }));
    // debugLog(" setViewTableStructure optionData ",optionData)
    // debugLog(" setViewTableStructure functionSql ",functionSql)
  }, [optionData,functionSql]);

  useEffect(() => {
    //更新设计器总体结构完成，调用SQL翻译器生成SQL
    // debugLog("createViewStructure 已更新: ", createViewStructure);
    convertToDdl();
  }, [createViewStructure]);  
  const change=(size) =>{
    const totalHeight = window.innerHeight; 
    setTableHeight(totalHeight - 142);
    // debugLog(" tableHeight ",tableHeight )
  }
  const [tab,setTab] =  useState(getTabByID(tabIndex));
  useEffect(() => {
    change()
  },[tabs,tabIndex]);
  useEffect(() => {
    setFunctionSql('CREATE FUNCTION ' +tab.title+'() \n BEGIN \n\t \n END')
  }, [tab]);

  const DESIGNER_PANEL_MODE = {
    EDITOR_FUNCTION_PANEL:'EditorFunctionPanel',
    SENIOR:'Senior',
    DDL_PANEL:'DDLPanel',
  }
  const tabss = [
    {
      key: "1",
      label: "编辑器",
      type: DESIGNER_PANEL_MODE.EDITOR_FUNCTION_PANEL,
    },
    // {
    //   key: "2",
    //   label: "高级",
    //   type: DESIGNER_PANEL_MODE.SENIOR,
    // },
    {
      key: "3",
      label: "SQL预览",
      type: DESIGNER_PANEL_MODE.DDL_PANEL,
    }
  ];
  const [tabssIndex,setTabssIndex] = React.useState(tabss[0].key);
  const onChange = (key) => {
    // debugLog(key);
    setTabssIndex(key)
  };
  return (
      <SplitPane 
        className="height100vh1"
        split="horizontal" 
        initialSize={'20%,80%'}
        onChange={change} >
        <div initialSize={'20%'} minSize="118px">
            <div className="flex w-full justify-between ">
              <div className="text-gray-600 text-center m-1 panel-title">
                函数编辑器
              </div>
              <Buttons sql={ddlData}/>
            </div>
            {/* <FilterSqlEditor value={tab.sql} setValue={setTabValue}></FilterSqlEditor> */}
        </div>
        <div initialSize={'80%'} minSize="118px" >
          {/* <Table   query={tab.query} headers={tab.headers} rows={tab.rows} csvData={tab.csvData} /> */}
          <Tabs
            type="card"
            onChange={onChange}
            activeKey={tabssIndex}
            size="small">
              {tabss.map((tab) => (
                <TabPane key={tab.key} tab={tab.label} >
                  {
                    tab.type === DESIGNER_PANEL_MODE.EDITOR_FUNCTION_PANEL && 
                      <EditorFunctionPanel 
                        value={functionSql}
                        sqlEditorHeight={tableHeight} 
                        setValue={setFunctionSql}/>
                  }
                  {
                    tab.type === DESIGNER_PANEL_MODE.SENIOR && 
                      <AttrPanel
                        optionData={optionData} 
                        updateData={setOptionData}/>
                  }
                  {
                    tab.type === DESIGNER_PANEL_MODE.DDL_PANEL && 
                      <DDLPanel 
                        value={ddlData} 
                        setValue={setDdlData} 
                        currentHeight={tableHeight}/> 
                  }
                </TabPane>
              ))}
          </Tabs>
        </div>
      </SplitPane>
  );
}

export default FunctionPanel;