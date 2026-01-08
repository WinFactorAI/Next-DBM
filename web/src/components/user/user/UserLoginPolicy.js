import { ProTable } from '@ant-design/pro-components';
import { ConfigProvider, Popconfirm } from "antd";
import i18next from 'i18next';
import React, { useEffect, useState } from 'react';
import { Link } from "react-router-dom";
import loginPolicyApi from "../../../api/login-policy";
import localeConfig from '../../../common/localeConfig';
const actionRef = React.createRef();
const UserLoginPolicy = ({ active, userId }) => {

    useEffect(() => {
        if (active) {
            actionRef.current.reload();
        }
    }, [active]);

    const handleUnbind = async (loginPolicyId) => {
        await loginPolicyApi.Unbind(loginPolicyId, [{ 'userId': userId }]);
        actionRef.current.reload();
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
            title: i18next.t('userLoginPolicy.column.name'),
            dataIndex: 'name',
            render: (text, record) => {
                return <Link to={`/login-policy/${record['id']}`}>{text}</Link>;
            },
        },
        {
            title: i18next.t('userLoginPolicy.column.priority'),
            key: 'priority',
            dataIndex: 'priority',
            sorter: true,
            hideInSearch: true,
        },
        {
            title: i18next.t('userLoginPolicy.column.rule'),
            key: 'rule',
            dataIndex: 'rule',
            hideInSearch: true,
            render: (text => {
                if (text === 'allow') {
                    return i18next.t('userLoginPolicy.column.rule.allow');
                } else {
                    return i18next.t('userLoginPolicy.column.rule.deny');
                }
            })
        },
        {
            title: i18next.t('userLoginPolicy.column.option'),
            valueType: 'option',
            key: 'option',
            render: (text, record, _, action) => [
                <Popconfirm
                    key={'confirm-delete'}
                    title={i18next.t('loginPolicy.delete.confirm.title')}
                    onConfirm={async () => {
                        handleUnbind(record['id']);
                    }}
                    okText={i18next.t('loginPolicy.delete.confirm.okText')}
                    cancelText={i18next.t('loginPolicy.delete.confirm.cancelText')}
                >
                    <a key='delete' className='danger'> {i18next.t('loginPolicyUser.action.unbind')}</a>
                </Popconfirm>
                // <a
                //     key="edit"
                //     onClick={() => {
                //         handleUnbind(record['id']);
                //     }}
                // >
                //     {i18next.t('userLoginPolicy.option.unbind')}
                // </a>,
            ],
        },
    ];

    return (
        <ConfigProvider locale={locale}>
            <ProTable
                scroll={{ x: 'max-content' }}
                columns={columns}
                actionRef={actionRef}
                request={async (params = {}, sort, filter) => {

                    let field = '';
                    let order = '';
                    if (Object.keys(sort).length > 0) {
                        field = Object.keys(sort)[0];
                        order = Object.values(sort)[0];
                    }
                    if (!userId) {
                        return {
                            data: [],
                            success: true,
                            total: 0
                        };
                    }

                    let queryParams = {
                        pageIndex: params.current,
                        pageSize: params.pageSize,
                        name: params.name,
                        userId: userId,
                        field: field,
                        order: order
                    }
                    let result = await loginPolicyApi.getPaging(queryParams);
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
                headerTitle={i18next.t('userLoginPolicy.table.title')}
                toolBarRender={() => [

                ]}
            />
        </ConfigProvider>
    );
};

export default UserLoginPolicy;
