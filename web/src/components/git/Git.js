import { ProTable } from "@ant-design/pro-components";
import { Alert, Button, ConfigProvider, Layout, message, Popconfirm } from "antd";
import i18next from 'i18next';
import React, { useEffect, useState } from 'react';
import gitApi from "../../api/git";
import localeConfig from '../../common/localeConfig';
import Show from "../../dd/fi/show";
import ColumnState, { useColumnState } from "../../hook/column-state";
import ChangeOwner from "./ChangeOwner";
import GitManagerLogsModal from "./GitLogsModal";
import GitManagerModal from "./GitModal";
import SelectingAsset from "./SelectingAsset";
const {Content} = Layout;
const api = gitApi;
const actionRef = React.createRef();

const Git = () => {
    let [assetVisible, setAssetVisible] = useState(false);

    let [checkGit,setCheckGit] = useState({code:1,data:''});
    let [visibleLogs, setVisibleLogs] = useState(false);
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
            title: i18next.t('git.table.column.name'),
            dataIndex: 'name',
            key: 'name',
        }, {
            title: i18next.t('git.table.column.content'),
            dataIndex: 'content',
            key: 'content'
        }, {
            title: i18next.t('git.table.column.ownerName'),
            dataIndex: 'ownerName',
            key: 'ownerName',
            hideInSearch: true,
         
        },
        {
            title: i18next.t('git.table.column.created'),
            key: 'created',
            dataIndex: 'created',
            hideInSearch: true,

        },
        {
            title: i18next.t('git.table.column.option'),
            valueType: 'option',
            key: 'option',
            render: (text, record, _, action) => [
                <Show menu={'command-exec'} key={'command-exec'}>
                    <a
                        key="edit"
                        onClick={() => {
                            setVisibleLogs(true);
                            setSelectedRowKey(record['id']);
                        }}
                    >
                        {i18next.t('git.action.versionManagement')}
                    </a>
                </Show>,
                <Show menu={'command-edit'} key={'command-edit'}>
                    <a
                        key="edit"
                        onClick={() => {
                            setVisible(true);
                            setSelectedRowKey(record['id']);
                        }}
                    >
                        {i18next.t('git.action.edit')}
                    </a>
                </Show>,
                <Show menu={'command-change-owner'} key={'command-change-owner'}>
                    <a
                        key="change-owner"
                        onClick={() => {
                            handleChangeOwner(record);
                        }}
                    >
                        {i18next.t('git.action.changeOwner')}
                    </a>
                </Show>,
                <Show menu={'command-del'} key={'command-del'}>
                    <Popconfirm
                        key={'confirm-delete'}
                        title={i18next.t('git.modal.popconfirm.delete.title')}
                        onConfirm={async () => {
                            await api.deleteById(record.id);
                            actionRef.current.reload();
                        }}
                        okText={i18next.t('git.modal.popconfirm.delete.ok')}
                        cancelText={i18next.t('git.modal.popconfirm.delete.cancel')}
                    >
                        <a key='delete' className='danger'>{i18next.t('git.action.delete')}</a>
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
        {checkGit?.code != 1 && <Alert message={i18next.t('git.alert.checkGit')} type="warning" showIcon closable style={{marginBottom: 16}}/>}
        <ProTable
            scroll={{ x: 'max-content' }}
            columns={columns}
            actionRef={actionRef}
            columnsState={{
                value: columnsStateMap,
                onChange: setColumnsStateMap
            }}
            request={async (params = {}, sort, filter) => {

                // 检查git安装
                setCheckGit(await gitApi.check())
                 
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
            headerTitle={i18next.t('git.table.headerTitle.management')}
            toolBarRender={() => [
                <Show menu={'command-add'}>
                    <Button key="button" type="primary" onClick={() => {
                        setVisible(true)
                    }}>
                        {i18next.t('git.table.toolbar.button.new')}
                    </Button>
                </Show>,
            ]}
        />

        <GitManagerModal
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

        <GitManagerLogsModal
                id={selectedRowKey}
                visible={visibleLogs}
                confirmLoading={confirmLoading}
                handleCancel={() => {
                    setVisibleLogs(false);
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
                            setVisibleLogs(false);
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
                    message.warning(i18next.t('git.message.warning.selectAsset'));
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

export default Git;