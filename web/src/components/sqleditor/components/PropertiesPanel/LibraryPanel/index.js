import { Input } from 'antd';
import i18next from 'i18next';
import React, { useContext, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { debugLog } from "../../../../../common/logger";
import { VisibilityContext } from '../../../components/Utils/visibilityProvider';
// 应用组件
function LibraryPanel() {
  const { 
    setValue, setDefaults, 
    qurtyValue ,
    tabs,
    tabIndex,
    setTabValue,
    setTabAppleValue,
    getTabByID ,
    SQL_EDIT_MODE,
    language
  } =  useContext(VisibilityContext);
  const { libraryPanelSizePx } = useContext(VisibilityContext);
  
  const [listHeight, setListHeight] = useState(500);
  const [searchValue, setSearchValue] = useState("");
  const [list, setList] = useState(qurtyValue);

  const libraryPanelRef = React.createRef();  
  useEffect(() => {
 
      setList(
        qurtyValue.filter(({ name, content }) => {
          const safeName = name ?? '';
          const safeContent = content ?? '';
          return safeName.includes(searchValue) || safeContent.includes(searchValue);
        })
      );
      if (libraryPanelRef.current) {  
        libraryPanelRef.current.style.height = `${ libraryPanelSizePx}px`;
      }
  
  }, [searchValue,libraryPanelSizePx]);
  
  useEffect(() => {
    setList(qurtyValue)
  }, [qurtyValue])

  const handleClear = () => {
    setSearchValue(''); // 清除搜索框内容
  };
  const handleSelectd = (item) => {
    debugLog(' item ',item.content)
    const tab = getTabByID(tabIndex)
    // debugLog(' tabs[tabIndex].type ',tab)
    if(tab.type === SQL_EDIT_MODE.EDITOR ){
      setTabAppleValue(item.content)
    } else {
      // setTabValue(tab.sql + "\r\n" +item.query)
      toast.error('该模式无法使用SQL指令库');
    }
  };
  
  return (
    <div className="bg-white" >
      <div className="right-box-title" key={`dbeditor-librarypanel-${language}`} >
        SQL {i18next.t('dbmEditor.LibraryPanel.library')} [{list.length}]
      </div>
      <div className="text-indigo-500">
        <div className="p-1 flex items-center right-box-search">
            <Input
              type="text"
              value={searchValue}
              placeholder="输入搜索内容"
              className="search-bar"
              allowClear
              onChange={(e) => {
                setSearchValue(e.target.value);
              }} // 确保这里传递了正确的事件处理函数
            />   
        </div>
        <div ref={libraryPanelRef} className="overflow-auto">
          {list.map((item, index) => (
            <p
              key={index}
              className="cursor-pointer bg-gray-100 hover:bg-gray-400 font-mono hover:text-white p-2 text-sm rounded-sm my-2"
              onClick={()=> handleSelectd(item)}>
              {item.content}
              <p className="text-xs text-gray-500 ">{item.name}</p>
            </p>
          ))}
        </div>
      </div>
    </div>
    );
}

export default LibraryPanel;