import { ProTable } from "@ant-design/pro-components";
import { Button, ConfigProvider, Popconfirm, Switch } from "antd";
import i18next from 'i18next';
import React, { useEffect, useState } from 'react';
import { Link } from "react-router-dom";
import authorisedApi from "../../api/authorised";
import localeConfig from '../../common/localeConfig';
import Show from "../../dd/fi/show";
import AssetUserBind from "./AssetUserBind";

const actionRef = React.createRef();

const AssetUser = ({active, id}) => {

    let [visible, setVisible] = useState(false);
    let [confirmLoading, setConfirmLoading] = useState(false);

    useEffect(() => {
        if (active) {
            actionRef.current.reload();
        }
    }, [active]);
    const handleChangeWebhookPushStatus = async (id, checked, index) => {
        await authorisedApi.ChangeWebhookPushStatus(id, checked ? 'enabled' : 'disabled');
        actionRef.current.reload();
    }
    const columns = [
        {
            dataIndex: 'index',
            valueType: 'indexBorder',
            width: 48,
        },
        {
            title: i18next.t('assetUser.column.userName'),
            dataIndex: 'userName',
            render: ((text, record) => {
                return <Link to={`/user/${record['userId']}`}>{text}</Link>
            })
        },
        {
            title: i18next.t('assetUser.column.webhookPushStatus'),
            dataIndex: 'webhookPushStatus',
            key: 'webhookPushStatus',
            hideInSearch: true,
            render: (status, record, index) => {
                return <Switch checkedChildren={i18next.t('assetUser.column.webhookPushStatus.enabled')} unCheckedChildren={i18next.t('assetUser.column.webhookPushStatus.disabled')}
                               checked={status !== 'disabled'}
                               onChange={checked => {
                                   handleChangeWebhookPushStatus(record['id'], checked, index);
                               }}/>
            }
        },
        {
            title: i18next.t('assetUser.column.strategyName'),
            dataIndex: 'strategyName',
            hideInSearch: true,
            render: ((text, record) => {
                return <Link to={`/strategy/${record['strategyId']}`}>{text}</Link>
            })
        },
        {   
            title: i18next.t('assetUser.column.sensitiveCommandGroupName'),
            dataIndex: 'sensitiveCommandGroupName',
            hideInSearch: true,
            render: ((text, record) => {
                return <Link to={`/sensitive-command-group/${record['sensitiveCommandGroupId']}`}>{text}</Link>
            })
        },
        {
            title: i18next.t('assetUser.column.created'),
            key: 'created',
            dataIndex: 'created',
            hideInSearch: true,
        },
        {
            title: i18next.t('assetUser.column.option'),
            valueType: 'option',
            key: 'option',
            render: (text, record, _, action) => [
                <Show menu={'asset-authorised-user-del'} key={'unbind-acc'}>
                     <Popconfirm
                        key={'confirm-delete'}
                        title={i18next.t('sensitiveCommandGroup.delete.confirm.title')}
                        onConfirm={async () => {
                             await authorisedApi.DeleteById(record['id']);
                            actionRef.current.reload();
                        }}
                        okText={i18next.t('sensitiveCommandGroup.delete.confirm.okText')}
                        cancelText={i18next.t('sensitiveCommandGroup.delete.confirm.cancelText')}
                    >
                        <a key='unbind' > {i18next.t('assetUser.action.remove')}</a>
                    </Popconfirm>
                    {/* <a
                        key="unbind"
                        onClick={async () => {
                            await authorisedApi.DeleteById(record['id']);
                            actionRef.current.reload();
                        }}
                    >
                        {i18next.t('assetUser.action.remove')}
                    </a> */}
                </Show>,
            ],
        },
    ];

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

                    let queryParams = {
                        pageIndex: params.current,
                        pageSize: params.pageSize,
                        name: params.name,
                        assetId: id,
                        field: field,
                        order: order
                    }
                    let result = await authorisedApi.GetUserPaging(queryParams);
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
                headerTitle={i18next.t('assetUser.table.title')}
                toolBarRender={() => [
                    <Show menu={'asset-authorised-user-add'} key={'bind-acc'}>
                        <Button key="button" type="primary" onClick={() => {
                            setVisible(true);
                        }}>
                            {i18next.t('assetUser.action.authorize')}
                        </Button>
                    </Show>
                    ,
                ]}
            />

            <AssetUserBind
                id={id}
                visible={visible}
                confirmLoading={confirmLoading}
                handleCancel={() => {
                    setVisible(false);
                }}
                handleOk={async (values) => {
                    setConfirmLoading(true);
                    values['assetId'] = id;
                    try {
                        let success = authorisedApi.AuthorisedUsers(values);
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
    );
};

export default AssetUser;