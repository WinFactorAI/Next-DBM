import { Form, Input, Modal, Select } from 'antd';
import React, { useContext } from 'react';
import { debugLog } from "../../../../../common/logger";
import { VisibilityContext } from '../../Utils/visibilityProvider';
// 应用组件 -- 暂时不用
function CreateDatabase() {
  const { isCreateDatabaseModalVisible,setShowCreateDatabaseModalVisible,
    getCharsets,getCollations,
   } = useContext(VisibilityContext);


  const onFinish = (values) => {
    debugLog('Success:', values);
  };
  const onFinishFailed = (errorInfo) => {
    debugLog('Failed:', errorInfo);
  };
  const handleOk = () => {
    toast.success('创建成功');
    debugLog('Success:', values);
    setShowCreateDatabaseModalVisible(false);

  };
  const handleCancel = () => {
    setShowCreateDatabaseModalVisible(false);
  };
  const [level1 , setLevel1] = React.useState(null);
  const handleChangeLevel1 = (value) => {
    debugLog(`selected ${value}`);
    debugLog("getCollations(value) ",getCollations(value))   
    setLevel1(value);
  };
  const handleChangeLevel2 = (value) => {
    debugLog(`selected ${value}`);
    setLevel1(value);
  };
 

  return (
      <Modal title="创建数据库1" 
        className="DBEditor"
        open={isCreateDatabaseModalVisible} 
        onOk={handleOk} 
        onCancel={handleCancel}
        okText="确定"
        cancelText="取消"
        >
        <Form name="basic" labelCol={{ span: 5, }}
          wrapperCol={{ span: 16, }}
          style={{ maxWidth: 600, }}
          initialValues={{ remember: true, }}
         
          autoComplete="off"
        >
          <Form.Item
            label="数据库名"
            name="databases"
            rules={[
              {
                required: true,
                message: '请输入数据库名',
              },
            ]}
          >
            <Input allowClear />
          </Form.Item>

          <Form.Item
            label="字符集"
            name="charsets"
            rules={[
              {
                required: true,
                message: '请选择字符集',
              },
            ]}
          >
          <Select defaultValue=""  
              allowClear
              onChange={handleChangeLevel1}
              options={getCharsets().map((item) => {
                return {
                  value: item,
                  label: item,
                };
              })}
            />
          </Form.Item>
          <Form.Item
            label="排序规则"
            name="collations"
            rules={[
              {
                required: true,
                message: '请选择排序规则',
              },
            ]}
          >
            <Select defaultValue=""  
              allowClear
              onChange={handleChangeLevel2}
              options={getCollations(level1)?.map((item) => {
                return {
                  value: item,
                  label: item,
                };
              })}
            />
          </Form.Item>
        </Form>
      </Modal>
  );
}

export default CreateDatabase;