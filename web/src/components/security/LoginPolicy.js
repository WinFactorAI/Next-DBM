import { ProTable } from "@ant-design/pro-components";
import { Button, ConfigProvider, Layout, Popconfirm } from "antd";
import i18next from 'i18next';
import React, { useEffect, useState } from 'react';
import { Link } from "react-router-dom";
import loginPolicyApi from "../../api/login-policy";
import localeConfig from '../../common/localeConfig';
import Show from "../../dd/fi/show";
import ColumnState, { useColumnState } from "../../hook/column-state";
import { hasMenu } from "../../service/permission";
import LoginPolicyModal from "./LoginPolicyModal";

const api = loginPolicyApi;
const {Content} = Layout;

const actionRef = React.createRef();

const LoginPolicy = () => {

    let [visible, setVisible] = useState(false);
    let [confirmLoading, setConfirmLoading] = useState(false);
    let [selectedRowKey, setSelectedRowKey] = useState(undefined);

    const [columnsStateMap, setColumnsStateMap] = useColumnState(ColumnState.LOGIN_POLICY);

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
            title: i18next.t('loginPolicy.column.name'),
            dataIndex: 'name',
            render: (text, record) => {
                let view = <div>{text}</div>;
                if(hasMenu('login-policy-detail')){
                    view = <Link to={`/login-policy/${record['id']}`}>{text}</Link>;
                }
                return view;
            },
        },
        {
            title: i18next.t('loginPolicy.column.priority'),
            key: 'priority',
            dataIndex: 'priority',
            sorter: true,
            hideInSearch: true,
        },
        {
            title: i18next.t('loginPolicy.column.rule'),
            key: 'rule',
            dataIndex: 'rule',
            hideInSearch: true,
            render: (text => {
                if (text === 'allow') {
                    return i18next.t('loginPolicy.column.rule.allow');
                } else {
                    return i18next.t('loginPolicy.column.rule.deny');
                }
            })
        },
        {
            title: i18next.t('loginPolicy.column.action'),
            valueType: 'option',
            key: 'option',
            render: (text, record, _, action) => [
                <Show menu={'login-policy-detail'} key={'login-policy-detail'}>
                    <Link to={`/login-policy/${record['id']}?activeKey=bind-user`}>{i18next.t('loginPolicyUser.drawer.title')}</Link>
                </Show>,
                <Show menu={'login-policy-edit'} key={'login-policy-edit'}>
                    <a
                        key="edit"
                        onClick={() => {
                            setVisible(true);
                            setSelectedRowKey(record['id']);
                        }}
                    >
                        {i18next.t('loginPolicy.action.edit')}
                    </a>
                </Show>,
                <Show menu={'login-policy-del'} key={'login-policy-del'}>
                    <Popconfirm
                        key={'confirm-delete'}
                        title={i18next.t('loginPolicy.delete.confirm.title')}
                        onConfirm={async () => {
                            await api.deleteById(record.id);
                            actionRef.current.reload();
                        }}
                        okText={i18next.t('loginPolicy.delete.confirm.okText')}
                        cancelText={i18next.t('loginPolicy.delete.confirm.cancelText')}
                    >
                        <a key='delete' className='danger'>{i18next.t('loginPolicy.action.delete')}</a>
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
                    headerTitle={i18next.t('loginPolicy.table.title')}
                    toolBarRender={() => [
                        <Show menu={'login-policy-add'}>
                            <Button key="button" type="primary" onClick={() => {
                                setVisible(true)
                            }}>
                                {i18next.t('loginPolicy.button.add')}
                            </Button>
                        </Show>,
                    ]}
                />

                <LoginPolicyModal
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

export default LoginPolicy;
