import { ProTable } from "@ant-design/pro-components";
import { ConfigProvider, Layout, message, Popconfirm } from "antd";
import i18next from 'i18next';
import React, { useEffect, useState } from 'react';
import SqlsApi from "../../api/sqls";
import localeConfig from '../../common/localeConfig';
import Show from "../../dd/fi/show";
import ColumnState, { useColumnState } from "../../hook/column-state";
import ChangeOwner from "./ChangeOwner";
import SelectingAsset from "./SelectingAsset";
import SqlsManagerModal from "./SqlsModal";
const {Content} = Layout;
const api = SqlsApi;
const actionRef = React.createRef();

const Sqls = () => {
    let [assetVisible, setAssetVisible] = useState(false);

    let [visible, setVisible] = useState(false);
    let [confirmLoading, setConfirmLoading] = useState(false);
    let [selectedRowKey, setSelectedRowKey] = useState(undefined);

    const [columnsStateMap, setColumnsStateMap] = useColumnState(ColumnState.CREDENTIAL);

    let [selectedRow, setSelectedRow] = useState(undefined);
    let [changeOwnerVisible, setChangeOwnerVisible] = useState(false);

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
            title: i18next.t('sqls.column.assetName'),
            dataIndex: 'assetName',
            key: 'assetName',
            hideInSearch: true
        },
        {
            title: i18next.t('sqls.column.dbName'),
            dataIndex: 'dbName',
            key: 'dbName',
        }, 
        {
            title: i18next.t('sqls.column.name'),
            dataIndex: 'name',
            key: 'name',
        }, 
        {
            title: i18next.t('sqls.column.ownerName'),
            dataIndex: 'ownerName',
            key: 'ownerName',
            hideInSearch: true
        },
        {
            title: i18next.t('sqls.column.created'),
            key: 'created',
            dataIndex: 'created',
            hideInSearch: true,
        },
        {
            title: i18next.t('sqls.column.operation'),
            valueType: 'option',
            key: 'option',
            render: (text, record, _, action) => [
                <Show menu={'command-edit'} key={'command-edit'}>
                    <a
                        key="view"
                        onClick={() => {
                            setVisible(true);
                            setSelectedRowKey(record['id']);
                        }}
                    >
                        {i18next.t('sqls.action.view')}
                    </a>
                </Show>,
                <Show menu={'command-change-owner'} key={'command-change-owner'}>
                    <a
                        key="change-owner"
                        onClick={() => {
                            handleChangeOwner(record);
                        }}
                    >
                        {i18next.t('sqls.action.changeOwner')}
                    </a>
                </Show>,
                <Show menu={'command-del'} key={'command-del'}>
                    <Popconfirm
                        key={'confirm-delete'}
                        title={i18next.t('sqls.confirm.delete.title')}
                        onConfirm={async () => {
                            await api.deleteById(record.id);
                            actionRef.current.reload();
                        }}
                        okText={i18next.t('sqls.confirm.delete.okText')}
                        cancelText={i18next.t('sqls.confirm.delete.cancelText')}
                    >
                        <a key='delete' className='danger'>{i18next.t('sqls.action.delete')}</a>
                    </Popconfirm>
                </Show>,
            ],
        },
    ];

    const handleChangeOwner = (row) => {
        setSelectedRow(row);
        setChangeOwnerVisible(true);
    }

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
                    dbName: params.dbName,
                    assetName: params.assetName,
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
            headerTitle={i18next.t('sqls.table.title')}
            toolBarRender={() => [
                // <Show menu={'command-add'}>
                //     <Button key="button" type="primary" onClick={() => {
                //         setVisible(true)
                //     }}>
                //         新建
                //     </Button>
                // </Show>,
            ]}
        />

        <SqlsManagerModal
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

        <SelectingAsset
            visible={assetVisible}
            handleCancel={() => {
                setAssetVisible(false);
                setSelectedRowKey(undefined);
            }}
            handleOk={(rows) => {
                if (rows.length === 0) {
                    message.warning(i18next.t('sqls.warning.selectAsset'));
                    return;
                }

                let cAssets = rows.map(item => {
                    return {
                        id: item['id'],
                        name: item['name']
                    }
                });

                window.location.href = '#/execute-command?commandId=' + selectedRowKey + '&assets=' + JSON.stringify(cAssets);
            }}
        />

        <ChangeOwner
            lastOwner={selectedRow?.owner}
            open={changeOwnerVisible}
            handleOk={async (owner) => {
                let success = await api.changeOwner(selectedRow?.id, owner);
                if (success) {
                    setChangeOwnerVisible(false);
                    actionRef.current.reload();
                }
            }}
            handleCancel={() => {
                setChangeOwnerVisible(false);
            }}
        />
        </ConfigProvider>
    </Content>);
};

export default Sqls;
