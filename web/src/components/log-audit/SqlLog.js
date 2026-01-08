import { ProTable } from "@ant-design/pro-components";
import { Button, ConfigProvider, Layout, Modal, Popconfirm, Select, Table, Tag, Tooltip, message } from "antd";
import i18next from 'i18next';
import React, { useEffect, useState } from 'react';
import { useQuery } from "react-query";
import assetApi from "../../api/asset";
import sqlLogApi from "../../api/sql-log";
import userApi from "../../api/user";
import localeConfig from '../../common/localeConfig';
import Show from "../../dd/fi/show";
import ColumnState, { useColumnState } from "../../hook/column-state";
import SimpleCopy from "../../utils/copy";
import { formatDate } from "../../utils/utils";
const api = sqlLogApi;
const { Content } = Layout;

const actionRef = React.createRef();

const SqlLog = () => {

    let [total, setTotal] = useState(0);
    let [selectedRowKeys, setSelectedRowKeys] = useState([]);

    const [columnsStateMap, setColumnsStateMap] = useColumnState(ColumnState.LOGIN_LOG);
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



    const handleCopy = (text) => {
        navigator.clipboard.writeText(text).then(() => {
            message.success(i18next.t('sqlLog.action.copy.success'));
        }).catch(() => {
            message.error(i18next.t('sqlLog.action.copy.failure'));
        });
    };

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
            title: i18next.t('sqlLog.column.owner'),
            dataIndex: 'owner',
            key: 'owner',
            hideInTable: true,
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
        },
        {
            title: i18next.t('sqlLog.column.assetId'),
            dataIndex: 'assetId',
            key: 'assetId',
            hideInTable: true,
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
        },
        {
            title: i18next.t('sqlLog.column.ownerName'),
            dataIndex: 'ownerName',
            key: 'ownerName',
            hideInSearch: true,
        },
        {
            title: i18next.t('sqlLog.column.assetName'),
            dataIndex: 'assetName',
            key: 'assetName',
            hideInSearch: true,
        },
        {
            title: i18next.t('sqlLog.column.state'),
            dataIndex: 'state',
            key: 'state',
            render: text => {
                if (text === '0') {
                    return <Tag color="error">{i18next.t('sqlLog.column.state.failure')}</Tag>
                } else {
                    return <Tag color="success">{i18next.t('sqlLog.column.state.success')}</Tag>
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
                            { label: i18next.t('sqlLog.column.state.failure'), value: '0' },
                            { label: i18next.t('sqlLog.column.state.success'), value: '1' },
                        ]}
                    >

                    </Select>
                );
            },
        }, {
            title: i18next.t('sqlLog.column.sqlCommand'),
            dataIndex: 'sqlCommand',
            key: 'sqlCommand',
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
        }, {
            title: i18next.t('sqlLog.column.reason'),
            dataIndex: 'reason',
            key: 'reason',
            hideInSearch: true,
            width: 400,
        }, {
            title: i18next.t('sqlLog.column.created'),
            dataIndex: 'created',
            key: 'created',
            hideInSearch: true,
            render: (text, record) => {

                return formatDate(text, 'yyyy-MM-dd hh:mm:ss');
            }
        },
        {
            title: i18next.t('sqlLog.column.option'),
            valueType: 'option',
            key: 'option',
            render: (text, record, _, action) => [
                <Show menu={'sql-log-del'} key={'sql-log-del'}>
                    <Popconfirm
                        key={'confirm-delete'}
                        title={i18next.t('sqlLog.action.delete.confirm')}
                        onConfirm={async () => {
                            await api.deleteById(record.id);
                            actionRef.current.reload();
                        }}
                        okText={i18next.t('sqlLog.common.confirm.okText')}
                        cancelText={i18next.t('sqlLog.common.confirm.cancelText')}
                    >
                        <a key='delete' className='danger'>{i18next.t('sqlLog.action.delete')}</a>
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
                            owner: params.owner,
                            assetId: params.assetId,
                            reason: params.reason,
                            sqlCommand: params.sqlCommand,
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
                    headerTitle={i18next.t('sqlLog.table.title')}
                    toolBarRender={() => [
                        <Show menu={'sql-log-del'}>
                            <Button key="delete"
                                danger
                                disabled={selectedRowKeys.length === 0}
                                onClick={async () => {
                                    Modal.confirm({
                                        title: i18next.t('sqlLog.action.delete.selected.confirm'),
                                        content: i18next.t('sqlLog.action.delete.selected.warning'),
                                        okText: i18next.t('sqlLog.common.confirm.okText'),
                                        okType: 'danger',
                                        cancelText: i18next.t('sqlLog.common.confirm.cancelText'),
                                        onOk: async () => {
                                            await api.deleteById(selectedRowKeys.join(","));
                                            actionRef.current.reload();
                                            setSelectedRowKeys([]);
                                        }
                                    });
                                }}>
                                {i18next.t('sqlLog.action.delete')}
                            </Button>
                        </Show>,
                        <Show menu={'sql-log-clear'}>
                            <Button key="clear"
                                type="primary"
                                danger
                                disabled={total === 0}
                                onClick={async () => {
                                    Modal.confirm({
                                        title: i18next.t('sqlLog.action.clear.confirm'),
                                        content: i18next.t('sqlLog.action.clear.warning'),
                                        okText: i18next.t('sqlLog.common.confirm.okText'),
                                        okType: 'danger',
                                        cancelText: i18next.t('sqlLog.common.confirm.cancelText'),
                                        onOk: async () => {
                                            await api.Clear();
                                            actionRef.current.reload();
                                        }
                                    });
                                }}>
                                {i18next.t('sqlLog.action.clear')}
                            </Button>
                        </Show>,
                    ]}
                />
            </Content>
        </ConfigProvider>
    );
}

export default SqlLog;
