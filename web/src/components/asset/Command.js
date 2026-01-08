import { ProTable } from "@ant-design/pro-components";
import { Button, ConfigProvider, Layout, message, notification, Popconfirm, Popover, Tooltip, Upload } from "antd";
import i18next from 'i18next';
import React, { useEffect, useState } from 'react';
import commandApi from "../../api/command";
import localeConfig from '../../common/localeConfig';
import Show from "../../dd/fi/show";
import ColumnState, { useColumnState } from "../../hook/column-state";
import SimpleCopy from "../../utils/copy";
import ChangeOwner from "./ChangeOwner";
import CommandModal from "./CommandModal";
import SelectingAsset from "./SelectingAsset";
const { Content } = Layout;
const api = commandApi;
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


const Command = () => {
    const importExampleContent = <>
        <a onClick={downloadImportExampleCsv}>{i18next.t('command.button.downloadExample')}</a>
        <div>{i18next.t('command.modal.importCommand')}</div>
    </>

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
            title: i18next.t('command.column.name'),
            dataIndex: 'name',
            key: 'name',
        }, {
            title: i18next.t('command.column.content'),
            dataIndex: 'content',
            key: 'content',
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

        }, {
            title: i18next.t('command.column.ownerName'),
            dataIndex: 'ownerName',
            key: 'ownerName',
            hideInSearch: true
        },
        {
            title: i18next.t('command.column.created'),
            dataIndex: 'created',
            key: 'created',
            hideInSearch: true,
        },
        {
            title: i18next.t('command.column.operation'),
            valueType: 'option',
            key: 'option',
            render: (text, record, _, action) => [
                <Show menu={'command-edit'} key={'command-edit'}>
                    <a
                        key="edit"
                        onClick={() => {
                            setVisible(true);
                            setSelectedRowKey(record['id']);
                        }}
                    >
                        {i18next.t('command.button.edit')}
                    </a>
                </Show>,
                <Show menu={'command-change-owner'} key={'command-change-owner'}>
                    <a
                        key="change-owner"
                        onClick={() => {
                            handleChangeOwner(record);
                        }}
                    >
                        {i18next.t('command.button.changeOwner')}
                    </a>
                </Show>,
                <Show menu={'command-del'} key={'command-del'}>
                    <Popconfirm
                        key={'confirm-delete'}
                        title={i18next.t('command.popconfirm.deleteTitle')}
                        onConfirm={async () => {
                            await api.deleteById(record.id);
                            actionRef.current.reload();
                        }}
                        okText={i18next.t('command.popconfirm.okText')}
                        cancelText={i18next.t('command.popconfirm.cancelText')}
                    >
                        <a key='delete' className='danger'>{i18next.t('command.button.delete')}</a>
                    </Popconfirm>
                </Show>,
            ],
        },
    ];

    const handleChangeOwner = (row) => {
        setSelectedRow(row);
        setChangeOwnerVisible(true);
    }

    const handleImportCommand = async (file) => {

        let [success, data] = await api.importCommand(file);
        if (success === false) {
            notification['error']({
                message: i18next.t('command.modal.error.import'),
                description: data,
            });
            return false;
        }

        let successCount = data['successCount'];
        let errorCount = data['errorCount'];
        if (errorCount === 0) {
            notification['success']({
                message: i18next.t('command.modal.success.import'),
                description: i18next.t('command.modal.success.importDescription', { successCount }),
            });
        } else {
            notification['info']({
                message: i18next.t('command.modal.info.import'),
                description: i18next.t('command.modal.info.importDescription', { successCount, errorCount }),
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
                headerTitle={i18next.t('command.table.title')}
                toolBarRender={() => [
                    <Show menu={'command-add'}>
                        <Button key="button" type="primary" onClick={() => {
                            setVisible(true)
                        }}>
                            {i18next.t('command.button.new')}
                        </Button>
                    </Show>,
                    <Show menu={'asset-import'}>
                        <Popover content={importExampleContent}>
                            <Upload
                                maxCount={1}
                                beforeUpload={handleImportCommand}
                                showUploadList={false}
                            >
                                <Button key='import'>{i18next.t('command.button.import')}</Button>
                            </Upload>
                        </Popover>
                    </Show>,
                ]}
            />

            <CommandModal
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
                        message.warning(i18next.t('command.modal.warning.selectAsset'));
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

export default Command;
