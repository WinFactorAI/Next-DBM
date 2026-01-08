import { ProTable } from "@ant-design/pro-components";
import { Button, ConfigProvider, notification, Popconfirm, Popover, Tooltip, Upload } from "antd";
import i18next from 'i18next';
import React, { useEffect, useState } from 'react';
import workCommandApi from "../../api/worker/command";
import localeConfig from '../../common/localeConfig';
import { debugLog } from "../../common/logger";
import SimpleCopy from "../../utils/copy";
import CommandModal from "../asset/CommandModal";
const api = workCommandApi;
const actionRef = React.createRef();

function downloadImportExampleCsv() {
    let csvString = 'name,content';
    //前置的"\uFEFF"为“零宽不换行空格”，可处理中文乱码问题
    const blob = new Blob(["\uFEFF" + csvString], {type: 'text/csv;charset=gb2312;'});
    let a = document.createElement('a');
    a.download = 'sample.csv';
    a.href = URL.createObjectURL(blob);
    a.click();
}

const MyCommand = () => {

    const importExampleContent = <>
        <a onClick={downloadImportExampleCsv}>{i18next.t('myCommand.import.example.download')}</a>
        <div>{i18next.t('myCommand.import.example.description')}</div>
    </>

    let [visible, setVisible] = useState(false);
    let [confirmLoading, setConfirmLoading] = useState(false);
    let [selectedRowKey, setSelectedRowKey] = useState(undefined);

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
            title: i18next.t('myCommand.column.name'),
            dataIndex: 'name',
        }, {
            title: i18next.t('myCommand.column.content'),
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
        },
        {
            title: i18next.t('myCommand.column.created'),
            key: 'created',
            dataIndex: 'created',
            hideInSearch: true,
        },
        {
            title: i18next.t('myCommand.column.operation'),
            valueType: 'option',
            key: 'option',
            render: (text, record, _, action) => [
                <a
                    key="edit"
                    onClick={() => {
                        setVisible(true);
                        setSelectedRowKey(record['id']);
                    }}
                >
                    {i18next.t('myCommand.action.edit')}
                </a>,
                <Popconfirm
                    key={'confirm-delete'}
                    title={i18next.t('myCommand.action.delete.confirm')}
                    onConfirm={async () => {
                        await api.deleteById(record.id);
                        actionRef.current.reload();
                    }}
                    okText={i18next.t('myCommand.action.delete.ok')}
                    cancelText={i18next.t('myCommand.action.delete.cancel')}
                >
                    <a key='delete' className='danger'>{i18next.t('myCommand.action.delete')}</a>
                </Popconfirm>,
            ],
        },
    ];
    
    const handleImportCommand = async (file) => {
        debugLog(" handleImportCommand file")
        let [success, data] = await api.importCommand(file);
        if (success === false) {
            notification['error']({
                message: i18next.t('myCommand.import.error'),
                description: data,
            });
            return false;
        }

        let successCount = data['successCount'];
        let errorCount = data['errorCount'];
        if (errorCount === 0) {
            notification['success']({
                message: i18next.t('myCommand.import.success'),
                description: i18next.t('myCommand.import.info.description',{successCount:successCount}),
            });
        } else {
            notification['info']({
                message: i18next.t('myCommand.import.info'),
                description: i18next.t('myCommand.import.info.description',{successCount:successCount,errorCount:errorCount}),
            });
        }
        actionRef.current.reload();
        return false;
    }
    
    return <ConfigProvider locale={locale}>
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
                headerTitle={i18next.t('myCommand.table.title')}
                toolBarRender={() => [
                    <Button key="button" type="primary" onClick={() => {
                        setVisible(true)
                    }}>
                        {i18next.t('myCommand.toolbar.new')}
                    </Button>,
    
                    <Popover content={importExampleContent}>
                        <Upload
                            maxCount={1}
                            beforeUpload={handleImportCommand}
                            showUploadList={false}
                        >
                            <Button key='import'>{i18next.t('myCommand.toolbar.import')}</Button>
                        </Upload>
                    </Popover>,
                
                ]}
            />

            <CommandModal
                id={selectedRowKey}
                worker={true}
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
        </ConfigProvider>;
};

export default MyCommand;