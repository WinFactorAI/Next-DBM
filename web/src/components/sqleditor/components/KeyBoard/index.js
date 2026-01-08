import { Button, Modal } from 'antd';
import React, { useContext } from 'react';
import { VisibilityContext } from '../Utils/visibilityProvider';
// 应用组件
function KeyBoard() {
  const { isKeyBoardModalVisible, setIsKeyBoardModalVisible } = useContext(VisibilityContext);
  const openModal = () => {
    setIsKeyBoardModalVisible(true);
  };
  const closeModal = () => {
    setIsKeyBoardModalVisible(false);
  };

  
  return (
    <Modal title="快捷键" 
      open={isKeyBoardModalVisible} 
 
      onCancel={closeModal}
      okText="确定"
      cancelText="取消"
      footer={
        // 只定义确定按钮
        <Button type="primary" onClick={closeModal}>
          确定
        </Button>
      }
      >
        <div >新建 : CTR+N </div>
        <div >快捷键 : CTR+K</div>
        <div >版本 : v1.2.1</div>
    </Modal>
  );
}

export default KeyBoard;