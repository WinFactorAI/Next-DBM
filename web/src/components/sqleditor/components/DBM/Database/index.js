import { Form, Input, Modal, Select } from 'antd';
import React, { useContext, useRef } from 'react';
import { debugLog } from "../../../../../common/logger";
import { VisibilityContext } from '../../Utils/visibilityProvider';
// 应用组件
function CreateDatabase() {
  const formRef = useRef();
  const {
    getSQLConverter,
    webSocketSendData,
    isCreateDatabaseModalVisible,
    setShowCreateDatabaseModalVisible,
    getCharsets,
    getCollations,
    protocolType
  } = useContext(VisibilityContext);
  const onFinish = (values) => {
    debugLog('Success:', values);
    handleOk(values);
  };
  const onFinishFailed = (errorInfo) => {
    debugLog('Failed:', errorInfo);
  };
  const handleOk = (values) => {
    const createDatabaseStr = getSQLConverter('createDatabase', {
      database: values.database,
      charset: values.charset,
      collation: values.collation
    })
    debugLog(' ## handleOk ' + createDatabaseStr);
    webSocketSendData({
      key: 'createDatabase',
      retType: 'executeResult',
      data: createDatabaseStr,
      "attr": {
        timestamp: new Date().getTime(),
        sqlCommand: createDatabaseStr,
      }
    })
    setShowCreateDatabaseModalVisible(false);
    formRef.current.resetFields();
  };
  const handleCancel = () => {
    debugLog(' ## handleCancel');
    setShowCreateDatabaseModalVisible(false);
    formRef.current.resetFields();
  };
  const [level1, setLevel1] = React.useState(null);
  const handleChangeLevel1 = (value) => {
    debugLog(`selected ${value}`);
    debugLog("getCollations(value) ", getCollations(value))
    setLevel1(value);
  };
  const handleChangeLevel2 = (value) => {
    debugLog(`selected ${value}`);
    setLevel1(value);
  };


  return (
    <Modal title="创建数据库"
      className="DBEditor"
      open={isCreateDatabaseModalVisible}
      onOk={() => formRef.current?.submit()}
      onCancel={handleCancel}
      okText="确定"
      cancelText="取消"
    >
      <Form
        ref={formRef} // 添加 ref
        name="basic"
        labelCol={{ span: 5, }}
        wrapperCol={{ span: 16, }}
        style={{ maxWidth: 600, }}
        initialValues={{ remember: true, }}
        onFinish={onFinish}
        onFinishFailed={onFinishFailed}
        autoComplete="off"
      >
        <Form.Item
          label="数据库名"
          name="database"
          rules={[
            {
              required: true,
              message: '请输入数据库名',
            },
          ]}
        >
          <Input allowClear />
        </Form.Item>
        {protocolType === 'MySQL' && (
          <>
            <Form.Item
              label="字符集"
              name="charset"
              rules={[
                { required: true, message: '请选择字符集' },
              ]}
            >
              <Select
                allowClear
                onChange={handleChangeLevel1}
                options={getCharsets().map(item => ({
                  value: item,
                  label: item,
                }))}
              />
            </Form.Item>

            <Form.Item
              label="排序规则"
              name="collation"
              rules={[
                { required: true, message: '请选择排序规则' },
              ]}
            >
              <Select
                allowClear
                onChange={handleChangeLevel2}
                options={getCollations(level1)?.map(item => ({
                  value: item,
                  label: item,
                }))}
              />
            </Form.Item>
          </>
        )}
      </Form>
    </Modal>
  );
}

export default CreateDatabase;