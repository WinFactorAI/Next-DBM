import i18next from 'i18next';
import React, { useEffect, useState } from 'react';
import localeConfig from '../../common/localeConfig';

import { ProTable } from "@ant-design/pro-components";
import { Button, ConfigProvider, Layout, Popconfirm, Tag } from "antd";
import securityApi from "../../api/security";
import Show from "../../dd/fi/show";
import ColumnState, { useColumnState } from "../../hook/column-state";
import SecurityModal from "./SecurityModal";

const api = securityApi;

const {Content} = Layout;

const actionRef = React.createRef();

const Security = () => {
    let [visible, setVisible] = useState(false);
    let [confirmLoading, setConfirmLoading] = useState(false);
    let [selectedRowKey, setSelectedRowKey] = useState(undefined);

    const [columnsStateMap, setColumnsStateMap] = useColumnState(ColumnState.ACCESS_SECURITY);

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
            title: i18next.t('security.column.ip'),
            dataIndex: 'ip',
            key: 'ip',
            sorter: true,
        }, {
            title: i18next.t('security.column.rule'),
            dataIndex: 'rule',
            key: 'rule',
            hideInSearch: true,
            render: (rule) => {
                if (rule === 'allow') {
                    return <Tag color={'green'}>{i18next.t('security.column.rule.allow')}</Tag>
                } else {
                    return <Tag color={'red'}>{i18next.t('security.column.rule.deny')}</Tag>
                }
            }
        }, {
            title: i18next.t('security.column.priority'),
            dataIndex: 'priority',
            key: 'priority',
            sorter: true,
            hideInSearch: true,
        }, {
            title: i18next.t('security.column.source'),
            dataIndex: 'source',
            key: 'source',
            hideInSearch: true,
        },
        {
            title: i18next.t('security.column.action'),
            valueType: 'option',
            key: 'option',
            render: (text, record, _, action) => [
                <Show menu={'access-security-edit'} key={'access-security-edit'}>
                    <a
                        key="edit"
                        onClick={() => {
                            setVisible(true);
                            setSelectedRowKey(record['id']);
                        }}
                    >
                        {i18next.t('security.action.edit')}
                    </a>
                </Show>,
                <Show menu={'access-security-del'} key={'access-security-del'}>
                    <Popconfirm
                        key={'confirm-delete'}
                        title={i18next.t('security.delete.confirm.title')}
                        onConfirm={async () => {
                            await api.deleteById(record.id);
                            actionRef.current.reload();
                        }}
                        okText={i18next.t('security.delete.confirm.okText')}
                        cancelText={i18next.t('security.delete.confirm.cancelText')}
                    >
                        <a key='delete' className='danger'>{i18next.t('security.action.delete')}</a>
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
                        pageSize: 10,
                    }}
                    dateFormatter="string"
                    headerTitle={i18next.t('security.table.title')}
                    toolBarRender={() => [
                        <Show menu={'access-security-add'}>
                            <Button key="button" type="primary" onClick={() => {
                                setVisible(true)
                            }}>
                                {i18next.t('security.modal.button.new')}
                            </Button>
                        </Show>,
                    ]}
                />

                <SecurityModal
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
            </Content>
        </ConfigProvider>
    );
}

export default Security;
