import { Form, Input, Modal } from 'antd';
import React, { useContext, useEffect } from 'react';
import { debugLog } from "../../../../common/logger";
import { VisibilityContext } from '../Utils/visibilityProvider';
// 应用组件
function RenameModal() {
  const { isRenameModalVisible, setShowRenameModalVisible ,
    renameModalObj
  } = useContext(VisibilityContext);
  const [form] = Form.useForm();
  
  useEffect(() => {
    form.setFieldsValue({ newName: renameModalObj.value });
  }, [renameModalObj,form]);
  const onFinish = (values) => {
    form.resetFields();
    debugLog('Success:', values);
  };
  const onFinishFailed = (errorInfo) => {
    form.resetFields();
    debugLog('Failed:', errorInfo);
  };
  const handleOk = async () => {
    const row = await form.validateFields();
    debugLog('Success:', row);
    renameModalObj.callback(row);
    setShowRenameModalVisible(false);
    form.resetFields();
  };
  const handleCancel = () => {
    form.resetFields();
    setShowRenameModalVisible(false);
  };

  return (
      <Modal title={renameModalObj.title} 
        className="DBEditor"
        open={isRenameModalVisible} 
        onOk={handleOk} 
        onCancel={handleCancel}
        okText="确定"
        cancelText="取消">
        <Form form={form}  name="basic" labelCol={renameModalObj.labelCol}
          wrapperCol={{ span: 16, }}
          style={{ maxWidth: 600, }}
          initialValues={{ remember: true, }}
          onFinish={onFinish}
          onFinishFailed={onFinishFailed}
          autoComplete="off">
          <Form.Item label={renameModalObj.label} name="newName" rules={renameModalObj.rules}  >
            <Input allowClear placeholder={renameModalObj.placeholder}/>
          </Form.Item>
        </Form>
      </Modal>
  );
}

export default RenameModal;