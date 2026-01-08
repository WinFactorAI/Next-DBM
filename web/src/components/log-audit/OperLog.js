import { ProTable } from "@ant-design/pro-components";
import { Button, ConfigProvider, Layout, Modal, Popconfirm, Table, Tag } from "antd";
import i18next from "i18next";
import React, { useEffect, useState } from 'react';
import operLogApi from "../../api/oper-log";
import localeConfig from '../../common/localeConfig';
import Show from "../../dd/fi/show";
import ColumnState, { useColumnState } from "../../hook/column-state";
import { formatDate } from "../../utils/utils";
const api = operLogApi;
const { Content } = Layout;

const actionRef = React.createRef();

const OperLog = () => {

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
            title: i18next.t('operLog.column.username'),
            dataIndex: 'username',
            key: 'username'
        },
        {
            title: 'IP',
            dataIndex: 'clientIp',
            key: 'clientIp',
        },
        {
            title: i18next.t('operLog.column.name'),
            dataIndex: 'name',
            key: 'name'
        },
        {
            title: i18next.t('operLog.column.method'),
            dataIndex: 'method',
            key: 'method',
            hideInSearch: true,
        },
        {
            title: i18next.t('operLog.column.state'),
            dataIndex: 'statusCode',
            key: 'statusCode',
            hideInSearch: true,
            render: text => {
                if (text === 1) {
                    return <Tag color="success">
                        {i18next.t('operLog.column.state.success')}
                    </Tag>
                } else {
                    return <Tag color="error">
                        {i18next.t('operLog.column.state.failure')}
                    </Tag>
                }
            }
        },
        {
            title: i18next.t('operLog.column.path'),
            dataIndex: 'path',
            key: 'path'
        },
        {
            title: i18next.t('operLog.column.userAgent'),
            dataIndex: 'userAgent',
            key: 'userAgent',
            hideInSearch: true,
        },
        {
            title: i18next.t('operLog.column.reason'),
            dataIndex: 'reason',
            key: 'reason',
            hideInSearch: true,
        }, {
            title: i18next.t('operLog.column.created'),
            dataIndex: 'created',
            key: 'created',
            hideInSearch: true,
            render: (text, record) => {
                return formatDate(text, 'yyyy-MM-dd hh:mm:ss');
            }
        },
        {
            title: i18next.t('operLog.column.option'),
            valueType: 'option',
            key: 'option',
            render: (text, record, _, action) => [
                <Show menu={'oper-log-del'} key={'oper-log-del'}>
                    <Popconfirm
                        key={'confirm-delete'}
                        title={i18next.t('operLog.action.delete.confirm')}
                        onConfirm={async () => {
                            await api.deleteById(record.id);
                            actionRef.current.reload();
                        }}
                        okText={i18next.t('operLog.common.confirm.okText')}
                        cancelText={i18next.t('operLog.common.confirm.cancelText')}
                    >
                        <a key='delete' className='danger'>
                            {i18next.t('operLog.action.delete')}
                        </a>
                    </Popconfirm>
                </Show>,
            ],
        },
    ];

    return (
        <ConfigProvider  locale={locale} >
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
                            path: params.path,
                            name: params.name,
                            method: params.method,
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
                    headerTitle={i18next.t('operLog.table.title')}
                    toolBarRender={() => [
                        <Show menu={'oper-log-del'}>
                            <Button key="delete"
                                danger
                                disabled={selectedRowKeys.length === 0}
                                onClick={async () => {
                                    Modal.confirm({
                                        title: i18next.t('operLog.action.delete.selected.confirm'),
                                        content: i18next.t('operLog.action.delete.selected.warning'),
                                        okText: i18next.t('operLog.common.confirm.okText'),
                                        okType: 'danger',
                                        cancelText: i18next.t('operLog.common.confirm.cancelText'),
                                        onOk: async () => {
                                            await api.deleteById(selectedRowKeys.join(","));
                                            actionRef.current.reload();
                                            setSelectedRowKeys([]);
                                        }
                                    });
                                }}>
                                {i18next.t('operLog.action.delete')}
                            </Button>
                        </Show>,
                        <Show menu={'oper-log-clear'}>
                            <Button key="clear"
                                type="primary"
                                danger
                                disabled={total === 0}
                                onClick={async () => {
                                    Modal.confirm({
                                        title: i18next.t('operLog.action.clear.confirm'),
                                        content: i18next.t('operLog.action.clear.warning'),
                                        okText: i18next.t('operLog.common.confirm.okText'),
                                        okType: 'danger',
                                        cancelText: i18next.t('operLog.common.confirm.cancelText'),
                                        onOk: async () => {
                                            await api.Clear();
                                            actionRef.current.reload();
                                        }
                                    });
                                }}>
                                {i18next.t('operLog.action.clear')}
                            </Button>
                        </Show>,
                    ]}
                />
            </Content>
        </ConfigProvider>
    );
}

export default OperLog;
