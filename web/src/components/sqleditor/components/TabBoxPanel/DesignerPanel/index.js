import { PlusOutlined } from '@ant-design/icons';
import { Button, Space, Tabs } from 'antd';
import React, { useCallback, useContext, useEffect, useRef, useState } from 'react';
import SplitPane from 'react-split-pane';
import { debugLog } from "../../../../../common/logger";
import { VisibilityContext } from '../../Utils/visibilityProvider';
import Buttons from './Buttons';
import CheckPanel from './components/CheckPanel';
import DDLPanel from './components/DDLPanel';
import FieldPanel from './components/FieldPanel';
import ForeignKeyPanel from './components/ForeignKeyPanel';
import IndexPanel from './components/IndexPanel';
import OptionPanel from './components/OptionPanel';
import RemarkPanel from './components/RemarkPanel';
import TriggerPanel from './components/TriggerPanel';

const { TabPane } = Tabs;

// 设计器面板
function DesignerPanel() {
  const {
    tabs,
    tabIndex,
    getTabByID,
    getSQLConverter,
    utilsCutStringAtDash,
    webSocketSendData
  } = useContext(VisibilityContext);
  const [fieldData,setFieldData] = useState([])
  const [indexData,setIndexData] = useState([])
  const [keysData,setKeysData] = useState([])
  const [triggerData,setTriggerData] = useState([])
  const [ddlData,setDdlData] = useState('')
  const [checkData,setCheckData] = useState([])
  const [remarkData,setRemarkData] = useState('')
  const [optionData,setOptionData] = useState({})
  const [tab,setTab] =  useState(getTabByID(tabIndex));
  const [actionType,setActionType] = useState(tabIndex.replace(utilsCutStringAtDash(tabIndex,-1)+'-',''))

  const [createTableStructure,setCreateTableStructure] = useState('')
  const [sqlEditorHeight, setSqlEditorHeight] = React.useState(window.innerHeight * 0.4);
  const [tableHeight, setTableHeight] = React.useState(0);

  useEffect(() => { 
    // debugLog(" ## ",actionType)
    // debugLog(" tab  ",tab)
    // 请求获取最新的DDL信息
    const database = tab.title.split('.')[0]
    const table = tab.title.split('.')[1]
    const tableDDLStr  = getSQLConverter("getTableDDL",{
      database: database, 
      tableName: table
    })
    webSocketSendData({
      "key": tab.id,
      "retType": "KeyValueJsonResult",
      "data":  tableDDLStr,
      "attr":{
        assetId: tab.assetId,
        timestamp :new Date().getTime(),
        sqlCommand : tableDDLStr
      }
    });

  }, [actionType]);

  const convertToDdl = useCallback(() => {
    // 通过设计器结构生成创建表语句 actionType
    // 'createTable' 'alterTable'
    let ddlSql = getSQLConverter('createTable', createTableStructure)
    debugLog("ddlSql ",ddlSql)
    setDdlData(ddlSql);
  }, [createTableStructure]);
  
  useEffect(() => { 
    //更新设计器总体结构
    setCreateTableStructure(prevState => ({
      ...prevState,
      tableName: tab.title,
      fieldData: [...fieldData], // 创建一个新的数组实例
      indexData: [...indexData],
      foreignKeyData:[...keysData],
      triggerData:[...triggerData],
      remark:remarkData,
      optionData:optionData,
    }));
    debugLog(" ## createTableStructure triggerData ",triggerData)
    debugLog(" ## createTableStructure optionData ",optionData)
    debugLog(" ## createTableStructure remarkData ",remarkData)
  }, [fieldData,indexData,keysData,triggerData,remarkData,optionData]);
  
  useEffect(() => {
    //更新设计器总体结构完成，调用SQL翻译器生成SQL
    // debugLog("createTableStructure 已更新: ", createTableStructure);
    convertToDdl();
  }, [createTableStructure]);
  const change=(size) =>{
    const totalHeight = window.innerHeight; 
    setTableHeight(totalHeight - 140);
    debugLog(" tableHeight ",tableHeight )
  }


  useEffect(() => {
    // setCreateTableStructure({...createTableStructure, tablename: tab.title })
    change()
    // debugLog(" ## ## TabBoxPanle tabIndex ",tabIndex);
    // debugLog(" ## ## TabBoxPanle tabs ",getTabByID(tabIndex));
    // debugLog(" ## ## TabBoxPanle tab ",tab);
    if(tab.tableStructs){
      setFieldData(tab.tableStructs.fieldData)
      setIndexData(tab.tableStructs.indexData)
      setKeysData(tab.tableStructs.foreignKeyData)
      setTriggerData(tab.tableStructs.triggerData)
      setRemarkData(tab.tableStructs.remark)
      setOptionData(tab.tableStructs.optionData)
      setActionType(tab.tableStructs.actionType)
    }
  },[tabs,tabIndex]);
 
  // useEffect(() => {
  //   debugLog(" ### tab ",tab)
  // },[tab]);
  

  const DESIGNER_PANEL_MODE = {
    FIELD_PANEL:'FieldPanel',
    INDEX_PANEL:'IndexPanel',
    FOREIGN_KEY_PANEL:'ForeignKeyPanel',
    TRIGGER_PANEL:'TriggerPanel',
    CHECK_PANEL:'CheckPanel',
    OPTION_PANEL:'OptionPanel',
    REMARK_PANEL:'RemarkPanel',
    DDL_PANEL:'DDLPanel',
  }
  const tabss = [
    {
      key: "1",
      label: "字段",
      type: DESIGNER_PANEL_MODE.FIELD_PANEL,
    },
    {
      key: "2",
      label: "索引",
      type: DESIGNER_PANEL_MODE.INDEX_PANEL,
    },
    {
      key: "3",
      label: "外键",
      type: DESIGNER_PANEL_MODE.FOREIGN_KEY_PANEL,
    },
    {
      key: "4",
      label: "触发器",
      type: DESIGNER_PANEL_MODE.TRIGGER_PANEL,
    },
    // {
    //   key: "5",
    //   label:"检查",
    //   type: DESIGNER_PANEL_MODE.CHECK_PANEL,
    // },
    {
      key: "9",
      label:"选项",
      type: DESIGNER_PANEL_MODE.OPTION_PANEL,
    },
    {
      key: "10",
      label:"注释",
      type: DESIGNER_PANEL_MODE.REMARK_PANEL,
    },
    {
      key: "11",
      label:"SQL预览",
      type: DESIGNER_PANEL_MODE.DDL_PANEL,
    },
  ];
  const [tabssIndex,setTabssIndex] = React.useState(tabss[0].key);
  const onChange = (key) => {
    debugLog(key);
    setTabssIndex(key)
  };

  const fieldPanelRef = useRef(null);
  const indexPanelRef = useRef(null);
  const foreignKeyPanelRef = useRef(null);
  const triggerPanelRef = useRef(null);
  const checkPanelRef = useRef(null);
  const optionPanelRef = useRef(null);

  const handleAdd = () => {

   const tabssItem = tabss.filter((item) => item.key === tabssIndex)
   // 添加字段属性
   if(tabssItem.length > 0 ){
    switch( tabssItem[0].type ){
      case DESIGNER_PANEL_MODE.FIELD_PANEL:
        if (fieldPanelRef.current && fieldPanelRef.current.add) {
          fieldPanelRef.current.add({
            key: new Date().getTime(),
            name: '',
            type:'',
            len: 0,
            port: 0,
            isNull: false,
            isPrimaryKey: false,
            comment: '',
          });
        }
        break;
      case DESIGNER_PANEL_MODE.INDEX_PANEL:
        if (indexPanelRef.current && indexPanelRef.current.add) {
          indexPanelRef.current.add({
            key: new Date().getTime(),
            name: '',
            fileds: [],
            indexType: '',
            indexFunction:'',
            remark: '',
          });
        }
        break;
      case DESIGNER_PANEL_MODE.FOREIGN_KEY_PANEL:
        if (foreignKeyPanelRef.current && foreignKeyPanelRef.current.add) {
          foreignKeyPanelRef.current.add({
            key: new Date().getTime(),
            name:'',
            filed:'',
            table:'',
            columns:[],
            deleteActions:'',
            updateActions:'',
          });
        }
        break;
      case DESIGNER_PANEL_MODE.TRIGGER_PANEL:
        if (triggerPanelRef.current && triggerPanelRef.current.add) {
          triggerPanelRef.current.add({
            key: new Date().getTime(),
            name:'',
            triggerTimeType:'',
            triggerActionType:'',
            sql:''
          });
        }
        break;
      case DESIGNER_PANEL_MODE.CHECK_PANEL:
        if (checkPanelRef.current && checkPanelRef.current.add) {
          checkPanelRef.current.add({
            key: new Date().getTime(),
            name: '',
            type:'',
            len: 0,
            port: 0,
            isNull: false,
            isPrimaryKey: false,
            remark: '',
          });
        }
        break;
      case DESIGNER_PANEL_MODE.OPTION_PANEL:
        if (optionPanelRef.current && optionPanelRef.current.add) {
          optionPanelRef.current.add({
            key: new Date().getTime(),
            name: '',
            type:'',
            len: 0,
            port: 0,
            remark: '',
         });
        }
      default:
        break;
    }
   }

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
              <Space>
                设计器
                <Button title="添加" type="text" icon={<PlusOutlined />} size='small' onClick={()=>handleAdd()}/>
              </Space>
              </div>
              <Buttons sql={ddlData}/>
            </div>
        </div>
        <div initialSize={'80%'} minSize="118px" >
          <Tabs
            type="card"
            onChange={onChange}
            activeKey={tabssIndex}
            size="small">
              {tabss.map((tab) => (
                <TabPane key={tab.key} tab={tab.label} >
                  {
                    tab.type === DESIGNER_PANEL_MODE.FIELD_PANEL && 
                      <FieldPanel 
                        ref={fieldPanelRef}
                        fieldData={fieldData} 
                        updateData={setFieldData} 
                        currentHeight={tableHeight}/>
                  }
                  {
                    tab.type === DESIGNER_PANEL_MODE.INDEX_PANEL && 
                      <IndexPanel 
                        ref={indexPanelRef}
                        indexData={indexData} 
                        updateData={setIndexData} 
                        currentHeight={tableHeight}
                        fieldData={fieldData} />
                  }
                  {
                    tab.type === DESIGNER_PANEL_MODE.FOREIGN_KEY_PANEL && 
                      <ForeignKeyPanel 
                        ref={foreignKeyPanelRef}
                        keysData={keysData} 
                        updateData={setKeysData} 
                        currentHeight={tableHeight}
                        fieldData={fieldData} />
                  }
                  {
                    tab.type === DESIGNER_PANEL_MODE.TRIGGER_PANEL && 
                      <TriggerPanel 
                        ref={triggerPanelRef}
                        triggerData={triggerData} 
                        updateData={setTriggerData} 
                        currentHeight={tableHeight}
                        fieldData={fieldData} />
                  }
                  {
                    tab.type === DESIGNER_PANEL_MODE.CHECK_PANEL && 
                    <CheckPanel 
                      ref={checkPanelRef}
                      checkData={checkData} 
                      updateData={setCheckData} 
                      currentHeight={tableHeight}/>
                  }
                  {
                    tab.type === DESIGNER_PANEL_MODE.OPTION_PANEL &&
                    <OptionPanel 
                      ref={optionPanelRef}
                      optionData={optionData} 
                      updateData={setOptionData} 
                      currentHeight={tableHeight}/>
                  }
                  {
                    tab.type === DESIGNER_PANEL_MODE.REMARK_PANEL &&
                    <RemarkPanel 
                      value={remarkData} 
                      setValue={setRemarkData} 
                      currentHeight={tableHeight}/>
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

export default DesignerPanel;