import { ProTable } from "@ant-design/pro-components";
import { Button, ConfigProvider, Drawer, Layout, Popconfirm, Select, Tag, Tooltip } from "antd";
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
import SqlLogSession from "./SqlLogSession";
const { Content } = Layout;
const actionRef = React.createRef();
const api = sessionApi;

const OnlineSession = () => {

    let [selectRow, setSelectRow] = useState([]);
    let [open, setOpen] = useState(false);

    const [columnsStateMap, setColumnsStateMap] = useColumnState(ColumnState.ONLINE_SESSION);
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
            title: i18next.t('onlineSession.column.clientIp'),
            dataIndex: 'clientIp',
            key: 'clientIp',
        }, {
            title: i18next.t('onlineSession.column.creatorName'),
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
            title: i18next.t('onlineSession.column.assetName'),
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
            title: i18next.t('onlineSession.column.mode'),
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
            title: i18next.t('onlineSession.column.protocol'),
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
            title: i18next.t('onlineSession.column.connectedTime'),
            dataIndex: 'connectedTime',
            key: 'connectedTime',
            hideInSearch: true,
        }, {
            title: i18next.t('onlineSession.column.connectedTimeDur'),
            dataIndex: 'connectedTimeDur',
            key: 'connectedTimeDur',
            render: (text, record) => {
                if (!record['connectedTime']) {
                    return '-';
                }
                return differTime(new Date(record['connectedTime']), new Date());
            },
            hideInSearch: true,
        },
        {
            title: i18next.t('onlineSession.column.info'),
            dataIndex: 'message',
            key: 'message',
            hideInSearch: true,
        },
        {
            title: i18next.t('onlineSession.column.option'),
            valueType: 'option',
            key: 'option',
            render: (text, record, _, action) => [
                <Show menu={'online-session-monitor'} key={'online-session-monitor'}>
                    {/* <Button
                        key='monitor'
                        type="link"
                        size='small'
                        onClick={() => {
                            switch (record['mode']) {
                                case 'naive':
                                case 'native':
                                case 'terminal':
                                    openTinyWin(`#/term-monitor?sessionId=${record['id']}`, record['id'], 1024, 768);
                                    break;
                                case 'guacd':
                                    openTinyWin(`#/guacd-monitor?sessionId=${record['id']}`, record['id'], 1024, 768);
                                    break;
                                default:
                                    message.info('数据异常');
                                    break;
                            }
                        }}>
                        监控
                    </Button> */}
                    <Button
                        key='monitor'
                        type="link"
                        size='small'
                        onClick={() => {
                            setSelectRow(record);
                            setOpen(true);
                        }}>
                        {i18next.t('onlineSession.drawer.sqlLogSession.title')}
                    </Button>
                </Show>,
                <Show menu={'online-session-disconnect'} key={'online-session-disconnect'}>
                    <Popconfirm
                        key={'confirm-disconnect'}
                        title={i18next.t('onlineSession.action.disconnect.confirmTitle')}
                        onConfirm={async () => {
                            await api.disconnect(record.id);
                            actionRef.current.reload();
                        }}
                        okText={i18next.t('onlineSession.action.disconnect.okText')}
                        cancelText={i18next.t('onlineSession.action.disconnect.cancelText')}
                    >
                        <a key='delete' className='danger'>{i18next.t('onlineSession.action.disconnect.text')}</a>
                    </Popconfirm>
                </Show>,
            ],
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
                        field: field,
                        order: order,
                        status: 'connected'
                    }
                    let result = await api.getPaging(queryParams);
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
                headerTitle={i18next.t('onlineSession.table.title')}
                toolBarRender={() => []}
            />
            <Drawer
                width={width}
                title={i18next.t('onlineSession.drawer.sqlLogSession.title')}
                placement="right"
                onClose={onClose}
                open={open}>
                <SqlLogSession selectRow={selectRow} open={open} />
            </Drawer>
        </ConfigProvider>
    </Content>);
};

export default OnlineSession;
