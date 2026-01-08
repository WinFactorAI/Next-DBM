import { Form, Input, Modal } from 'antd';
import React, { useContext } from 'react';
import { debugLog } from "../../../../../common/logger";
import { VisibilityContext } from '../../Utils/visibilityProvider';
// 应用组件
function TableRename() {
  const { isTableRenameModalVisible, setShowTableRenameModalVisible } = useContext(VisibilityContext);
  const onFinish = (values) => {
    debugLog('Success:', values);
  };
  const onFinishFailed = (errorInfo) => {
    debugLog('Failed:', errorInfo);
  };
  const handleOk = () => {
    setShowTableRenameModalVisible(false);
  };
  const handleCancel = () => {
    setShowTableRenameModalVisible(false);
  };
 
 

  return (
      <Modal title="表重命名" 
        open={isTableRenameModalVisible} 
        onOk={handleOk} 
        onCancel={handleCancel}
        okText="确定"
        cancelText="取消"
        >
        <Form name="basic" labelCol={{ span: 5, }}
          wrapperCol={{ span: 16, }}
          style={{ maxWidth: 600, }}
          initialValues={{ remember: true, }}
          onFinish={onFinish}
          onFinishFailed={onFinishFailed}
          autoComplete="off"
        >
          <Form.Item
            label="新表名"
            name="tableName"
            rules={[
              {
                required: true,
                message: '请输入新表名',
              },
            ]}
          >
            <Input allowClear />
          </Form.Item>
        </Form>
      </Modal>
  );
}

export default TableRename;