import { CloseCircleOutlined } from '@ant-design/icons';
import { Button, Input } from 'antd';
import i18next from 'i18next';
import React, { useContext, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { debugLog } from "../../../../../common/logger";
import { VisibilityContext } from '../../../components/Utils/visibilityProvider';
// 应用组件
function HistoryPanel() {
  const {
    isHistoryPaneVisible,
    historyQueryList,
    setHistoryQueryList,
    delHistoryQueryList,
    showConfirmModal,
    setTabAppleValue,
    tabIndex,
    getTabByID,
    SQL_EDIT_MODE,
    language
  } = useContext(VisibilityContext);
  const [searchList, setSearchList] = useState([]);
  const { historyPanelSizePx } = useContext(VisibilityContext);

  const [searchValue, setSearchValue] = useState("");
  const [list, setList] = useState(historyQueryList);
  //同步数据
  useEffect(() => {
    setList(historyQueryList)
  }, [historyQueryList])

  const historyPanelRef = React.createRef();
  useEffect(() => {
    setList(historyQueryList.filter(({ query, status, timestamp }) => query.includes(searchValue) || status.includes(searchValue) || timestamp.includes(searchValue)));
    if (historyPanelRef.current) {
      // debugLog(" historyPanelSizePx ",historyPanelSizePx)    
      historyPanelRef.current.style.height = `${historyPanelSizePx - 188}px`;
      // historyQueryListRef.current.style.height = `${(listHeight*2 / 100 ) * 1000 }px`;
    }
  }, [searchValue, searchList, historyPanelSizePx, historyQueryList]);

  const handleClear = () => {
    setSearchValue(''); // 清除搜索框内容
  };
  const delItem = (item) => {
    showConfirmModal("删除历史记录", "确定要删除历史记录吗？", null, () => {
      debugLog("删除历史记录");
      delHistoryQueryList(item)
    })
  };
  const handleSelectd = (item) => {
    const tab = getTabByID(tabIndex)
    // debugLog(' tabs[tabIndex].type ',tab)
    if (tab.type === SQL_EDIT_MODE.EDITOR) {
      setTabAppleValue(item.query)
    } else {
      toast.error('该模式无法使用SQL指令库');
    }
  };
  // initialSize={ getSplitPredefinedPaneSize(1)}
  return (
    <div className="bg-white">
      <div className="right-box-title" key={`dbeditor-historypanel-${language}`} >
        {i18next.t('dbmEditor.HistoryPanel.history')} [{list.length}]
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
        <div ref={historyPanelRef} className="h-100 lg:h-100 overflow-auto">
          {list.map((item, index) => (
            <p
              key={index}
              className="cursor-pointer bg-gray-100 hover:bg-gray-400 font-mono hover:text-white p-2 text-sm rounded-sm my-2"
              onClick={() => handleSelectd(item)}>
              {/* 使用三元条件运算符进行条件渲染 */}
              {item.status === '成功' ? (
                <div>
                  <div className="text-green-500 width60px"> {item.status} {item.timestamp}
                    <Button onClick={(e) => {
                      e.stopPropagation();     
                      delItem(item)
                    }} type="text" icon={<CloseCircleOutlined />} className='history-close-btn' />
                  </div>
                  <div className="text-green-500 width60px"> {item.msg}</div>
                </div>
              ) : (
                <div>
                  <div className="text-red-500 width60px"> {item.status} {item.timestamp}
                    <Button onClick={(e) => {
                      e.stopPropagation();         
                      delItem(item)
                    }} type="text" icon={<CloseCircleOutlined />} className='history-close-btn' />
                  </div>
                  <div className="text-red-500 width60px"> {item.msg}</div>
                </div>
              )}
              <div>

                {item.query}
              </div>
            </p>
          ))}
          {list && list.length === 0 && (
            <p className="w-full flex text-center h-80 justify-center items-center font-bold font-mono text-gray-400 text-2xl px-6">暂无数据</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default HistoryPanel;