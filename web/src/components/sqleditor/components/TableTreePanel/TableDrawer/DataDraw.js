import { PlusOutlined, SyncOutlined } from '@ant-design/icons';
import { Button, Spin } from 'antd';
import { useContext, useState } from "react";
import toast from 'react-hot-toast';
import { VisibilityContext } from '../../Utils/visibilityProvider';
import DataTree from "./DataTree";
const options = [
  { value: 'chocolate', label: 'Chocolate' },
  { value: 'strawberry', label: 'Strawberry' },
  { value: 'vanilla', label: 'Vanilla' }
]
function DataDraw() {
  const { 
    isCreateDatabaseModalVisible,
    setShowCreateDatabaseModalVisible,
    getSQLConverter,
    webSocketSendData,
   } = useContext(VisibilityContext);
   const [loading, setLoading] = useState(false);
  let customers = require("../../DataStore/customers.json");
  let suppliers = require("../../DataStore/suppliers.json");
  let products = require("../../DataStore/products.json");

  const [isExpandedTable, setIsExpandedTable] = useState(true);
  const [isExpandedView, setIsExpandedView] = useState(false);
  const [isExpandedFunction, setIsExpandedFunction] = useState(false);

  const toggleExpansionTable = () => {
    setIsExpandedTable(!isExpandedTable);
  };
  const toggleExpansionView = () => {
    setIsExpandedView(!isExpandedView);
  };
  const toggleExpansionFunction = () => {
    setIsExpandedFunction(!isExpandedFunction);
  };

  const reflishAllDatabases = () =>{
    toast.success('刷新成功');
    let sql = getSQLConverter("getAllDatabases" )
    webSocketSendData({
      "key": "0001"+new Date().getTime(),
      "retType":'databaseMenu',
      "data": sql,
      "attr":{
        timestamp :new Date().getTime(),
        sqlCommand: sql,
      }
    });
  }
 
  return (
    <Spin spinning={loading}>
      <div className="w-full h-screen tree-box">
        <div  className="parent-container">
          <Button size='small' type="text" title="添加数据库" onClick={()=>setShowCreateDatabaseModalVisible(true)}><PlusOutlined /></Button>
          <Button size='small' type="text" title="刷新数据库" onClick={()=>reflishAllDatabases()}><SyncOutlined /></Button>
        </div>
        <DataTree />
      </div>
    </Spin>
  );
}

export default DataDraw;
