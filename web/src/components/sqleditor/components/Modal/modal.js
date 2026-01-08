import React, { useEffect, useState } from 'react';

import PropTypes from 'prop-types';
import { debugLog } from "../../../../common/logger";
import './Modal.css'; // 导入CSS样式
// 模态对话框组件
const Modal = ({ isOpen, title, children, onClose }) => {
    const [modalIsOpen, setModalIsOpen] = useState(isOpen);

    useEffect(() => {
      setModalIsOpen(isOpen);
      debugLog(" Modal isOpen ",isOpen);
    }, [isOpen]);

    const closeModal = () => {
       setModalIsOpen(false);
       onClose();
    };
    
  return (
    <div>
      {modalIsOpen && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal">
            <button className="modal-close-btn" onClick={closeModal}>
              &times;
            </button>
            <div className="flex items-center cursor-pointer">
              <span className='mr-2'><svg t="1712271850067" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="4717" width="24" height="24"><path d="M511.250625 414.911719a46.545031 46.545031 0 0 1 46.545031 46.545031l0.162908 283.575604a46.545031 46.545031 0 0 1-93.090063 0l-0.162907-283.575604a46.545031 46.545031 0 0 1 46.545031-46.545031z m-50.012636-136.53985a50.035909 50.035909 0 0 1 100.071817 0l0.18618 1.512714a50.035909 50.035909 0 0 1-100.071817 0zM511.995345 1024a508.178653 508.178653 0 0 1-293.233697-93.299515 46.405396 46.405396 0 0 1-34.210598-44.683231l-0.418906-4.305415a46.405396 46.405396 0 0 1 80.592722-31.557531 420.534359 420.534359 0 1 0-132.653339-160.161453l-7.540295 7.540295a46.545031 46.545031 0 0 1 29.020827 43.077426l0.442177 4.328688a46.428669 46.428669 0 0 1-91.088626 12.776611A511.995345 511.995345 0 1 1 511.995345 1024z" fill="#0090FF" p-id="4718"></path></svg></span>
              {title}
            </div>
            <span>{children}</span>
          </div>
        </div>
      )}
    </div>
  );
};

Modal.propTypes = {
    isOpen: PropTypes.bool.isRequired,
    title: PropTypes.string.isRequired,
    onClose: PropTypes.func.isRequired,
    children: PropTypes.node.isRequired,
};

export default Modal;