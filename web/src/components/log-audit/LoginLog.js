import { ProTable } from "@ant-design/pro-components";
import { Button, ConfigProvider, Layout, Modal, Popconfirm, Select, Table, Tag, Tooltip } from "antd";
import i18next from 'i18next';
import React, { useEffect, useState } from 'react';
import loginLogApi from "../../api/login-log";
import localeConfig from '../../common/localeConfig';
import Show from "../../dd/fi/show";
import ColumnState, { useColumnState } from "../../hook/column-state";
import { formatDate, isEmpty } from "../../utils/utils";

const api = loginLogApi;
const { Content } = Layout;

const actionRef = React.createRef();

const LoginLog = () => {

    let [total, setTotal] = useState(0);
    let [selectedRowKeys, setSelectedRowKeys] = useState([]);

    const [columnsStateMap, setColumnsStateMap] = useColumnState(ColumnState.LOGIN_LOG);
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
            title: i18next.t('loginLog.column.username'),
            dataIndex: 'username',
            key: 'username'
        },
        {
            title: i18next.t('loginLog.column.clientIp'),
            dataIndex: 'clientIp',
            key: 'clientIp'
        }, {
            title: i18next.t('loginLog.column.state'),
            dataIndex: 'state',
            key: 'state',
            render: text => {
                if (text === '0') {
                    return <Tag color="error">{i18next.t('loginLog.column.state.tag.error')}</Tag>
                } else {
                    return <Tag color="success">{i18next.t('loginLog.column.state.tag.success')}</Tag>
                }
            },
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
                        options={[
                            { label: i18next.t('loginLog.column.state.tag.error'), value: '0' },
                            { label: i18next.t('loginLog.column.state.tag.success'), value: '1' },
                        ]}
                    >

                    </Select>
                );
            },
        }, {
            title: i18next.t('loginLog.column.reason'),
            dataIndex: 'reason',
            key: 'reason',
            hideInSearch: true,
        }, {
            title: i18next.t('loginLog.column.clientUserAgent'),
            dataIndex: 'clientUserAgent',
            key: 'clientUserAgent',
            hideInSearch: true,
            render: (text, record) => {
                if (isEmpty(text)) {
                    return i18next.t('loginLog.column.clientUserAgent.unknown');
                }
                return (
                    <Tooltip placement="topLeft" title={text}>
                        {text.split(' ')[0]}
                    </Tooltip>
                )
            }
        }, {
            title: i18next.t('loginLog.column.loginTime'),
            dataIndex: 'loginTime',
            key: 'loginTime',
            hideInSearch: true,
            render: (text, record) => {

                return formatDate(text, 'yyyy-MM-dd hh:mm:ss');
            }
        }, {
            title: i18next.t('loginLog.column.logoutTime'),
            dataIndex: 'logoutTime',
            key: 'logoutTime',
            hideInSearch: true,
            render: (text, record) => {
                if (isEmpty(text) || text === '0001-01-01 00:00:00') {
                    return '';
                }
                return text;
            }
        },
        {
            title: i18next.t('loginLog.column.option'),
            valueType: 'option',
            key: 'option',
            render: (text, record, _, action) => [
                <Show menu={'login-log-del'} key={'login-log-del'}>
                    <Popconfirm
                        key={'confirm-delete'}
                        title={i18next.t('loginLog.action.delete.confirm.title')}
                        onConfirm={async () => {
                            await api.deleteById(record.id);
                            actionRef.current.reload();
                        }}
                        okText={i18next.t('loginLog.action.delete.confirm.okText')}
                        cancelText={i18next.t('loginLog.action.delete.confirm.cancelText')}
                    >
                        <a key='delete' className='danger'>{i18next.t('loginLog.action.delete')}</a>
                    </Popconfirm>
                </Show>,
            ],
        },
    ];

    return (
        <ConfigProvider locale={locale}>
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
                    headerTitle={i18next.t('loginLog.table.title')}
                    toolBarRender={() => [
                        <Show menu={'login-log-del'}>
                            <Button key="delete"
                                danger
                                disabled={selectedRowKeys.length === 0}
                                onClick={async () => {
                                    Modal.confirm({
                                        title: i18next.t('loginLog.action.batchDelete.confirm.title'),
                                        content: i18next.t('loginLog.action.batchDelete.confirm.content'),
                                        okText: i18next.t('loginLog.action.batchDelete.confirm.okText'),
                                        okType: 'danger',
                                        cancelText: i18next.t('loginLog.action.batchDelete.confirm.cancelText'),
                                        onOk: async () => {
                                            await api.deleteById(selectedRowKeys.join(","));
                                            actionRef.current.reload();
                                            setSelectedRowKeys([]);
                                        }
                                    });
                                }}>
                                {i18next.t('loginLog.action.delete')}
                            </Button>
                        </Show>,
                        <Show menu={'login-log-clear'}>
                            <Button key="clear"
                                type="primary"
                                danger
                                disabled={total === 0}
                                onClick={async () => {
                                    Modal.confirm({
                                        title: i18next.t('loginLog.action.clear.confirm.title'),
                                        content: i18next.t('loginLog.action.clear.confirm.content'),
                                        okText: i18next.t('loginLog.action.clear.confirm.okText'),
                                        okType: 'danger',
                                        cancelText: i18next.t('loginLog.action.clear.confirm.cancelText'),
                                        onOk: async () => {
                                            await api.Clear();
                                            actionRef.current.reload();
                                        }
                                    });
                                }}>
                                {i18next.t('loginLog.action.clear')}
                            </Button>
                        </Show>,
                    ]}
                />
            </Content>
        </ConfigProvider>
    );
}

export default LoginLog;
