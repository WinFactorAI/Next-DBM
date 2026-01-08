import { ProTable } from "@ant-design/pro-components";
import { Button, ConfigProvider, Drawer, Layout, Modal, Popconfirm, Select, Table, Tag, Tooltip } from "antd";
import i18next from 'i18next';
import React, { useEffect, useState } from 'react';
import { useQuery } from "react-query";
import assetApi from "../../api/asset";
import sessionApi from "../../api/session";
import userApi from "../../api/user";
import { MODE_COLORS, PROTOCOL_COLORS } from "../../common/constants";
import localeConfig from '../../common/localeConfig';
import Show from "../../dd/fi/show";
import ColumnState, { useColumnState } from "../../hook/column-state";
import { differTime } from "../../utils/utils";
import './OfflineSession.css';
import SqlLogSession from "./SqlLogSession";

const { Content } = Layout;
const actionRef = React.createRef();
const api = sessionApi;

const OfflineSession = () => {

    const [columnsStateMap, setColumnsStateMap] = useColumnState(ColumnState.OFFLINE_SESSION);

    let [selectRow, setSelectRow] = useState([]);
    let [open, setOpen] = useState(false);

    let [selectedRowKeys, setSelectedRowKeys] = useState([]);
    let userQuery = useQuery('userQuery', userApi.getAll);
    let assetQuery = useQuery('assetQuery', assetApi.getAll);

    const userOptions = userQuery.data?.map(item => {
        return {
            label: item.nickname,
            value: item.id
        }
    })

    const assetOptions = assetQuery.data?.map(item => {
        return {
            label: item.name,
            value: item.id
        }
    })

    const [i18nVersion, setI18nVersion] = useState(0);
    const [locale, setLocale] = useState(localStorage['zh-CN']); // 默认英文
    // 强制更新监听
    useEffect(() => {
        const initDefault = () => {
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
        }, {
            title: i18next.t('offlineSession.column.clientIp'),
            dataIndex: 'clientIp',
            key: 'clientIp',
        }, {
            title: i18next.t('offlineSession.column.creatorName'),
            dataIndex: 'creatorName',
            key: 'creatorName',
            renderFormItem: (item, { type, defaultRender, ...rest }, form) => {
                if (type === 'form') {
                    return null;
                }

                return (
                    <Select showSearch
                        filterOption={(input, option) =>
                            (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                        }
                        allowClear
                        options={userOptions}
                    >

                    </Select>
                );
            },
        }, {
            title: i18next.t('offlineSession.column.assetName'),
            dataIndex: 'assetName',
            key: 'assetName',
            renderFormItem: (item, { type, defaultRender, ...rest }, form) => {
                if (type === 'form') {
                    return null;
                }

                return (
                    <Select showSearch
                        filterOption={(input, option) =>
                            (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                        }
                        allowClear
                        options={assetOptions}>
                    </Select>
                );
            },
        }, {
            title: i18next.t('offlineSession.column.mode'),
            dataIndex: 'mode',
            key: 'mode',
            render: (text, record) => {
                const title = `${record.username}@${record.ip}:${record.port}`;
                const key = text?.toLowerCase();
                return (
                    <Tooltip title={title}>
                        <Tag color={MODE_COLORS[key]}>{text}</Tag>
                    </Tooltip>
                )
            },
        }, {
            title: i18next.t('offlineSession.column.protocol'),
            dataIndex: 'protocol',
            key: 'protocol',
            render: (text, record) => {
                const title = `${record.username}@${record.ip}:${record.port}`;
                const key = text?.toLowerCase();
                return (
                    <Tooltip title={title}>
                        <Tag color={PROTOCOL_COLORS[key]}>{text}</Tag>
                    </Tooltip>
                )
            },
            renderFormItem: (item, { type, defaultRender, ...rest }, form) => {
                if (type === 'form') {
                    return null;
                }

                return (
                    <Select>
                        <Select.Option value="rdp">RDP</Select.Option>
                        <Select.Option value="ssh">SSH</Select.Option>
                        <Select.Option value="telnet">Telnet</Select.Option>
                        <Select.Option value="kubernetes">Kubernetes</Select.Option>
                    </Select>
                );
            },
        }, {
            title: i18next.t('offlineSession.column.connectedTime'),
            dataIndex: 'connectedTime',
            key: 'connectedTime',
            hideInSearch: true,
        }, {
            title: i18next.t('offlineSession.column.connectedTimeDur'),
            dataIndex: 'connectedTimeDur',
            key: 'connectedTimeDur',
            render: (text, record) => {
                if (!record['connectedTime']) {
                    return '-';
                }
                return differTime(new Date(record['connectedTime']), new Date(record['disconnectedTime']));
            },
            hideInSearch: true,
        },
        {
            title: i18next.t('offlineSession.column.info'),
            dataIndex: 'message',
            key: 'message',
            hideInSearch: true,
        },
        {
            title: i18next.t('offlineSession.column.operation'),
            valueType: 'option',
            key: 'option',
            render: (text, record, _, action) => {
                let disablePlayback = record['recording'] !== '1';
                let disableCmdRecord = record['commandCount'] === 0;
                return [
                    <Show menu={'offline-session-playback'} key={'offline-session-playback'}>
                        {/* <Button
                            key='monitor'
                            disabled={disablePlayback}
                            type="link"
                            size='small'
                            onClick={() => {
                                switch (record['mode']) {
                                    case 'naive':
                                    case 'native':
                                    case 'terminal':
                                        openTinyWin(`#/term-playback?sessionId=${record['id']}`, record['id'], 1024, 520);
                                        break;
                                    case 'guacd':
                                        openTinyWin(`#/guacd-playback?sessionId=${record['id']}`, record['id'], 1024, 768);
                                        break;
                                    default:
                                        message.info('数据异常');
                                        break;
                                }
                            }}>
                            回放
                        </Button> */}
                        <Button
                            key='monitor'
                            type="link"
                            size='small'
                            onClick={() => {
                                setSelectRow(record);
                                setOpen(true);
                            }}>
                            {i18next.t('offlineSession.action.auditCommands')}
                        </Button>
                    </Show>,
                    <Show menu={'offline-session-del'} key={'offline-session-del'}>
                        <Popconfirm
                            key={'confirm-delete'}
                            title={i18next.t('offlineSession.confirm.deleteSession')}
                            onConfirm={async () => {
                                await api.deleteById(record.id);
                                actionRef.current.reload();
                            }}
                            okText={i18next.t('offlineSession.button.confirm')}
                            cancelText={i18next.t('offlineSession.button.cancel')}
                        >
                            <a key='delete' className='danger'>{i18next.t('offlineSession.action.delete')}</a>
                        </Popconfirm>
                    </Show>,
                ]
            },
        },
    ];

    const onClose = () => {
        setOpen(false);
    };

    const [width, setWidth] = useState('60%');

    // 动态更新宽度
    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth <= 768) { // 判断屏幕宽度
                setWidth('100%');
            } else {
                setWidth('60%');
            }
        };

        window.addEventListener('resize', handleResize);
        handleResize(); // 初始时执行一次

        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, []);
    return (<Content className="page-container">
        <ConfigProvider locale={locale}>
            <ProTable
                scroll={{ x: 'max-content' }}
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
                        protocol: params.protocol,
                        clientIp: params.clientIp,
                        userId: params.creatorName,
                        assetId: params.assetName,
                        field: field,
                        order: order,
                        status: 'disconnected',
                    }
                    let result = await api.getPaging(queryParams);
                    return {
                        data: result['items'],
                        success: true,
                        total: result['total']
                    };
                }}
                rowKey="id"
                rowClassName={(record, index) => {
                    return record['reviewed'] ? '' : 'unreviewed';
                }}
                rowSelection={{
                    selections: [Table.SELECTION_ALL, Table.SELECTION_INVERT],
                    selectedRowKeys: selectedRowKeys,
                    onChange: (keys) => {
                        setSelectedRowKeys(keys);
                    }
                }}
                search={{
                    labelWidth: 'auto',
                }}
                pagination={{
                    defaultPageSize: 10,
                    showSizeChanger: true
                }}
                dateFormatter="string"
                headerTitle={i18next.t('offlineSession.table.title')}
                toolBarRender={() => [
                    <Show menu={'offline-session-del'}>
                        <Button key="delete" danger
                            type="primary"
                            disabled={selectedRowKeys.length === 0}
                            onClick={() => {
                                Modal.confirm({
                                    title: i18next.t('offlineSession.confirm.deleteSelected'),
                                    content: i18next.t('offlineSession.confirm.deleteSelectedContent'),
                                    okText: i18next.t('offlineSession.button.confirm'),
                                    okType: 'danger',
                                    cancelText: i18next.t('offlineSession.button.cancel'),
                                    onOk: async () => {
                                        await api.deleteById(selectedRowKeys.join(","));
                                        actionRef.current.reload();
                                        setSelectedRowKeys([]);
                                    }
                                });
                            }}>
                            {i18next.t('offlineSession.toolbar.delete')}
                        </Button>
                    </Show>,
                    <Show menu={'offline-session-clear'}>
                        <Button key="clear" danger
                            type="primary"
                            onClick={() => {
                                Modal.confirm({
                                    title: i18next.t('offlineSession.confirm.clearAll'),
                                    content: i18next.t('offlineSession.confirm.clearAllContent'),
                                    okText: i18next.t('offlineSession.button.confirm'),
                                    okType: 'danger',
                                    cancelText: i18next.t('offlineSession.button.cancel'),
                                    onOk: async () => {
                                        await api.clear();
                                        actionRef.current.reload();
                                        setSelectedRowKeys([]);
                                    }
                                });
                            }}>
                            {i18next.t('offlineSession.toolbar.clear')}
                        </Button>
                    </Show>,
                ]}
            />
            <Drawer
                width={width}
                title={i18next.t('offlineSession.drawer.auditCommands.title')}
                placement="right"
                onClose={onClose}
                open={open}>
                <SqlLogSession selectRow={selectRow} open={open} />
            </Drawer>
        </ConfigProvider>
    </Content>);
};

export default OfflineSession;
