import { Button, Modal } from 'antd';
import React, { useContext } from 'react';
import { VisibilityContext } from '../../Utils/visibilityProvider';
// 应用组件
function About() {
  const { isAboutModal,setShowAboutModal  } = useContext(VisibilityContext);
  const openModal = () => {
    setShowAboutModal(true);
  };
  const closeModal = () => {
    setShowAboutModal(false);
  };
  const handleOk = () => {
    setShowAboutModal(false);
  };
  
  return (

    <div className='mr-1 flex items-center cursor-pointer'>
      <button onClick={openModal} className="flex items-center cursor-pointer">
       <span><svg t="1712271850067" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="4717" width="16" height="16"><path d="M511.250625 414.911719a46.545031 46.545031 0 0 1 46.545031 46.545031l0.162908 283.575604a46.545031 46.545031 0 0 1-93.090063 0l-0.162907-283.575604a46.545031 46.545031 0 0 1 46.545031-46.545031z m-50.012636-136.53985a50.035909 50.035909 0 0 1 100.071817 0l0.18618 1.512714a50.035909 50.035909 0 0 1-100.071817 0zM511.995345 1024a508.178653 508.178653 0 0 1-293.233697-93.299515 46.405396 46.405396 0 0 1-34.210598-44.683231l-0.418906-4.305415a46.405396 46.405396 0 0 1 80.592722-31.557531 420.534359 420.534359 0 1 0-132.653339-160.161453l-7.540295 7.540295a46.545031 46.545031 0 0 1 29.020827 43.077426l0.442177 4.328688a46.428669 46.428669 0 0 1-91.088626 12.776611A511.995345 511.995345 0 1 1 511.995345 1024z" fill="#0090FF" p-id="4718"></path></svg></span>
       <span className='ml-1'>关于</span>
      </button>
 
        <Modal title="关于DBEditor" 
          open={isAboutModal} 
          onOk={handleOk} 
          onCancel={closeModal}
          okText="确定"
          cancelText="取消"
          footer={
            // 只定义确定按钮
            <Button type="primary" onClick={handleOk}>
              确定
            </Button>
          }
          >
              <div >技术支持 : aiputing.com</div>
              <div >联系方式 : <a  target="_blank" href='http://www.aiputing.com'>www.aiputing.com</a></div>
              {/* <div >版本 : v1.2.3</div> */}
        </Modal>
    </div>
  );
}

export default About;