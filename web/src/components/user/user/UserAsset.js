import { ProTable } from "@ant-design/pro-components";
import { Button, ConfigProvider, message } from "antd";
import i18next from 'i18next';
import React, { useEffect, useState } from 'react';
import { Link } from "react-router-dom";
import authorisedApi from "../../../api/authorised";
import localeConfig from '../../../common/localeConfig';
import Show from "../../../dd/fi/show";
import ProxyInfoModal from "../../asset/ProxyInfoModal";
import UserAuthorised from "./UserAuthorised";
const actionRef = React.createRef();
const UserAsset = ({active, id, type}) => {
    let [visible, setVisible] = useState(false);
    let [proxyInfoVisible , setProxyInfoVisible] = useState(false);
    let [confirmLoading, setConfirmLoading] = useState(false);
    let [selectedRowKey, setSelectedRowKey] = useState(undefined);
    useEffect(() => {
        if (active) {
            actionRef.current.reload();
        }
    }, [active]);
    const handleCopy = (text) => {
        navigator.clipboard.writeText(text).then(() => {
            message.success('复制成功！');
        }).catch(() => {
            message.error('复制失败，请重试。');
        });
    };
 
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
            title: i18next.t('userAsset.column.assetName'),
            dataIndex: 'assetName',
            render: ((text, record) => {
                return <Link to={`/asset/${record['assetId']}`}>{text}</Link>
            })
        },
        {
            title: i18next.t('userAsset.column.strategyName'),
            dataIndex: 'strategyName',
            hideInSearch: true,
            render: ((text, record) => {
                return <Link to={`/strategy/${record['strategyId']}`}>{text}</Link>
            })
        },
        {	
            title: i18next.t('userAsset.column.sensitiveCommandGroupName'),
            dataIndex: 'sensitiveCommandGroupName',
            hideInSearch: true,
            render: ((text, record) => {
                return <Link to={`/sensitive-command-group/${record['sensitiveCommandGroupId']}?activeKey=info`}>{text}</Link>
            })
        },
        {
            title: i18next.t('userAsset.column.created'),
            key: 'created',
            dataIndex: 'created',
            hideInSearch: true,
        },
        {
            title: i18next.t('userAsset.column.option'),
            valueType: 'option',
            key: 'option',
            width: 200,
            render: (text, record, _, action) => [
                <Show menu={['user-proxy-asset', 'user-group-proxy-asset']}>
                    <a
                        key="proxy"
                        onClick={async () => {
                            setProxyInfoVisible(true);
                            setSelectedRowKey(record['assetId']);
                        }}
                    >
                        {i18next.t('userAsset.button.proxy')}
                    </a>
                </Show>,
                <Show menu={['user-unbind-asset', 'user-group-unbind-asset']}>
                    <a
                        key="unbind"
                        onClick={async () => {
                            await authorisedApi.DeleteById(record['id']);
                            actionRef.current.reload();
                        }}
                    >
                        {i18next.t('userAsset.button.unbind')}
                    </a>
                </Show>
                ,
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

                    let queryParams = {
                        pageIndex: params.current,
                        pageSize: params.pageSize,
                        name: params.name,
                        field: field,
                        order: order
                    }
                    queryParams[type] = id;
                    let result = await authorisedApi.GetAssetPaging(queryParams);
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
                headerTitle={i18next.t('userAsset.table.title')}
                toolBarRender={() => [
                    <Show menu={['user-bind-asset', 'user-group-bind-asset']}>
                        <Button key="button" type="primary" onClick={() => {
                            setVisible(true);
                        }}>
                            {i18next.t('userAsset.button.authorize')}
                        </Button>
                    </Show>,
                ]}
            />
            <ProxyInfoModal
                id={selectedRowKey}
                userId={id}
                type="manager"
                visible={proxyInfoVisible}
                handleOk={() => {
                    setProxyInfoVisible(false);
                }}
            />
            <UserAuthorised
                type={type}
                id={id}
                visible={visible}
                confirmLoading={confirmLoading}
                handleCancel={() => {
                    setVisible(false);
                }}
                handleOk={async (values) => {
                    setConfirmLoading(true);
                    values[type] = id;
                    try {
                        let success = authorisedApi.AuthorisedAssets(values);
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

export default UserAsset;


