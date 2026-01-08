import { Button, Form, Modal, Progress, notification } from 'antd';
import React, { useContext, useEffect, useState } from 'react';
import sessionApi from "../../../../../api/session";
import { server } from "../../../../../common/env";
import { debugLog } from "../../../../../common/logger";
import { download, getToken } from "../../../../../utils/utils";
import { VisibilityContext } from '../../Utils/visibilityProvider';
const exportFile = (fileName, dir, callback) => {
  let url = `${server}/${storageType}/${storageId}/export?X-Auth-Token=${getToken()}&dir=${dir}&fileName=${fileName}`;

  const key = fileName;
  const xhr = new XMLHttpRequest();
  let prevPercent = 0, percent = 0;

  const downloadFile = (blob, fileName) => {
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
  };

  const exportEnd = (success, message, blob) => {
      if (success) {
          let description = (
              <React.Fragment>
                  <div>{fileName}</div>
                  <div>Export Complete</div>
                  <Progress percent={100} />
              </React.Fragment>
          );
          notification.success({
              key,
              message: `Export Successful`,
              duration: 5,
              description: description,
              placement: 'bottomRight'
          });
          if (callback) {
              callback();
          }
          downloadFile(blob, fileName); // Trigger file download
      } else {
          let description = (
              <React.Fragment>
                  <div>{fileName}</div>
                  <Text type="danger">{message}</Text>
              </React.Fragment>
          );
          notification.error({
              key,
              message: `Export Failed`,
              duration: 10,
              description: description,
              placement: 'bottomRight'
          });
      }
  };

  xhr.responseType = 'blob'; // Set response type to blob for file download

  xhr.upload.addEventListener('progress', (event) => {
      if (event.lengthComputable) {
          percent = Math.min(Math.floor(event.loaded * 100 / event.total), 99);
          if (prevPercent === percent) {
              return;
          }
          let description = (
              <React.Fragment>
                  <div>{fileName}</div>
                  <div>{renderSize(event.loaded)} / {renderSize(event.total)}</div>
                  <Progress percent={percent} />
              </React.Fragment>
          );

          notification.info({
              key,
              message: `Export in Progress...`,
              duration: null,
              description: description,
              placement: 'bottomRight',
              onClose: () => {
                  xhr.abort();
                  message.info(`You have canceled the export of "${fileName}"`, 10);
              }
          });
          prevPercent = percent;
      }
  }, false);

  xhr.onreadystatechange = () => {
      if (xhr.readyState === 4) {
          if (xhr.status >= 200 && xhr.status < 300) {
              exportEnd(true, `Export Successful`, xhr.response); // Pass blob for download
          } else if (xhr.status >= 400 && xhr.status < 500) {
              exportEnd(false, 'Server Error');
          }
      }
  };

  xhr.onerror = () => {
      exportEnd(false, 'Server Error');
  };

  xhr.open('GET', url, true); // Use GET request for export
  xhr.send();
};

// 应用组件

function ExportSQLFile() {
  const { isExportSQLFileModalVisible, 
      setShowExportSQLFileModalVisible ,
      exportSQLFileModalObj,
      assetId
    } = useContext(VisibilityContext);

  const [currentDirectory, setCurrentDirectory] = useState('/import/');  
  const [storageType,setStorageType]= useState('storages');
  const [storageId,setStorageId] = useState('');
  const [fileName,setFileName] = useState('');
  
  useEffect(() => {
    if(assetId){
      createSession();    
    }
  }, [assetId]);
  const createSession = async () => {
    let session = await sessionApi.create(assetId, 'guacd');
    if (!strings.hasText(session['id'])) {
        return;
    }
    setStorageId(getCurrentUser().id)
  }
  const onFinish = (values) => {
    debugLog('Success:', values);
  };
  const onFinishFailed = (errorInfo) => {
    debugLog('Failed:', errorInfo);
  };
  const handleOk = () => {
    setPercent(0);
    download(`${server}/${storageType}/${storageId}/download?file=${window.encodeURIComponent(fileName)}&X-Auth-Token=${getToken()}&t=${new Date().getTime()}`); 
    setShowExportSQLFileModalVisible(false);
  };
  const handleCancel = () => {
    setShowExportSQLFileModalVisible(false);
  };
 
  const [percent, setPercent] = useState(0);
  useEffect(() => {
    if(isExportSQLFileModalVisible){
      const interval = setInterval(() => {
        setPercent(prevPercent => {
          if (prevPercent < 100) {
            return prevPercent + 10; // 每次增加 10%
          } else {
            handleOk();
            clearInterval(interval); // 进度到100%时，清除定时器
            return prevPercent;
          }
        });
      }, 1000); // 每隔1秒更新一次进度

      // 组件卸载时清除定时器
      return () => clearInterval(interval);
    }
  }, [isExportSQLFileModalVisible]);

  return (
      <Modal zIndex={99}   
        maskClosable={false}
        title={exportSQLFileModalObj.title} 
        open={isExportSQLFileModalVisible} 
        onOk={handleOk} 
        onCancel={handleCancel}
        okText="关闭"
        cancelText="取消"
        footer={
          <Button onClick={handleCancel}>关闭</Button>  
        }
        >
          {exportSQLFileModalObj.label} <br/>
          数据库:{exportSQLFileModalObj.database} <br/>
          
          <Form.Item
            label="导出进度"
            name="databases"
          >
            <Progress
              percent={percent}
              percentPosition={{
                align: 'center',
                type: 'inner',
              }}
              size={[300, 20]}
            />
 
          </Form.Item>
      </Modal>
  );
}

export default ExportSQLFile;