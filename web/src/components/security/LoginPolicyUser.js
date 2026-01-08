import { ProTable } from "@ant-design/pro-components";
import { Button, Drawer, Popconfirm } from "antd";
import i18next from 'i18next';
import React, { useState } from 'react';
import loginPolicyApi from "../../api/login-policy";
import Show from "../../dd/fi/show";
import LoginPolicyBind from "./LoginPolicyBind";
const actionRef = React.createRef();

const LoginPolicyUser = ({active, loginPolicyId}) => {

    let [visible, setVisible] = useState(false);

    const handleUnbind = async (userId) => {
        await loginPolicyApi.Unbind(loginPolicyId, [{'userId': userId}]);
        actionRef.current.reload();
    }

    const columns = [
        {
            dataIndex: 'index',
            valueType: 'indexBorder',
            width: 48,
        },
        {
            title: i18next.t('loginPolicyUser.table.title'),
            dataIndex: 'username',
            copyable: true,
        },
        {
            title: i18next.t('loginPolicyUser.column.nickname'),
            dataIndex: 'nickname',
            copyable: true,
        },
        {
            title: i18next.t('loginPolicyUser.column.mail'),
            key: 'mail',
            dataIndex: 'mail',
        },
        {
            title: i18next.t('loginPolicyUser.column.createTime'),
            key: 'created',
            dataIndex: 'created',
            hideInSearch: true,
        },
        {
            title: '操作',
            valueType: 'option',
            key: 'option',
            render: (text, record, _, action) => [
                <Show menu={'login-policy-unbind-user'}>
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
                    {/* <a
                        key="unbind"
                        onClick={() => {
                            handleUnbind(record['id']);
                        }}
                    >
                        {i18next.t('loginPolicyUser.action.unbind')}
                    </a> */}
                </Show>,
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
                    let result = await loginPolicyApi.GetUserPagingByForbiddenCommandId(loginPolicyId, queryParams);
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
                headerTitle={i18next.t('loginPolicyUser.table.title')}
                toolBarRender={() => [
                    <Show menu={'login-policy-bind-user'}>
                        <Button key="button" type="primary" onClick={() => {
                            setVisible(true);
                        }}>
                            {i18next.t('loginPolicyUser.button.bind')}
                        </Button>
                    </Show>,
                ]}
            />

            <Drawer title={i18next.t('loginPolicyUser.drawer.title')}
                    placement="right"
                    width={window.innerWidth * 0.7}
                    onClose={() => {
                        setVisible(false);
                        actionRef.current.reload();
                    }}
                    visible={visible}
            >
                <LoginPolicyBind visible={visible} loginPolicyId={loginPolicyId}/>
            </Drawer>
        </div>
    );
};

export default LoginPolicyUser;
