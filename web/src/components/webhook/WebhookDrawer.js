import { ProTable } from "@ant-design/pro-components";
import { Drawer, notification, Popconfirm } from "antd";
import i18next from 'i18next';
import React, { useEffect, useState } from 'react';
import webhookServicesRefApi from "../../api/webhook-services-ref";
import localeConfig from '../../common/localeConfig';
import Show from "../../dd/fi/show";
import ColumnState, { useColumnState } from "../../hook/column-state";


const api = webhookServicesRefApi;
const actionRef = React.createRef();
const WebhookDrawer = ({
    visible,
    handleOk,
    handleCancel,
    id,
    worker
}) => {

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
            { label: '资产导入', value: 'asset_import' },
            { label: '资产更新', value: 'asset_update' },
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

    useEffect(() => {
        if (actionRef.current) {
            actionRef.current.reload();
        }
    }, [id]);
    const columns = [
        {
            dataIndex: 'index',
            valueType: 'indexBorder',
            width: 48,
        },
        {
            title: i18next.t('webhookDrawer.column.name'),
            dataIndex: 'name',
            key: 'name',
        },
        {
            title: i18next.t('webhookDrawer.column.created'),
            dataIndex: 'created',
            key: 'created',
            hideInSearch: true,
        },
        {
            title: i18next.t('webhookDrawer.column.option'),
            valueType: 'option',
            key: 'option',
            render: (text, record, _, action) => [
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

    // 动态更新宽度
    const [width, setWidth] = useState('60%');
    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth <= 768) { // 判断屏幕宽度
                setWidth('100%');
            } else {
                setWidth('60%');
            }
        };

        window.addEventListener('resize', handleResize);
        handleResize(); // 初始时执行一次

        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, []);


    return (
        <Drawer placement="right"
            width={width}
            title={i18next.t('webhookDrawer.title')}
            // onClose={handleCancel()} 
            open={visible}
            visible={visible}
            onClose={() => {
                handleCancel()
            }}
            confirmLoading={confirmLoading}
        >
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
                        webhookId: id,
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
                headerTitle={i18next.t('webhookDrawer.table.title')}
                toolBarRender={() => [

                ]}
            />

        </Drawer>
    )
};

export default WebhookDrawer;