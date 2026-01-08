import { Form, Input, Modal } from 'antd';
import React, { useContext, useEffect } from 'react';
import { debugLog } from "../../../../../common/logger";
import { VisibilityContext } from '../../Utils/visibilityProvider';
// 应用组件
function Rename() {
  const formRef = React.useRef(); 
  const { 
    tabs,tabIndex,getTabByID,
    isTabNameVisible, setIsTabNameVisible, 
    setTabName
  } = useContext(VisibilityContext);
  const onFinish = (values) => {
    setTabName(values.tabName)
    debugLog('Success:', values);
  };
  const onFinishFailed = (errorInfo) => {
    debugLog('Failed:', errorInfo);
  };
  const handleOk = () => {
    formRef.current.submit(); 
    setIsTabNameVisible(false);
  };
  const handleCancel = () => {
    // 调用接口更新sql管理模块中
    setIsTabNameVisible(false);
  };

  useEffect(() => {
    if (isTabNameVisible) {
      formRef.current.setFieldsValue({ tabName: getTabByID(tabIndex)?.title });
    }
  }, [isTabNameVisible, tabIndex, tabs]);

  return (
      <Modal title="Tab重命名" 
        className='DBEditor'
        open={isTabNameVisible} 
        onOk={handleOk} 
        onCancel={handleCancel}
        okText="确定"
        cancelText="取消"
        >
        <Form ref={formRef}  name="basic" labelCol={{ span: 5, }}
          wrapperCol={{ span: 16, }}
          style={{ maxWidth: 600, }}
          initialValues={{ remember: true, }}
          onFinish={onFinish}
          onFinishFailed={onFinishFailed}
          autoComplete="off"
        >
          <Form.Item
            label="新Tab名"
            name="tabName"
            initialValue={getTabByID(tabIndex)?.title}
            rules={[
              {
                required: true,
                message: '请输入新Tab名',
              },
            ]}
          >
            <Input allowClear />
          </Form.Item>
        </Form>
      </Modal>
  );
}

export default Rename;