import { ProTable } from "@ant-design/pro-components";
import { Badge, Button, ConfigProvider, Layout, Popconfirm, Tag, Tooltip } from "antd";
import i18next from 'i18next';
import React, { useEffect, useState } from 'react';
import accessGatewayApi from "../../api/access-gateway";
import localeConfig from '../../common/localeConfig';
import Show from "../../dd/fi/show";
import ColumnState, { useColumnState } from "../../hook/column-state";
import AccessGatewayModal from "./AccessGatewayModal";

const { Content } = Layout;

const api = accessGatewayApi;

const actionRef = React.createRef();

const AccessGateway = () => {
    let [visible, setVisible] = useState(false);
    let [confirmLoading, setConfirmLoading] = useState(false);
    let [selectedRowKey, setSelectedRowKey] = useState(undefined);

    const [columnsStateMap, setColumnsStateMap] = useColumnState(ColumnState.ACCESS_GATEWAY);

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
            title: i18next.t('accessGateway.column.gatewayType'),
            dataIndex: 'gatewayType',
            key: 'gatewayType',
            hideInSearch: true
        },
        {
            title: i18next.t('accessGateway.column.name'),
            dataIndex: 'name',
        },
        {
            title: i18next.t('accessGateway.column.ip'),
            dataIndex: 'ip',
            key: 'ip',
            sorter: true,
            hideInSearch: true
        }, {
            title: i18next.t('accessGateway.column.port'),
            dataIndex: 'port',
            key: 'port',
            hideInSearch: true
        }, {
            title: i18next.t('accessGateway.column.accountType'),
            dataIndex: 'accountType',
            key: 'accountType',
            hideInSearch: true,
            render: (accountType) => {
                if (accountType === 'private-key') {
                    return (
                        <Tag color="green">{i18next.t('accessGateway.tag.privateKey')}</Tag>
                    );
                } else if (accountType === 'password') {
                    return (
                        <Tag color="red">{i18next.t('accessGateway.tag.password')}</Tag>
                    );
                } else {
                    return <>-</>
                }
            }
        }, {
            title: i18next.t('accessGateway.column.username'),
            dataIndex: 'username',
            key: 'username',
            hideInSearch: true
        }, {
            title: i18next.t('accessGateway.column.connected'),
            dataIndex: 'connected',
            key: 'connected',
            hideInSearch: true,
            render: (text, record) => {
                if (text) {
                    return (
                        <Tooltip title={i18next.t('accessGateway.tooltip.connected.success')}>
                            <Badge status="success" text={i18next.t('accessGateway.badge.connected.success')} />
                        </Tooltip>
                    )
                } else {
                    return (
                        <Tooltip title={record['message']}>
                            <Badge status="default" text={i18next.t('accessGateway.badge.connected.default')} />
                        </Tooltip>
                    )
                }
            }
        },
        {
            title: i18next.t('accessGateway.column.created'),
            key: 'created',
            dataIndex: 'created',
            hideInSearch: true,
        },
        {
            title: i18next.t('accessGateway.column.option'),
            valueType: 'option',
            key: 'option',
            render: (text, record, _, action) => [
                <Show menu={'access-gateway-edit'} key={'access-gateway-edit'}>
                    <a
                        key="edit"
                        onClick={() => {
                            setVisible(true);
                            setSelectedRowKey(record['id']);
                        }}
                    >
                        {i18next.t('accessGateway.button.edit')}
                    </a>
                </Show>,
                <Show menu={'access-gateway-del'} key={'access-gateway-del'}>
                    <Popconfirm
                        key={'confirm-delete'}
                        title={i18next.t('accessGateway.popconfirm.delete.title')}
                        onConfirm={async () => {
                            await api.deleteById(record.id);
                            actionRef.current.reload();
                        }}
                        okText={i18next.t('accessGateway.popconfirm.delete.okText')}
                        cancelText={i18next.t('accessGateway.popconfirm.delete.cancelText')}
                    >
                        <a key='delete' className='danger'>{i18next.t('accessGateway.button.delete')}</a>
                    </Popconfirm>
                </Show>,
            ],
        },
    ];

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
                    name: params.name,
                    field: field,
                    order: order
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
            headerTitle={i18next.t('accessGateway.table.title')}
            toolBarRender={() => [
                <Show menu={'access-gateway-add'}>
                    <Button key="button" type="primary" onClick={() => {
                        setVisible(true)
                    }}>
                        {i18next.t('accessGateway.button.create')}
                    </Button>
                </Show>,
            ]}
        />

        <AccessGatewayModal
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
        </ConfigProvider>
    </Content>);
}

export default AccessGateway;
