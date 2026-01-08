import { ProTable } from "@ant-design/pro-components";
import { Button, ConfigProvider, Layout, Modal, Popconfirm, Table, Tag, Tooltip } from "antd";
import i18next from "i18next";
import React, { useEffect, useState } from 'react';
import webhookPushLogApi from "../../api/webhook-push-log";
import localeConfig from '../../common/localeConfig';
import Show from "../../dd/fi/show";
import ColumnState, { useColumnState } from "../../hook/column-state";
import SimpleCopy from "../../utils/copy";
import { formatDate } from "../../utils/utils";
const api = webhookPushLogApi;
const { Content } = Layout;
const actionRef = React.createRef();

const WebhookLog = () => {

    let [total, setTotal] = useState(0);
    let [selectedRowKeys, setSelectedRowKeys] = useState([]);

    const [columnsStateMap, setColumnsStateMap] = useColumnState(ColumnState.LOGIN_LOG);

    const serviceTypeOptions = [
        {
            label: '构建',
            value: 'build',
        },
        {
            label: '资产',
            value: 'asset',
        },
        {
            label: '敏感',
            value: 'sensitive',
        },
        {
            label: '触发器',
            value: 'trigger',
        },
    ];
    const actionsOptionsMap = {
        'build': [
            { label: '构建开始', value: 'build_start' },
            { label: '构建完成', value: 'build_complete' },
            { label: '构建失败', value: 'build_fail' },
        ],
        'asset': [
            { label: '资产接入', value: 'asset_intro' },
            { label: '资产断开', value: 'asset_outro' },
        ],
        'sensitive': [
            { label: '敏感发现', value: 'sensitive_found' },
        ],
        'trigger': [
            { label: '触发器执行', value: 'trigger_run' },
        ],

    }
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
        },
        {
            title: i18next.t('webhookPushLog.column.name'),
            dataIndex: 'name',
            key: 'name'
        },
        {
            title: i18next.t('webhookPushLog.column.content'),
            dataIndex: 'content',
            key: 'content',
            width: 400,
            render: (text) => (
                <Tooltip title={
                    <div className='tooltipBox'>
                        <div>{text}</div>
                        <SimpleCopy text={text} isShow={false} className="tooltipBox-btn-box"></SimpleCopy>
                    </div>}>
                    <div style={{
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        width: 400 // 确保每个单元格有足够的宽度
                    }}>
                        {text}
                    </div>
                </Tooltip>
            ),
        },
        {
            title: i18next.t('webhook.column.serviceType'),
            dataIndex: 'serviceType',
            key: 'serviceType',
            hideInSearch: true,
            render: (text, record) => (
                serviceTypeOptions.find(item => item.value === text)?.label
            ),
        },
        {
            title: i18next.t('webhook.column.actions'),
            dataIndex: 'actions',
            key: 'actions',
            hideInSearch: true,
            render: (text, record) => (
                record.actions.split(',').map(action => {
                    return actionsOptionsMap[record.serviceType]?.find(item => item.value === action)?.label
                }).filter(label => label !== undefined).join(', ')
            ),
        },
        {
            title: i18next.t('webhookPushLog.column.state'),
            dataIndex: 'status',
            key: 'status',
            hideInSearch: true,
            render: text => {
                if (text === "success") {
                    return <Tag color="success">
                        {i18next.t('webhookPushLog.column.state.success')}
                    </Tag>
                } else {
                    return <Tag color="error">
                        {i18next.t('webhookPushLog.column.state.failure')}
                    </Tag>
                }
            }
        },
        {
            title: i18next.t('webhookPushLog.column.webhook'),
            dataIndex: 'webhook',
            key: 'webhook',
            width: 400,
            render: (text) => (
                <Tooltip title={
                    <div className='tooltipBox'>
                        <div>{text}</div>
                        <SimpleCopy text={text} isShow={false} className="tooltipBox-btn-box"></SimpleCopy>
                    </div>}>
                    <div style={{
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        width: 400 // 确保每个单元格有足够的宽度
                    }}>
                        {text}
                    </div>
                </Tooltip>
            ),
        },
        {
            title: i18next.t('webhookPushLog.column.response'),
            dataIndex: 'response',
            key: 'response',
            hideInSearch: true,
        }, {
            title: i18next.t('webhookPushLog.column.created'),
            dataIndex: 'created',
            key: 'created',
            hideInSearch: true,
            render: (text, record) => {
                return formatDate(text, 'yyyy-MM-dd hh:mm:ss');
            }
        },
        {
            title: i18next.t('webhookPushLog.column.option'),
            valueType: 'option',
            key: 'option',
            render: (text, record, _, action) => [
                <Show menu={'webhook-push-log-del'} key={'webhook-push-log-del'}>
                    <Popconfirm
                        key={'confirm-delete'}
                        title={i18next.t('webhookPushLog.action.delete.confirm')}
                        onConfirm={async () => {
                            await api.deleteById(record.id);
                            actionRef.current.reload();
                        }}
                        okText={i18next.t('webhookPushLog.common.confirm.okText')}
                        cancelText={i18next.t('webhookPushLog.common.confirm.cancelText')}
                    >
                        <a key='delete' className='danger'>
                            {i18next.t('webhookPushLog.action.delete')}
                        </a>
                    </Popconfirm>
                </Show>,
            ],
        },
    ];

    return (
        <ConfigProvider locale={locale}  >
            <Content className="page-container">
                <ProTable
                    scroll={{ x: 'max-content' }}
                    columns={columns}
                    actionRef={actionRef}
                    columnsState={{
                        value: columnsStateMap,
                        onChange: setColumnsStateMap
                    }}
                    rowSelection={{
                        selections: [Table.SELECTION_ALL, Table.SELECTION_INVERT],
                        selectedRowKeys: selectedRowKeys,
                        onChange: (keys) => {
                            setSelectedRowKeys(keys);
                        }
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
                            username: params.username,
                            clientIp: params.clientIp,
                            name: params.name,
                            content: params.content,
                            webhook: params.webhook,
                            state: params.state,
                            field: field,
                            order: order
                        }
                        let result = await api.getPaging(queryParams);
                        setTotal(result['total']);
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
                        showSizeChanger: true
                    }}
                    dateFormatter="string"
                    headerTitle={i18next.t('webhookPushLog.table.title')}
                    toolBarRender={() => [
                        <Show menu={'webhook-push-log-del'}>
                            <Button key="delete"
                                danger
                                disabled={selectedRowKeys.length === 0}
                                onClick={async () => {
                                    Modal.confirm({
                                        title: i18next.t('webhookPushLog.action.delete.selected.confirm'),
                                        content: i18next.t('webhookPushLog.action.delete.selected.warning'),
                                        okText: i18next.t('webhookPushLog.common.confirm.okText'),
                                        okType: 'danger',
                                        cancelText: i18next.t('webhookPushLog.common.confirm.cancelText'),
                                        onOk: async () => {
                                            await api.deleteById(selectedRowKeys.join(","));
                                            actionRef.current.reload();
                                            setSelectedRowKeys([]);
                                        }
                                    });
                                }}>
                                {i18next.t('webhookPushLog.action.delete')}
                            </Button>
                        </Show>,
                        <Show menu={'webhook-push-log-clear'}>
                            <Button key="clear"
                                type="primary"
                                danger
                                disabled={total === 0}
                                onClick={async () => {
                                    Modal.confirm({
                                        title: i18next.t('webhookPushLog.action.clear.confirm'),
                                        content: i18next.t('webhookPushLog.action.clear.warning'),
                                        okText: i18next.t('webhookPushLog.common.confirm.okText'),
                                        okType: 'danger',
                                        cancelText: i18next.t('webhookPushLog.common.confirm.cancelText'),
                                        onOk: async () => {
                                            await api.Clear();
                                            actionRef.current.reload();
                                        }
                                    });
                                }}>
                                {i18next.t('webhookPushLog.action.clear')}
                            </Button>
                        </Show>,
                    ]}
                />
            </Content>
        </ConfigProvider>
    );
}

export default WebhookLog;
