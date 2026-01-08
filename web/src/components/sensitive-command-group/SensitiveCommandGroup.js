import { ProTable } from "@ant-design/pro-components";
import { Button, ConfigProvider, Layout, message, notification, Popconfirm } from "antd";
import i18next from 'i18next';
import React, { useEffect, useState } from 'react';
import { Link } from "react-router-dom";
import sensitiveCommandGroupApi from "../../api/sensitive-command-group";
import localeConfig from '../../common/localeConfig';
import Show from "../../dd/fi/show";
import ColumnState, { useColumnState } from "../../hook/column-state";
import ChangeOwner from "../asset/ChangeOwner";
import SelectingAsset from "../asset/SelectingAsset";
import SensitiveCommandModal from "./SensitiveCommandGroupModal";

const { Content } = Layout;
const api = sensitiveCommandGroupApi;
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

const importExampleContent = <>
    <a onClick={downloadImportExampleCsv}>下载示例</a>
    <div>导入敏感策略</div>
</>
const SensitiveCommand = () => {
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
            title: i18next.t('sensitiveCommandGroup.column.name'),
            dataIndex: 'name',
        }, {
            title: i18next.t('sensitiveCommandGroup.column.content'),
            dataIndex: 'content',
            key: 'content',
        },
        {
            title: i18next.t('build.modal.tabs.webhook.label'),
            dataIndex: 'webhookName',
            key: 'webhookName',
            hideInSearch: true
        },
        {
            title: i18next.t('sensitiveCommandGroup.column.created'),
            key: 'created',
            dataIndex: 'created',
            hideInSearch: true,
        },
        {
            title: i18next.t('sensitiveCommandGroup.column.option'),
            valueType: 'option',
            key: 'option',
            render: (text, record, _, action) => [
                <Show menu={'sensitive-command-group-detail'} key={'sensitive-command-group-get'}>
                    <Link key="get" to={`/sensitive-command-group/${record['id']}?activeKey=info`}>{i18next.t('sensitiveCommandGroup.action.detail')}</Link>
                </Show>,
                <Show menu={'sensitive-command-group-edit'} key={'sensitive-command-group-edit'}>
                    <a
                        key="edit"
                        onClick={() => {
                            setVisible(true);
                            setSelectedRowKey(record['id']);
                        }}
                    >
                        {i18next.t('sensitiveCommandGroup.action.edit')}
                    </a>
                </Show>,
                <Show menu={'sensitive-command-group-del'} key={'sensitive-command-group-del'}>
                    <Popconfirm
                        key={'confirm-delete'}
                        title={i18next.t('sensitiveCommandGroup.delete.confirm.title')}
                        onConfirm={async () => {
                            await api.deleteById(record.id);
                            actionRef.current.reload();
                        }}
                        okText={i18next.t('sensitiveCommandGroup.delete.confirm.okText')}
                        cancelText={i18next.t('sensitiveCommandGroup.delete.confirm.cancelText')}
                    >
                        <a key='delete' className='danger'>{i18next.t('sensitiveCommandGroup.action.delete')}</a>
                    </Popconfirm>
                </Show>,
            ],
        },
    ];

    const handleChangeOwner = (row) => {
        setSelectedRow(row);
        setChangeOwnerVisible(true);
    }

    const handleImportSensitiveCommand = async (file) => {

        let [success, data] = await api.importSensitiveCommand(file);
        if (success === false) {
            notification['error']({
                message: i18next.t('sensitiveCommandGroup.import.error.message'),
                description: data,
            });
            return false;
        }

        let successCount = data['successCount'];
        let errorCount = data['errorCount'];
        if (errorCount === 0) {
            notification['success']({
                message: i18next.t('sensitiveCommandGroup.import.success.message'),
                description: i18next.t('sensitiveCommandGroup.import.success.description', { successCount }),
            });
        } else {
            notification['info']({
                message: i18next.t('sensitiveCommandGroup.import.info.message'),
                description: i18next.t('sensitiveCommandGroup.import.info.description', { successCount, errorCount }),
            });
        }
        actionRef.current.reload();
        return false;
    }

    return (<Content className="page-container">
        <ConfigProvider locale={locale}>
            <ProTable
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
                headerTitle={i18next.t('sensitiveCommandGroup.table.title')}
                toolBarRender={() => [
                    <Show menu={'sensitive-command-group-add'}>
                        <Button key="button" type="primary" onClick={() => {
                            setVisible(true)
                        }}>
                            {i18next.t('sensitiveCommandGroup.action.new')}
                        </Button>
                    </Show>,
                    // <Show menu={'asset-import'}>
                    //     <Popover content={importExampleContent}>
                    //         <Upload
                    //             maxCount={1}
                    //             beforeUpload={handleImportSensitiveCommand}
                    //             showUploadList={false}
                    //         >
                    //             <Button key='import'>导入</Button>
                    //         </Upload>
                    //     </Popover>
                    // </Show>,
                ]}
            />

            <SensitiveCommandModal
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
                        message.warning(i18next.t('sensitiveCommandGroup.asset.select.warning'));
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

export default SensitiveCommand;
