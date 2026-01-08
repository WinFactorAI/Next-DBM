import {
    CloudUploadOutlined
} from "@ant-design/icons";
import type { UploadProps } from 'antd';
import { Button, message, Modal, notification, Progress } from 'antd';
import React, { useContext, useEffect, useState } from 'react';
import sessionApi from "../../../../../api/session";
import { server } from "../../../../../common/env";
import { debugLog } from "../../../../../common/logger";
import { getCurrentUser } from "../../../../../service/permission";
import strings from "../../../../../utils/strings";
import { getToken, renderSize } from "../../../../../utils/utils";
import { VisibilityContext } from '../../Utils/visibilityProvider';
// 应用组件
function ImportSQLFile() {
  const { 
      isImportSQLFileModalVisible, 
      setShowImportSQLFileModalVisible ,
      importSQLFileModalObj,
      utilsFormatTimestampStr,
      assetId
  } = useContext(VisibilityContext);
    
  const [upload, setUpload] = useState(false);
  const [currentDirectory, setCurrentDirectory] = useState('/import/');  
  const [storageType,setStorageType]= useState('storages');
  const [storageId,setStorageId] = useState('');
  
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
    // 清空file-upload 数据
    // TODO: 执行脚本文件
    setShowImportSQLFileModalVisible(false);
  };
  const handleCancel = () => {
    setShowImportSQLFileModalVisible(false);
  };
 

  // {
  //   uid: '1',
  //   name: 'xxx.png',
  //   status: 'uploading',
  //   url: 'http://www.baidu.com/xxx.png',
  //   percent: 33,
  // }
  const props: UploadProps = {
    action: `${server}/${storageType}/${storageId}/upload?X-Auth-Token=${getToken()}&dir=/`,
    onChange({ file, fileList }) {
      if (file.status !== 'uploading') {
        debugLog(file, fileList);
      }
    },
    defaultFileList: [],
  };

  const handleUploadFile = () => {
      let files = window.document.getElementById('file-upload').files;
      let uploadEndCount = 0;
      const increaseUploadEndCount = () => {
          uploadEndCount++;
          return uploadEndCount;
      }
      for (let i = 0; i < files.length; i++) {
          const file = files[i];
          if (!file) {
              return;
          }
          if(file.type != "application/zip" ){
            message.error("文件类型不正确，请上传zip文件");
            return;
          }
          let timestamp = utilsFormatTimestampStr(new Date().getTime())
          uploadFile(file, currentDirectory+timestamp, () => {
              if (increaseUploadEndCount() === files.length) {
                // 发送导入指令给ws
                window.document.getElementById('file-upload').value = "";
                handleOk();
                refresh();
                // debugLog("file",file)
                importSQLFileModalObj.callback(currentDirectory+timestamp,file.name);
              }
          });
      }
  }

  const uploadFile = (file, dir, callback) => {
      const {name, size} = file;
      let url = `${server}/${storageType}/${storageId}/upload?X-Auth-Token=${getToken()}&dir=${dir}`

      const key = importSQLFileModalObj.key;
      const xhr = new XMLHttpRequest();
      let prevPercent = 0, percent = 0;

      const uploadEnd = (success, message) => {
          if (success) {
              let description = (
                  <React.Fragment>
                      <div>{name}</div>
                      <div>{renderSize(size)} / {renderSize(size)}</div>
                      <Progress percent={10}/>
                  </React.Fragment>
              );
              notification.success({
                  key,
                  message: `上传成功`,
                  duration: 100,
                  description: description,
                  placement: 'bottomRight'
              });
              if (callback) {
                  callback();
              }
          } else {
              let description = (
                  <React.Fragment>
                      <div>{name}</div>
                      <Text type="danger">{message}</Text>
                  </React.Fragment>
              );
              notification.error({
                  key,
                  message: `上传失败`,
                  duration: 10,
                  description: description,
                  placement: 'bottomRight'
              });
          }
      }

      xhr.upload.addEventListener('progress', (event) => {
          if (event.lengthComputable) {
              let description = (
                  <React.Fragment>
                      <div>{name}</div>
                      <div>{renderSize(event.loaded)}/{renderSize(size)}</div>
                      <Progress percent={100}/>
                  </React.Fragment>
              );
              if (event.loaded === event.total) {
                  notification.info({
                      key,
                      message: `向目标机器传输中...`,
                      duration: null,
                      description: description,
                      placement: 'bottomRight',
                      onClose: () => {
                          xhr.abort();
                          message.info(`您已取消上传"${name}"`, 10);
                      }
                  });
                  return;
              }
              percent = Math.min(Math.floor(event.loaded * 100 / event.total), 99);
              if (prevPercent === percent) {
                  return;
              }
              description = (
                  <React.Fragment>
                      <div>{name}</div>
                      <div>{renderSize(event.loaded)} / {renderSize(size)}</div>
                      <Progress percent={percent}/>
                  </React.Fragment>
              );

              notification.info({
                  key,
                  message: `上传中...`,
                  duration: null,
                  description: description,
                  placement: 'bottomRight',
                  onClose: () => {
                      xhr.abort();
                      message.info(`您已取消上传"${name}"`, 10);
                  }
              });
              prevPercent = percent;
          }

      }, false)
      xhr.onreadystatechange = (data) => {
          if (xhr.readyState !== 4) {
              let responseText = data.currentTarget.responseText;
              let result = responseText.split(`㊥`).filter(item => item !== '');
              if (result.length > 0) {
                  let upload = result[result.length - 1];
                  let uploadToTarget = parseInt(upload);

                  percent = Math.min(Math.floor(uploadToTarget * 100 / size), 99);

                  let description = (
                      <React.Fragment>
                          <div>{name}</div>
                          <div>{renderSize(uploadToTarget)}/{renderSize(size)}</div>
                          <Progress percent={percent}/>
                      </React.Fragment>
                  );
                  notification.info({
                      key,
                      message: `向目标机器传输中...`,
                      duration: null,
                      description: description,
                      placement: 'bottomRight',
                      onClose: () => {
                          xhr.abort();
                          message.info(`您已取消上传"${name}"`, 10);
                      }
                  });
              }
              return;
          }
          if (xhr.status >= 200 && xhr.status < 300) {
              uploadEnd(true, `上传成功`);
          } else if (xhr.status >= 400 && xhr.status < 500) {
              uploadEnd(false, '服务器内部错误');
          }
      }

      xhr.onerror = () => {
          uploadEnd(false, '服务器内部错误');
      }
      xhr.open('POST', url, true);
      let formData = new FormData();
      formData.append("file", file, name);
      xhr.send(formData);
  }

  const refresh = async () => {
      // loadFiles(currentDirectory);
      // if (callback) {
      //     callback();
      // }
  }

  return (
      <Modal  zIndex={99}  maskClosable={false}
        title="导入" 
        open={isImportSQLFileModalVisible} 
        onOk={handleOk} 
        onCancel={handleCancel}
        okText="确定"
        cancelText="取消"
        footer={
            <Button onClick={handleCancel}>关闭</Button>  
          }
        >
            {importSQLFileModalObj.label} <br/>
            数据库:{importSQLFileModalObj.database} <br/>
              <input type="file" id="file-upload" style={{display: 'none'}} onChange={()=>{handleUploadFile()}} multiple/>
              <Button icon={<CloudUploadOutlined/>}
                      onClick={() => {
                          window.document.getElementById('file-upload').click();
                      }} >选择文件</Button>
              
      </Modal>
  );
}

export default ImportSQLFile;