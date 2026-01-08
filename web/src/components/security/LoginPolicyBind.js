import { ProTable } from "@ant-design/pro-components";
import { message } from 'antd';
import i18next from 'i18next';
import React, { useEffect, useState } from 'react';
import loginPolicyApi from "../../api/login-policy";
import userApi from "../../api/user";
const actionRef = React.createRef();

const LoginPolicyBind = ({ visible, loginPolicyId }) => {

    let [bindKeys, setBindKeys] = useState([]);

    useEffect(() => {
        const x = async () => {
            let ids = await loginPolicyApi.GetUserIdByLoginPolicyId(loginPolicyId);
            setBindKeys(ids);
        }
        x();
    }, [visible]);

    const handleBind = async (userId) => {
        try {
            const res = await loginPolicyApi.Bind(
                loginPolicyId,
                [{ userId }]
            );

            // 根据你后端的返回结构自行调整
            if (res) {
                message.success(i18next.t('loginPolicyBind.message.success'));

                setBindKeys(prev => [...prev, userId]); // ❗避免直接 push
                actionRef.current?.reload();
            } else {
                message.error(res?.message || i18next.t('loginPolicyBind.message.fail'));
            }
        } catch (error) {
            console.error(error);
            message.error(error);
        }
    }

    const columns = [
        {
            dataIndex: 'index',
            valueType: 'indexBorder',
            width: 48,
        },
        {
            title: i18next.t('loginPolicyBind.column.username'),
            dataIndex: 'username',
            copyable: false,
        },
        {
            title: i18next.t('loginPolicyBind.column.nickname'),
            dataIndex: 'nickname',
            copyable: true,
        },
        {
            title: i18next.t('loginPolicyBind.column.mail'),
            key: 'mail',
            dataIndex: 'mail',
        },
        {
            title: i18next.t('loginPolicyBind.column.created'),
            key: 'created',
            dataIndex: 'created',
            hideInSearch: true,
        },
        {
            title: i18next.t('loginPolicyBind.column.option'),
            valueType: 'option',
            key: 'option',
            render: (text, record, _, action) => [
                <a
                    key="unbind"
                    onClick={() => {
                        handleBind(record['id']);
                    }}
                    disabled={bindKeys.includes(record['id'])}
                >
                    {i18next.t('loginPolicyBind.button.bind')}
                </a>,
            ],
        },
    ];

    return (
        <div>
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

                    let queryParams = {
                        pageIndex: params.current,
                        pageSize: params.pageSize,
                        name: params.name,
                        field: field,
                        order: order
                    }
                    let result = await userApi.getPaging(queryParams);
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
                headerTitle={i18next.t('loginPolicyBind.table.headerTitle')}
            />
        </div>
    );
};

export default LoginPolicyBind;
