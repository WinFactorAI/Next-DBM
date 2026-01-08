import { UploadOutlined } from '@ant-design/icons';
import type { UploadProps } from 'antd';
import { Button, Modal, Upload } from 'antd';
import React, { useContext } from 'react';
import { debugLog } from "../../../../../common/logger";
import { VisibilityContext } from '../../Utils/visibilityProvider';
// 应用组件
function DesignTable() {
  const { isDesignTableModalVisible, setShowDesignTableModalVisible } = useContext(VisibilityContext);
  const onFinish = (values) => {
    debugLog('Success:', values);
  };
  const onFinishFailed = (errorInfo) => {
    debugLog('Failed:', errorInfo);
  };
  const handleOk = () => {
    setShowDesignTableModalVisible(false);
  };
  const handleCancel = () => {
    setShowDesignTableModalVisible(false);
  };
 
  const props: UploadProps = {
    action: 'https://660d2bd96ddfa2943b33731c.mockapi.io/api/upload',
    onChange({ file, fileList }) {
      if (file.status !== 'uploading') {
        debugLog(file, fileList);
      }
    },
    defaultFileList: [
      {
        uid: '1',
        name: 'xxx.png',
        status: 'uploading',
        url: 'http://www.baidu.com/xxx.png',
        percent: 33,
      },
      {
        uid: '2',
        name: 'yyy.png',
        status: 'done',
        url: 'http://www.baidu.com/yyy.png',
      },
      {
        uid: '3',
        name: 'zzz.png',
        status: 'error',
        response: 'Server Error 500', // custom error message to show
        url: 'http://www.baidu.com/zzz.png',
      },
    ],
  };

  return (
      <Modal title="设计表" 
        open={isDesignTableModalVisible} 
        onOk={handleOk} 
        onCancel={handleCancel}
        okText="确定"
        cancelText="取消"
        >
          <Upload {...props}>
            <Button icon={<UploadOutlined />}>选择文件</Button>
          </Upload>
      </Modal>
  );
}

export default DesignTable;