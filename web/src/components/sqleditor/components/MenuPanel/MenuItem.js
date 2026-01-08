// MenuItem.js
import { RightOutlined } from '@ant-design/icons';
import React, { useRef, useState } from 'react';
import './MenuItem.css'; // 导入样式文件

const SubMenuItem = ({ setSubMenuVisible, item, title, onClick }) => {
  const [isSubMenuVisible, setIsSubMenuVisible] = useState(false);

  const handleMouseEnter = () => {
    setIsSubMenuVisible(true);
    // setSubMenuVisible(true);
  };

  const handleMouseLeave = () => {
    setIsSubMenuVisible(false);
    // setSubMenuVisible(false);
  };

  if (item.subMenuItems && item.subMenuItems.length > 0) {
    const left = { left: (item.level) * 140 + 'px', top: '34px' };
    return <div className='sub-menu-item-box'>
      <div className="sub-menu-item disable-selection " onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave} onClick={onClick}>
        {item.checked !== undefined ?
          item.checked === true ?
            <svg className="menu-icon" t="1712405315260" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="3553" width="20" height="20"><path d="M744.082286 254.902857a50.176 50.176 0 0 1 70.948571 0l32.548572 32.475429a50.176 50.176 0 0 1 0 70.948571l-395.702858 395.629714a50.176 50.176 0 0 1-70.729142 0.146286l-199.094858-197.485714a50.176 50.176 0 0 1-0.146285-71.021714l32.621714-32.621715a50.176 50.176 0 0 1 70.656-0.219428l113.664 112.128c9.874286 9.654857 25.6 9.581714 35.401143-0.146286l309.833143-309.833143z" fill="#6366f1" p-id="3554"></path></svg>
            :
            // <span className='menu-icon-empty'></span>
            <svg className="menu-icon" t="1712405315260" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="3553" width="20" height="20"><path d="M744.082286 254.902857a50.176 50.176 0 0 1 70.948571 0l32.548572 32.475429a50.176 50.176 0 0 1 0 70.948571l-395.702858 395.629714a50.176 50.176 0 0 1-70.729142 0.146286l-199.094858-197.485714a50.176 50.176 0 0 1-0.146285-71.021714l32.621714-32.621715a50.176 50.176 0 0 1 70.656-0.219428l113.664 112.128c9.874286 9.654857 25.6 9.581714 35.401143-0.146286l309.833143-309.833143z" fill="#dbdbdb" p-id="3554"></path></svg>
          :
          ""
        }
        {title}
        <div className='sub-menu-item-right'><RightOutlined /></div>
      </div>
      {isSubMenuVisible && (
        <div className="sub-menu" style={left} onMouseEnter={handleMouseEnter}>
          {item.subMenuItems.map((item, index) => (
            <SubMenuItem setSubMenuVisible={setSubMenuVisible} key={index} item={item} title={item.title} onClick={item.onClick} />
          ))}
        </div>
      )}
    </div>
  } else {
    const width = { width: item.width + 'px' };
    return <div className="sub-menu-item disable-selection " style={width} onClick={onClick}>
      {item.checked !== undefined ?
        item.checked === true ?
          <svg className="menu-icon" t="1712405315260" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="3553" width="20" height="20"><path d="M744.082286 254.902857a50.176 50.176 0 0 1 70.948571 0l32.548572 32.475429a50.176 50.176 0 0 1 0 70.948571l-395.702858 395.629714a50.176 50.176 0 0 1-70.729142 0.146286l-199.094858-197.485714a50.176 50.176 0 0 1-0.146285-71.021714l32.621714-32.621715a50.176 50.176 0 0 1 70.656-0.219428l113.664 112.128c9.874286 9.654857 25.6 9.581714 35.401143-0.146286l309.833143-309.833143z" fill="#6366f1" p-id="3554"></path></svg>
          :
          // <span className='menu-icon-empty'></span>
          <svg className="menu-icon" t="1712405315260" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="3553" width="20" height="20"><path d="M744.082286 254.902857a50.176 50.176 0 0 1 70.948571 0l32.548572 32.475429a50.176 50.176 0 0 1 0 70.948571l-395.702858 395.629714a50.176 50.176 0 0 1-70.729142 0.146286l-199.094858-197.485714a50.176 50.176 0 0 1-0.146285-71.021714l32.621714-32.621715a50.176 50.176 0 0 1 70.656-0.219428l113.664 112.128c9.874286 9.654857 25.6 9.581714 35.401143-0.146286l309.833143-309.833143z" fill="#dbdbdb" p-id="3554"></path></svg>
        :
        ""
      }
      {item.icon && <span className='menu-icon'>{item.icon}</span>}
      {title}
      {item.keyboard && <span className='menu-icon-keyboard'>{item.keyboard}</span>}
    </div>
  }

};

const MenuItem = ({ title, subMenuItems }) => {
  const [isSubMenuVisible, setSubMenuVisible] = useState(false);
  const [timeoutId, setTimeoutId] = useState(null);
  const menuItemRef = useRef(null);

  const handleToggleSubMenu = () => {
    setSubMenuVisible(!isSubMenuVisible);
  };

  const handleMouseLeave = () => {
    const id = setTimeout(() => {
      if (!menuItemRef.current.contains(document.activeElement)) {
        // debugLog(" document.activeElement ",document.activeElement)
        setSubMenuVisible(false);
      }
    }, 100);
    setTimeoutId(id);
  };

  const handleMouseEnter = () => {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
  };

  return (
    <div
      ref={menuItemRef}
      className="menu-item disable-selection"
      onMouseLeave={handleMouseLeave}
      onMouseEnter={handleMouseEnter}
      style={{ backgroundColor: isSubMenuVisible ? '#f0f0f0' : 'transparent' }} // 添加背景颜色样式
    >
      <div onClick={handleToggleSubMenu} className="menu-item-title">{title}</div>
      {isSubMenuVisible && (
        <div className="sub-menu">
          {subMenuItems.map((item, index) => (
            <SubMenuItem setSubMenuVisible={setSubMenuVisible} key={index} item={item} title={item.title} onClick={item.onClick} />
          ))}
        </div>
      )}
    </div>
  );
};

export default MenuItem;
