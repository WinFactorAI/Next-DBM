import React, { useContext, useEffect, useMemo, useRef, useState } from 'react';
// import { TabList, TabPanel, Tabs } from 'react-tabs';
import { Button, Tabs } from 'antd';
import { debugLog } from "../../../../common/logger";
import { VisibilityContext } from '../../components/Utils/visibilityProvider';
import StatusBar from "../StatusBarPanel";
import DesignerPanel from './DesignerPanel';
import FunctionPanel from './FunctionPanel';
import ProcedurePanel from './ProcedurePanel';
import SQLDiffEditorPanel from './SQLDiffEditorPanel';
import SQLEditorPanel from "./SQLEditorPanel";
import SQLFilterPanel from './SQLFilterPanel';
import ViewPanel from './ViewPanel';

import { BranchesOutlined, ContainerOutlined, DeploymentUnitOutlined, FolderViewOutlined, FormOutlined, FunctionOutlined, FunnelPlotOutlined, LeftOutlined, ProductOutlined, RightOutlined } from '@ant-design/icons';

import { Dropdown, Space } from 'antd';

import { closestCenter, DndContext, PointerSensor, useSensor } from '@dnd-kit/core';
import {
  arrayMove,
  horizontalListSortingStrategy,
  SortableContext,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

import toast from 'react-hot-toast';
import Rename from '../DBM/Tab/rename';
import ErPanel from './ErPanel';

const { TabPane } = Tabs;
type TargetKey = React.MouseEvent | React.KeyboardEvent | string;



const DraggableTabNode = ({ className, ...props }) => {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({
    id: props['data-node-key'],
  });
  const style = {
    ...props.style,
    transform: CSS.Translate.toString(transform),
    transition,
    cursor: 'move',
  };
  return React.cloneElement(props.children, {
    ref: setNodeRef,
    style,
    ...attributes,
    ...listeners,
  });
};

// 应用组件
function TabBoxPanel() {

  const {SQL_EDIT_MODE} = useContext(VisibilityContext);
  const {tabs, setTabs, removeTab,addTab, setTabIndex, tabIndex,
    showConfirmModal,
    getTabByID,
    sqlsCreateOrUpdate,sqlsCreate,sqlsUpdate,sqlsDelete,sqlsDetail,sqlsAll,
    isTabNameVisible, setIsTabNameVisible,
    setOperationLabel,
    isRenameModalVisible, setShowRenameModalVisible,
    setRenameModalObj,
    setTabName
  } = useContext(VisibilityContext);


  const handleTabClick = (id) => {
    // event.preventDefault();
    // setTabIndex(tabs.findIndex((tab) => tab.id === id));
    // setDefaults(1);
    setTabIndex(id);
  };



  // 控制tab 滚动条
  const tabListRef = useRef(null);
  const handleTabLeftClick = () => {
    if (tabListRef.current) {
      setTimeout(() => {
        const newScrollLeft = Math.max(tabListRef.current.scrollLeft - tabListRef.current.clientWidth, 0);
        // tabListRef.current.scrollLeft = newScrollLeft;
        tabListRef.current.scrollTo({
          left: newScrollLeft,
          behavior: 'smooth' // 可选，平滑滚动
        });
        debugLog("tabListRef.current.scrollLeft ", tabListRef.current.scrollLeft);
      }, 0); // 延迟0毫秒执行，将操作放在下一个渲染周期
    }
  };
  const handleTabRightClick = () => {
    if (tabListRef.current) {
      setTimeout(() => {
        const maxScrollLeft = tabListRef.current.scrollWidth - tabListRef.current.clientWidth;
        const newScrollLeft = Math.min(tabListRef.current.scrollLeft + tabListRef.current.clientWidth, maxScrollLeft);
        // tabListRef.current.scrollLeft = newScrollLeft;
        tabListRef.current.scrollTo({
          left: newScrollLeft,
          behavior: 'smooth' // 可选，平滑滚动
        });
        debugLog("tabListRef.current.scrollLeft 22 ", newScrollLeft);
      }, 0); // 延迟0毫秒执行，将操作放在下一个渲染周期
    }
  };

  const closeTab = (id) => {
    // 阻止事件冒泡
    if(removeTab(id)){
      
    } else {
      // toast.error("不能关闭次窗口");
    }
  };
  useEffect(() => {
    // if(tabs[tabIndex]){
    //   if (tabs[tabIndex].sql.toLowerCase() === "select * from customers;") {
    //     setDefaults(1);
    //   } else if (tabs[tabIndex].sql.toLowerCase() === "select * from suppliers;") {
    //     setDefaults(2);
    //   } else if (tabs[tabIndex].sql.toLowerCase() === "select * from products;") {
    //     setDefaults(3);
    //   } else if (
    //     tabs[tabIndex].sql.toLowerCase() ===
    //     "select contact_name, address,city,postal_code, country from customers limit 18;"
    //   ) {
    //     setDefaults(4);
    //   } else {
    //     setDefaults(0);
    //   }
    // }
    // debugLog(" ## TabBoxPanle tabIndex ",tabIndex);
    // debugLog(" ## TabBoxPanle tabs ",tabs);
  }, [tabs,tabIndex]);
  
  const onChange = (key) => {
    setTabIndex(key);
    setOperationLabel("")
  };

  const onEdit = (targetKey, action) => {
    debugLog("### onEdit ",targetKey,action);
    if (action === 'add') {
      addTab({
        type:SQL_EDIT_MODE.EDITOR
      })
    } else {
      const tabItme = getTabByID(targetKey)
      debugLog("### tabItme ",tabItme)
      if(tabItme.sql.length >0 || tabItme.where.length >0 || tabItme.orderBy.length >0){
        showConfirmModal("关闭","确定要关闭吗？",null,()=>{
          debugLog("关闭 targetKey ",targetKey);
          closeTab(targetKey)
        })
      } else {
        closeTab(targetKey)
      }
    }
  };


  const sensor = useSensor(PointerSensor, {
    activationConstraint: {
      distance: 10,
    },
  });
  const onDragEnd = ({ active, over }) => {
    if (active.id !== over?.id) {
      setTabs((prev) => {
        const activeIndex = prev.findIndex((i) => i.id === active.id);
        const overIndex = prev.findIndex((i) => i.id === over?.id);
        return arrayMove(prev, activeIndex, overIndex);
      });
    }
  }

  // 普通tab菜单
  const erItems = [
    {
      key: '4',
      label: <span style={{ color: '#f53f3f' }}>关闭</span>,
    },
  ];
  const handleERMenuClick = (e) => {
    debugLog('click', e);
    switch (e.key) {
      case '4':
        showConfirmModal("关闭","确定要关闭吗？",null,()=>{
          debugLog("关闭 targetKey ",tabIndex);
          closeTab(tabIndex)
        })
        break;
      default:
        break;
    }
  };

  const menuCloseProps = {
    items:erItems,
    onClick: handleERMenuClick,
  };

  const items = [
    {
      key: '1',
      label: (<span>重命名</span>),
    },
    {
      key: '4',
      danger: true,
      label: '关闭',
    },
  ];
  const handleMenuClick = (e) => {
    debugLog('click', e);
    switch (e.key) {
      case '1':
        setIsTabNameVisible(true)
        break;
      case '4':
        showConfirmModal("关闭","确定要关闭吗？",null,()=>{
          debugLog("关闭 targetKey ",tabIndex);
          closeTab(tabIndex)
        })
        break;
      default:
        break;
    }
  };

  const menuProps = {
    items,
    onClick: handleMenuClick,
  };
  // 编辑器tab菜单
  const editerItems = [
    {
      key: '1',
      label: (<span>重命名</span>),
      onClick: () => {
         let tabsCurrentTmp = getTabByID(tabIndex)
          setRenameModalObj({
                title: '重命名',
                label: '新查询器名',
                labelCol: { span: 6 },
                rules: [
                 {
                   required: true,
                   message: '请输入新查询器名',
                 },
                ],
                value: tabsCurrentTmp.title,
                placeholder:'请输入新查询器名',
                callback:(value)=>{
                  let param = {
                    id:tabsCurrentTmp.id,
                    name: value.newName,
                    content:tabsCurrentTmp.sql,
                    dbName: tabsCurrentTmp.dbName,
                    tabKey:tabsCurrentTmp.tabKey
                  }
                  sqlsCreateOrUpdate(param).then(res=>{ 
                    setTabName(value.newName)
                    toast.success("重命名成功")
                  })
                }
              })
          setShowRenameModalVisible(true);
      }
    },
    {
      key: '2',
      label: (<span>保存查询</span>),
      onClick: () => {
        // 调用接口保存到sql管理模块中      sqlsCreate,sqlsUpdate,sqlsDelete,sqlsDetail
        debugLog(" tabs[tabIndex] ",getTabByID(tabIndex))
        let tabsCurrentTmp = getTabByID(tabIndex)
        let param = {
          id:tabsCurrentTmp.id,
          name: tabsCurrentTmp.title,
          content:tabsCurrentTmp.sql,
          dbName: tabsCurrentTmp.dbName,
          tabKey:tabsCurrentTmp.tabKey
        }
        debugLog(" param ",param)
        sqlsCreateOrUpdate(param).then(res=>{
         
        })
        debugLog("保存查询")
        toast.success("保存成功");
      }
    },
    {
      key: '4',
      danger: true,
      label: '关闭',
    },
  ];
  const handleMenuEditerClick = (e) => {
    // message.info('Click on menu item.');
    debugLog('click', e);
    switch (e.key) {
      case '1':
        // setIsTabNameVisible(true)
        break;
      case '2':
        // setIsTabNameVisible(true)
        // 调用接口保存到sql管理模块中
        break;
      case '4':
        showConfirmModal("关闭","确定要关闭吗？",null,()=>{
          debugLog("关闭 targetKey ",tabIndex);
          closeTab(tabIndex)
        })
        break;
      default:
        break;
    }
  };

  const menuEditerProps = {
    items:editerItems,
    onClick: handleMenuEditerClick,
  };

 
  const handlePrev = () => {
    const currentIndex = tabs.findIndex(pane => pane.id === tabIndex);
    debugLog(" ## handlePrev currentIndex ",currentIndex); 
    const newIndex = currentIndex === 0 ? tabs.length - 1 : currentIndex - 1;
    setTabIndex(tabs[newIndex].id);
    debugLog("handlePrev ",tabs[newIndex].id);  
  };

  const handleNext = () => {
    const currentIndex = tabs.findIndex(pane => pane.id === tabIndex);
    debugLog(" ## handleNext currentIndex ",currentIndex); 
    const newIndex = currentIndex === tabs.length - 1 ? 0 : currentIndex + 1;
    setTabIndex(tabs[newIndex].id);
    debugLog("handleNext ",tabs[newIndex].id);
  };

  const OperationsSlot = {
    left: <Button className="tabs-extra-demo-button"  type="text" icon={<LeftOutlined />} onClick={() => {
      handlePrev()
    }}/>,
    right: <Button  type="text" icon={<RightOutlined />} onClick={() => {
      handleNext()
    }}/>,
  };

  const [position, setPosition] = useState(['left', 'right']);
  const slot = useMemo(() => {
    if (position.length === 0) {
      return null;
    }
    return position.reduce(
      (acc, direction) => ({
        ...acc,
        [direction]: OperationsSlot[direction],
      }),
      {},
    );
  }, [position]);

  return (
    <div className="tabs-box">
      <div className='upper-div'>
        <Tabs
          // tabBarExtraContent={slot}
          type="editable-card"
          onChange={onChange}
          activeKey={tabIndex}
          onEdit={onEdit}
          size="small"
          renderTabBar={(tabBarProps, DefaultTabBar) => (
            <DndContext sensors={[sensor]} onDragEnd={onDragEnd} collisionDetection={closestCenter}>
              <SortableContext items={tabs.map((i) => i.id)} strategy={horizontalListSortingStrategy}>
                <DefaultTabBar {...tabBarProps}>
                  {(node) => (
                    <DraggableTabNode {...node.props} key={node.id}>
                      {node}
                    </DraggableTabNode>
                  )}
                </DefaultTabBar>
              </SortableContext>
            </DndContext>
          )}>
            {tabs.map((tab) => (
              <TabPane key={tab.id} tab={
                  <span>
                      <Dropdown placement="bottomLeft" arrow menu={menuEditerProps}  size="small"  >
                        <Space>
                          {
                            tab.type === SQL_EDIT_MODE.EDITOR && <FormOutlined className='mr-1'/>
                          }
                        </Space>
                      </Dropdown>
                      <Dropdown placement="bottomLeft" arrow menu={menuCloseProps}  size="small"  >
                        <Space>
                          {
                            tab.type === SQL_EDIT_MODE.FILTER && <FunnelPlotOutlined className='mr-1'/>
                          }
                        </Space>
                      </Dropdown>
                      <Dropdown placement="bottomLeft" arrow menu={menuCloseProps}  size="small"  >
                        <Space>
                          {
                            tab.type === SQL_EDIT_MODE.DIFF && <BranchesOutlined className='mr-1'/>
                          }
                        </Space>
                      </Dropdown>
                      <Dropdown placement="bottomLeft" arrow menu={menuCloseProps}  size="small"  >
                        <Space>
                          {
                            tab.type === SQL_EDIT_MODE.DESIGNER  && <ProductOutlined className='mr-1'/>
                          }
                        </Space>
                      </Dropdown>
                      <Dropdown placement="bottomLeft" arrow menu={menuCloseProps}  size="small"  >
                        <Space>
                          {
                            tab.type === SQL_EDIT_MODE.VIEW  && <FolderViewOutlined className='mr-1'/>
                          }
                        </Space>
                      </Dropdown>
                      <Dropdown placement="bottomLeft" arrow menu={menuCloseProps}  size="small"  >
                        <Space>
                          {
                            tab.type === SQL_EDIT_MODE.FUNCTION  && <FunctionOutlined className='mr-1'/>
                          }
                        </Space>
                      </Dropdown>
                      <Dropdown placement="bottomLeft" arrow menu={menuCloseProps}  size="small"  >
                        <Space>
                          {
                            tab.type === SQL_EDIT_MODE.PROCEDURE  && <ContainerOutlined className='mr-1'/>
                          }
                        </Space>
                      </Dropdown>
                      <Dropdown placement="bottomLeft" arrow menu={menuCloseProps}  size="small"  >
                        <Space>
                          {
                            tab.type === SQL_EDIT_MODE.ER  && <DeploymentUnitOutlined className='mr-1'/>
                          }
                        </Space>
                      </Dropdown>
                    {tab.title}
                  </span>
                // icon={<FormOutlined className='mr-1'/>}
              } >
                {
                  tab.type === SQL_EDIT_MODE.EDITOR && <SQLEditorPanel currentTab={tab} />
                }
                {
                  tab.type === SQL_EDIT_MODE.FILTER && <SQLFilterPanel currentTab={tab} />
                }
                {
                  tab.type === SQL_EDIT_MODE.DIFF && <SQLDiffEditorPanel tab={tab} />
                }
                {
                  tab.type === SQL_EDIT_MODE.DESIGNER && <DesignerPanel tab={tab} />
                }
                {
                  tab.type === SQL_EDIT_MODE.VIEW && <ViewPanel tab={tab} />
                }
                {
                  tab.type === SQL_EDIT_MODE.FUNCTION && <FunctionPanel tab={tab} />
                }
                {
                  tab.type === SQL_EDIT_MODE.PROCEDURE && <ProcedurePanel tab={tab} />
                }
                {
                  tab.type === SQL_EDIT_MODE.ER && <ErPanel tab={tab} />
                }
              </TabPane>
            ))}
        </Tabs>
      </div>
      <div className="lower-div border-t border-ddd status-bar">
        <StatusBar/>
      </div>
      <Rename/>
    </div>
  );
}

export default TabBoxPanel;