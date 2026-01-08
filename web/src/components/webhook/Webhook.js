import { ProTable } from "@ant-design/pro-components";
import { Button, ConfigProvider, Layout, message, notification, Popconfirm, Switch, Tooltip } from "antd";
import i18next from 'i18next';
import React, { useEffect, useState } from 'react';
import webhookApi from "../../api/webhook";
import localeConfig from '../../common/localeConfig';
import Show from "../../dd/fi/show";
import ColumnState, { useColumnState } from "../../hook/column-state";
import SimpleCopy from "../../utils/copy";
import SelectingAsset from "../asset/SelectingAsset";
import WebhookDrawer from "./WebhookDrawer";
import WebhookModal from "./WebhookModal";

const { Content } = Layout;
const api = webhookApi;
const actionRef = React.createRef();
function downloadImportExampleCsv() {
    let csvString = 'name,content';
    //前置的"\uFEFF"为“零宽不换行空格”，可处理中文乱码问题
    const blob = new Blob(["\uFEFF" + csvString], { type: 'text/csv;charset=gb2312;' });
    let a = document.createElement('a');
    a.download = 'sample.csv';
    a.href = URL.createObjectURL(blob);
    a.click();
}


const Webhook = () => {
    const importExampleContent = <>
        <a onClick={downloadImportExampleCsv}>{i18next.t('webhook.button.downloadExample')}</a>
        <div>{i18next.t('webhook.modal.importCommand')}</div>
    </>

    let [assetVisible, setAssetVisible] = useState(false);
    let [visibleDrawer, setVisibleDrawer] = useState(false);
    let [visible, setVisible] = useState(false);
    let [confirmLoading, setConfirmLoading] = useState(false);
    let [selectedRowKey, setSelectedRowKey] = useState(undefined);

    const [columnsStateMap, setColumnsStateMap] = useColumnState(ColumnState.CREDENTIAL);

    let [selectedRow, setSelectedRow] = useState(undefined);
    let [changeOwnerVisible, setChangeOwnerVisible] = useState(false);

    const [i18nVersion, setI18nVersion] = useState(0);
    const [locale, setLocale] = useState(localStorage['zh-CN']); // 默认英文
    const serviceTypeOptions = [
        {
            label: '构建',
            value: 'build',
        },
        {
            label: '资产',
            value: 'asset',
        },
        {
            label: '敏感',
            value: 'sensitive',
        },
        {
            label: '触发器',
            value: 'trigger',
        },
    ];
    const actionsOptionsMap = {
        'build': [
            { label: '构建开始', value: 'build_start' },
            { label: '构建完成', value: 'build_complete' },
            { label: '构建失败', value: 'build_fail' },
        ],
        'asset': [
            { label: '资产接入', value: 'asset_intro' },
            { label: '资产断开', value: 'asset_outro' },
        ],
        'sensitive': [
            { label: '敏感发现', value: 'sensitive_found' },
        ],
        'trigger': [
            { label: '触发器执行', value: 'trigger_run' },
        ],

    }
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

    const handleChangeUserStatus = async (id, checked, index) => {
        await api.changeStatus(id, checked ? 'enabled' : 'disabled');
        actionRef.current.reload();
    }
    const columns = [
        {
            dataIndex: 'index',
            valueType: 'indexBorder',
            width: 48,
        },
        {
            title: i18next.t('webhook.column.name'),
            dataIndex: 'name',
            key: 'name',
        },
        {
            title: i18next.t('webhook.column.webhook'),
            dataIndex: 'webhook',
            key: 'webhook',
            width: 400,
            render: (text) => (
                <Tooltip title={
                    <div className='tooltipBox'>
                        <div>{text}</div>
                        <SimpleCopy text={text} isShow={false} className="tooltipBox-btn-box"></SimpleCopy>
                    </div>}>
                    <div style={{
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        width: 400 // 确保每个单元格有足够的宽度
                    }}>
                        {text}
                    </div>
                </Tooltip>
            ),
        },
        {
            title: i18next.t('webhook.column.serviceType'),
            dataIndex: 'serviceType',
            key: 'serviceType',
            render: (text, record) => (
                serviceTypeOptions.find(item => item.value === text)?.label
            ),
        },
        {
            title: i18next.t('webhook.column.actions'),
            dataIndex: 'actions',
            key: 'actions',
            hideInSearch: true,
            render: (text, record) => (
                record.actions.split(',').map(action => {
                    return actionsOptionsMap[record.serviceType]?.find(item => item.value === action)?.label
                }).filter(label => label !== undefined).join(', ')
            ),
        },
        {
            title: i18next.t('webhook.column.status'),
            dataIndex: 'status',
            key: 'status',
            hideInSearch: true,
            render: (status, record, index) => {
                return <Switch checkedChildren={i18next.t('webhook.status.enabled')} unCheckedChildren={i18next.t('webhook.status.disabled')}
                    checked={status !== 'disabled'}
                    onChange={checked => {
                        handleChangeUserStatus(record['id'], checked, index);
                    }} />
            }
        },
        {
            title: i18next.t('webhook.column.content'),
            dataIndex: 'content',
            key: 'content',
        },
        {
            title: i18next.t('webhook.column.created'),
            dataIndex: 'created',
            key: 'created',
            hideInSearch: true,
        },
        {
            title: i18next.t('webhook.column.option'),
            valueType: 'option',
            key: 'option',
            render: (text, record, _, action) => [
                <Show menu={'webhook-edit'} key={'webhook-edit'}>
                    <a
                        key="edit"
                        onClick={() => {
                            setVisible(true);
                            setSelectedRowKey(record['id']);
                        }}
                    >
                        {i18next.t('webhook.action.edit')}
                    </a>
                </Show>,
                <Show menu={'webhook-edit'} key={'webhook-edit'}>
                    <a
                        key="edit"
                        onClick={() => {
                            setVisibleDrawer(true);
                            setSelectedRowKey(record['id']);
                        }}
                    >
                        {i18next.t('webhook.action.useManager')}
                    </a>
                </Show>,
                <Show menu={'webhook-del'} key={'webhook-del'}>
                    <Popconfirm
                        key={'confirm-delete'}
                        title={i18next.t('webhook.popconfirm.deleteTitle')}
                        onConfirm={async () => {
                            await api.deleteById(record.id);
                            actionRef.current.reload();
                        }}
                        okText={i18next.t('webhook.popconfirm.okText')}
                        cancelText={i18next.t('webhook.popconfirm.cancelText')}
                    >
                        <a key='delete' className='danger'>{i18next.t('webhook.action.delete')}</a>
                    </Popconfirm>
                </Show>,
            ],
        },
    ];



    const handleImportWebhook = async (file) => {

        let [success, data] = await api.importWebhook(file);
        if (success === false) {
            notification['error']({
                message: i18next.t('webhook.modal.error.import'),
                description: data,
            });
            return false;
        }

        let successCount = data['successCount'];
        let errorCount = data['errorCount'];
        if (errorCount === 0) {
            notification['success']({
                message: i18next.t('webhook.modal.success.import'),
                description: i18next.t('webhook.modal.success.importDescription', { successCount }),
            });
        } else {
            notification['info']({
                message: i18next.t('webhook.modal.info.import'),
                description: i18next.t('webhook.modal.info.importDescription', { successCount, errorCount }),
            });
        }
        actionRef.current.reload();
        return false;
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
                        content: params.content,
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
                headerTitle={i18next.t('webhook.table.title')}
                toolBarRender={() => [
                    <Show menu={'webhook-add'}>
                        <Button key="button" type="primary" onClick={() => {
                            setVisible(true)
                        }}>
                            {i18next.t('webhook.button.new')}
                        </Button>
                    </Show>,
                ]}
            />

            <WebhookModal
                id={selectedRowKey}
                visible={visible}
                serviceTypeOptions={serviceTypeOptions}
                actionsOptionsMap={actionsOptionsMap}
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

                <WebhookDrawer
                    id={selectedRowKey}
                    visible={visibleDrawer}
                    confirmLoading={confirmLoading}
                    handleCancel={() => {
                        setVisibleDrawer(false);
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
                                setVisibleDrawer(false);
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
                        message.warning(i18next.t('webhook.modal.warning.selectAsset'));
                        return;
                    }

                    let cAssets = rows.map(item => {
                        return {
                            id: item['id'],
                            name: item['name']
                        }
                    });

                    window.location.href = '#/execute-webhook?webhookId=' + selectedRowKey + '&assets=' + JSON.stringify(cAssets);
                }}
            />


        </ConfigProvider>
    </Content>);
};

export default Webhook;
