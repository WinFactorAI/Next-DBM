import { CloseOutlined, PlayCircleOutlined } from '@ant-design/icons';
import { ProTable } from "@ant-design/pro-components";
import { Avatar, Button, Col, Collapse, ConfigProvider, Layout, List, message, Popconfirm, Row, Space } from "antd";
import i18next from 'i18next';
import React, { useEffect, useState } from 'react';
import buildApi from "../../api/build";
import buildQueueApi from "../../api/build-queue";
import localeConfig from '../../common/localeConfig';
import Show from "../../dd/fi/show";
import ColumnState, { useColumnState } from "../../hook/column-state";
import BuildLogsDrawer from "./BuildLogsDrawer";
import BuildModal from "./BuildModal";
import ChangeOwner from "./ChangeOwner";
import SelectingAsset from "./SelectingAsset";
import { abortedSvg } from "./components/status/aborted";
import { abortedProgressSvg } from "./components/status/aborted-progress";
import { builtSvg } from "./components/status/built";
import { builtProgressSvg } from "./components/status/built-progress";
import { disabledSvg } from "./components/status/disabled";
import { disabledProgressSvg } from "./components/status/disabled-progress";
import { failedSvg } from "./components/status/failed";
import { failedProgressSvg } from "./components/status/failed-progress";
import { failuresSvg } from "./components/status/failures";
import { failuresProgressSvg } from "./components/status/failures-progress";
import { startSvg } from "./components/status/start";
import { stopSvg } from './components/status/stop';
import { successSvg } from "./components/status/success";
import { successProgressSvg } from "./components/status/success-progress";

const { Panel } = Collapse;
const {Content} = Layout;
const api = buildApi;
const actionRef = React.createRef();

const Build = () => {

    let [assetVisible, setAssetVisible] = useState(false);

    
    let [visibleLogs, setVisibleLogs] = useState(false);
    let [visible, setVisible] = useState(false);
    let [confirmLoading, setConfirmLoading] = useState(false);
    let [selectedRowKey, setSelectedRowKey] = useState(undefined);

    const [columnsStateMap, setColumnsStateMap] = useColumnState(ColumnState.CREDENTIAL);
    const [queueData,setQueueData] = useState([]);
    const [queueProcessData,setQueueProcessData] = useState([]);

    let [selectedRow, setSelectedRow] = useState(undefined);
    let [changeOwnerVisible, setChangeOwnerVisible] = useState(false);
    const [tableData, setTableData] = useState([]);
    const [tableListQueryParams, setTableListQueryParams] = useState([]);
    
    const reflash = async () => {
        let queryParamsWaiting = {
            pageIndex: 1,
            pageSize: 100,
            classType: 'waiting'
        }
        await buildQueueApi.getPaging(queryParamsWaiting).then(res => {
            setQueueData(res.items)
        })
       
        let queryParamsRuning = {
            pageIndex: 1,
            pageSize: 100,
            classType: 'runing'
        }
        await buildQueueApi.getPaging(queryParamsRuning).then(res => {
            setQueueProcessData(res.items)
            // actionRef.current.reload();
        })
        
        await api.getPaging(tableListQueryParams).then(res=>{
            setTableData(res.items); // 更新表格数据
        });
    }
    // 写个定时器
    useEffect(() => {
      // 定义定时器的引用
      let timerId = null;
  
      // 设置定时器
      const startInterval = () => {
        timerId = setInterval(async () => {
            reflash();
        }, 3000); 
      };
 
      // 组件挂载时启动定时器
      startInterval();
  
      // 组件卸载时清除定时器
      return () => {
        if (timerId) {
          clearInterval(timerId);
        }
      };
    }, [tableListQueryParams]); // 空依赖数组表示这个effect只在组件挂载和卸载时运行
    
    const [i18nVersion, setI18nVersion] = useState(0);
    const [locale, setLocale] = useState(localStorage['zh-CN']); // 默认英文
    // 强制更新监听
    useEffect(() => {
        const initDefault = () =>{
            setLocale(localeConfig[localStorage.getItem('language')]);
        }
        initDefault();
        const handleLanguageChange = () => {
            setI18nVersion(v => v + 1);
            initDefault();
        };
        i18next.on('languageChanged', handleLanguageChange);
        return () => i18next.off('languageChanged', handleLanguageChange);
    }, []);

    const columns = [
        {
            dataIndex: 'index',
            valueType: 'indexBorder',
            width: 48,
        },
        {
            title: i18next.t('build.column.status'),
            dataIndex: 'status', 
            key: 'status',
            width: 48,
            hideInSearch: true,
            render: (_, record) => (
                <>
                  {/* {record.status} */}
                  <span>{iconType(record.status)}</span>
                </>
              ),
        },
        {
            title: i18next.t('build.column.name'),
            dataIndex: 'name',
            key: 'name',
        }, {
            title: i18next.t('build.column.content'),
            dataIndex: 'content',
            key: 'content',
        }, {
            title: i18next.t('build.column.ownerName'),
            dataIndex: 'ownerName',
            key: 'ownerName',
            hideInSearch: true
        },
        {
            title: i18next.t('build.column.created'),
            key: 'created',
            dataIndex: 'created',
            hideInSearch: true,
        },
        {
            title: i18next.t('build.column.option'),
            valueType: 'option',
            key: 'option',
            render: (text, record, _, action) => [
                <Show menu={'command-exec'} key={'command-exec'}>
                    <a
                        key="run"
                        onClick={() => {
                            startById(record['id'])
                        }}
                    >
                        <PlayCircleOutlined color='#1ea64b' /> 
                    </a>
                </Show>,
                <Show menu={'command-edit'} key={'command-edit'}>
                    <a
                        key="edit"
                        onClick={() => {
                            setVisible(true);
                            setSelectedRowKey(record['id']);
                        }}
                    >
                        {i18next.t('build.action.edit')}
                    </a>
                </Show>,
                <Show menu={'command-edit'} key={'command-edit'}>
                    <a
                        key="edit"
                        onClick={() => {
                            setVisibleLogs(true);
                            setSelectedRowKey(record['id']);
                        }}
                    >
                        {i18next.t('build.action.buildLogs')}
                    </a>
                </Show>,
                <Show menu={'command-change-owner'} key={'command-change-owner'}>
                    <a
                        key="change-owner"
                        onClick={() => {
                            handleChangeOwner(record);
                        }}
                    >
                        {i18next.t('build.action.changeOwner')}
                    </a>
                </Show>,
                <Show menu={'command-del'} key={'command-del'}>
                    <Popconfirm
                        key={'confirm-delete'}
                        title={i18next.t('build.confirm.delete')}
                        onConfirm={async () => {
                            await api.deleteById(record.id);
                            actionRef.current.reload();
                        }}
                        okText={i18next.t('build.confirm.okText')}
                        cancelText={i18next.t('build.confirm.cancelText')}
                    >
                        <a key='delete' className='danger'>{i18next.t('build.action.delete')}</a>
                    </Popconfirm>
                </Show>,
            ],
        },
    ];

    const handleChangeOwner = (row) => {
        setSelectedRow(row);
        setChangeOwnerVisible(true);
    }
 
    const getBuildPanelSize = (defSize,index) =>{
        const splitBuildPanelPos = localStorage.getItem('splitBuildPanelPos')
        if(splitBuildPanelPos){
            return  splitBuildPanelPos.split(',')[index];
        }else {
            return defSize
        }
    }
    const [leftPanelSize,setLeftPanelSize] = useState(getBuildPanelSize('20%',0))
    const [rightPanelSize,setRightPanelSize] = useState(getBuildPanelSize('90%',1))

    const percentToPx =  (percent,baseSize) =>{
        return ( baseSize * parseFloat(percent)) / 100;
    }

    const change=(size) =>{
        localStorage.setItem('splitBuildPanelPos', size);

        const WWidth = window.innerWidth;
        const firstPaneWidth = percentToPx(size[0],WWidth);
        const threadPaneWidth = percentToPx(size[2],WWidth);
        setLeftPanelSize(firstPaneWidth);
        setRightPanelSize(threadPaneWidth)
    }
    const IconText = ({ icon, text }) => (
        <Space>
          {React.createElement(icon)}
          {text}
        </Space>
      );
    const iconType = (type) =>{
        switch(type){
            case 'startSvg':
                return startSvg();

            case 'successSvg':
                return successSvg();
            case 'successProgressSvg':
                return successProgressSvg();
                
            case 'failuresSvg':
                return failuresSvg();

            case 'failuresProgressSvg':
                return failuresProgressSvg();

            case 'failedSvg':
                return failedSvg();
            case 'failedProgressSvg':
                return failedProgressSvg();

            case 'builtSvg':
                return builtSvg();
            case 'builtProgressSvg':
                return builtProgressSvg();

            case 'disabledSvg':
                return disabledSvg();
            case 'disabledProgressSvg':
                return disabledProgressSvg();

            case 'abortedSvg':
                return abortedSvg();
            case 'abortedProgressSvg':
                return abortedProgressSvg();
            case 'stopSvg':
                    return stopSvg();
            default:
                return abortedSvg();
        }
    }

    const startById =async (id) =>{
        await buildApi.start(id).then(res=>{
            actionRef.current.reload();
        })
    }
    const stopById = async (id) =>{
        await buildQueueApi.stop(id)
    }
    return (<Content className="page-container">
         <ConfigProvider locale={locale}>
         {/* <SplitPane split="vertical" className="main-split-pane"onChange={change}> */}
         <Row gutter={16}>
            <Col xs={24} sm={6} md={4} lg={4} xl={4}>
                <div  initialSize={leftPanelSize} minSize="15%" maxSize="30%">
                    <Collapse defaultActiveKey={['1']} className="collapse-box">
                        <Panel header={i18next.t('build.panel.buildQueue')} key="1" >
                            <List
                                style={{ maxHeight: '500px', overflowY: 'auto' }}
                                className="credential-list"
                                itemLayout="horizontal"
                                dataSource={queueData}
                                renderItem={(item) => (
                                <List.Item
                                key={item.id}
                                extra={
                                    <Button icon={<CloseOutlined />} className='list-action-close-icon' size='small' onClick={()=>{
                                        stopById(item.id)
                                    }}/>
                                }
                            >
                                <List.Item.Meta
                                title={item.name}
                                description={item.created}
                                />
                                </List.Item>
                            )}
                            />
                        </Panel>
                    </Collapse>
                    <Collapse defaultActiveKey={['1']} className="collapse-box">
                        <Panel header={i18next.t('build.panel.buildStatus')} key="1">
                            <List
                                style={{ maxHeight: '500px', overflowY: 'auto' }}
                                className="credential-list"
                                itemLayout="horizontal"
                                dataSource={queueProcessData}
                                renderItem={(item) => (
                                <List.Item
                                key={item.id}
                                extra={
                                    <Button icon={<CloseOutlined />} className='list-action-close-icon' size='small' onClick={()=>{
                                        stopById(item.id)
                                    }}/>
                                }
                            >
                                <List.Item.Meta
                                avatar={
                                    <Avatar className='list-action-icon' src={iconType(item.status) } />
                                }
                                title={item.name}
                                description={item.created}
                                />
                                </List.Item>
                            )}
                            />
                        </Panel>
                    </Collapse>
                </div>
            </Col>
            <Col xs={24} sm={18} md={20} lg={20} xl={20}>
            <div  initialSize={rightPanelSize} minSize="50%">
                <ProTable
                scroll={{ x: 'max-content' }}
                dataSource={tableData}
                columns={columns}
                actionRef={actionRef}
                columnsState={{
                    value: columnsStateMap,
                    onChange: setColumnsStateMap
                }}
                request={async (params = {}, sort, filter) => {

                    let field = '';
                    let order = '';
                    if (Object.keys(sort).length > 0) {
                        field = Object.keys(sort)[0];
                        order = Object.values(sort)[0];
                    }

                    let queryParams = {
                        pageIndex: params.current,
                        pageSize: params.pageSize,
                        name: params.name,
                        content: params.content,
                        field: field,
                        order: order
                    }
                    setTableListQueryParams(queryParams)
                    let result = await api.getPaging(queryParams);
                    setTableData(result['items'])
                    return {
                        data: result['items'],
                        success: true,
                        total: result['total']
                    };
                }}
                rowKey="id"
                search={{
                    labelWidth: 'auto',
                }}
                pagination={{
                    defaultPageSize: 10,
                }}
                dateFormatter="string"
                headerTitle={i18next.t('build.table.title')}
                toolBarRender={() => [
                    <Show menu={'command-add'}>
                        <Button key="button" type="primary" onClick={() => {
                            setVisible(true)
                        }}>
                            {i18next.t('build.modal.title')}
                        </Button>
                    </Show>,
                ]} />

                <BuildModal
                    id={selectedRowKey}
                    visible={visible}
                    confirmLoading={confirmLoading}
                    handleCancel={() => {
                        setVisible(false);
                        setSelectedRowKey(undefined);
                    }}
                    handleOk={async (values) => {
                        setConfirmLoading(true);

                        try {
                            let success;
                            if (values['id']) {
                                success = await api.updateById(values['id'], values);
                            } else {
                                success = await api.create(values);
                            }
                            if (success) {
                                setVisible(false);
                            }
                            actionRef.current.reload();
                        } finally {
                            setConfirmLoading(false);
                        }
                    }}
                />

                <BuildLogsDrawer
                    id={selectedRowKey}
                    visible={visibleLogs}
                    confirmLoading={confirmLoading}
                    handleCancel={() => {
                        setVisibleLogs(false);
                        setSelectedRowKey(undefined);
                    }}
                    handleOk={async (values) => {
                        setConfirmLoading(true);

                        try {
                            let success;
                            if (values['id']) {
                                success = await api.updateById(values['id'], values);
                            } else {
                                success = await api.create(values);
                            }
                            if (success) {
                                setVisibleLogs(false);
                            }
                            actionRef.current.reload();
                        } finally {
                            setConfirmLoading(false);
                        }
                    }}
                />
                
                <SelectingAsset
                    visible={assetVisible}
                    handleCancel={() => {
                        setAssetVisible(false);
                        setSelectedRowKey(undefined);
                    }}
                    handleOk={(rows) => {
                        if (rows.length === 0) {
                            message.warning(i18next.t('build.warning.selectAsset'));
                            return;
                        }

                        let cAssets = rows.map(item => {
                            return {
                                id: item['id'],
                                name: item['name']
                            }
                        });

                        window.location.href = '#/execute-command?commandId=' + selectedRowKey + '&assets=' + JSON.stringify(cAssets);
                    }}
                />

                <ChangeOwner
                    lastOwner={selectedRow?.owner}
                    open={changeOwnerVisible}
                    handleOk={async (owner) => {
                        let success = await api.changeOwner(selectedRow?.id, owner);
                        if (success) {
                            setChangeOwnerVisible(false);
                            actionRef.current.reload();
                        }
                    }}
                    handleCancel={() => {
                        setChangeOwnerVisible(false);
                    }}
                />
            </div>
            </Col>
        </Row>
           
        </ConfigProvider>
         {/* </SplitPane> */}
       
    </Content>);
};

export default Build;
