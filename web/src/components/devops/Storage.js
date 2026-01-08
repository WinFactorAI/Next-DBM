import { ProTable } from "@ant-design/pro-components";
import { Button, ConfigProvider, Drawer, Layout, Popconfirm, Tag } from "antd";
import i18next from 'i18next';
import React, { useEffect, useState } from 'react';
import storageApi from "../../api/storage";
import localeConfig from '../../common/localeConfig';
import Show from "../../dd/fi/show";
import ColumnState, { useColumnState } from "../../hook/column-state";
import { renderSize } from "../../utils/utils";
import FileSystem from "./FileSystem";
import StorageModal from "./StorageModal";

const api = storageApi;

const { Content } = Layout;

const actionRef = React.createRef();

const Storage = () => {
    let [visible, setVisible] = useState(false);
    let [confirmLoading, setConfirmLoading] = useState(false);
    let [selectedRowKey, setSelectedRowKey] = useState(undefined);

    let [fileSystemVisible, setFileSystemVisible] = useState(false);
    const [columnsStateMap, setColumnsStateMap] = useColumnState(ColumnState.STORAGE);

    const columns = [
        {
            dataIndex: 'index',
            valueType: 'indexBorder',
            width: 48,
        },
        {
            title: i18next.t('storage.column.name'),
            dataIndex: 'name',
            key: 'name',
        }, {
            title: i18next.t('storage.column.isShare'),
            dataIndex: 'isShare',
            key: 'isShare',
            hideInSearch: true,
            render: (isShare) => {
                if (isShare) {
                    return <Tag color={'green'}>是</Tag>
                } else {
                    return <Tag color={'red'}>否</Tag>
                }
            }
        }, {
            title: i18next.t('storage.column.isDefault'),
            dataIndex: 'isDefault',
            key: 'isDefault',
            hideInSearch: true,
            render: (isDefault) => {
                if (isDefault) {
                    return <Tag color={'green'}>{i18next.t('storage.isDefault.tag.yes')}</Tag>
                } else {
                    return <Tag color={'red'}>{i18next.t('storage.isDefault.tag.no')}</Tag>
                }
            }
        }, {
            title: i18next.t('storage.column.limitSize'),
            dataIndex: 'limitSize',
            key: 'limitSize',
            hideInSearch: true,
            render: (text => {
                return text < 0 ? i18next.t('storage.limitSize.unlimited') : renderSize(text);
            })
        }, {
            title: i18next.t('storage.column.usedSize'),
            dataIndex: 'usedSize',
            key: 'usedSize',
            hideInSearch: true,
            render: (text => {
                return renderSize(text);
            })
        }, {
            title: i18next.t('storage.column.ownerName'),
            dataIndex: 'ownerName',
            key: 'ownerName',
            hideInSearch: true,
        },
        {
            title: i18next.t('storage.column.option'),
            valueType: 'option',
            key: 'option',
            render: (text, record, _, action) => [
                <Show menu={'storage-browse'} key={'storage-browse'}>
                    <a
                        key="edit"
                        onClick={() => {
                            setFileSystemVisible(true);
                            setSelectedRowKey(record['id']);
                        }}
                    >
                        {i18next.t('storage.action.browse')}
                    </a>
                </Show>,
                <Show menu={'storage-edit'} key={'storage-edit'}>
                    <a
                        key="edit"
                        onClick={() => {
                            setVisible(true);
                            setSelectedRowKey(record['id']);
                        }}
                    >
                        {i18next.t('storage.action.edit')}
                    </a>
                </Show>,
                <Show menu={'storage-del'} key={'storage-del'}>
                    <Popconfirm
                        key={'confirm-delete'}
                        title={i18next.t('storage.delete.confirm.title')}
                        onConfirm={async () => {
                            await api.deleteById(record.id);
                            actionRef.current.reload();
                        }}
                        okText={i18next.t('storage.delete.confirm.okText')}
                        cancelText={i18next.t('storage.delete.confirm.cancelText')}
                    >
                        <a key='delete' disabled={record['isDefault']} className='danger'>{i18next.t('storage.action.delete')}</a>
                    </Popconfirm>
                </Show>,
            ],
        },
    ];
    const [width, setWidth] = useState('60%');

    // 动态更新宽度
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
            <Content className="page-container">
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
                        pageSize: 10,
                    }}
                    dateFormatter="string"
                    headerTitle={i18next.t('storage.table.title')}
                    toolBarRender={() => [
                        <Show menu={'storage-add'}>
                            <Button key="button" type="primary" onClick={() => {
                                setVisible(true)
                            }}>
                                {i18next.t('storage.toolbar.add')}
                            </Button>
                        </Show>,
                    ]}
                />

                <StorageModal
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

                <Drawer
                    title={i18next.t('storage.drawer.title')}
                    placement="right"
                    width={width}
                    closable={true}
                    maskClosable={true}
                    onClose={() => {
                        setFileSystemVisible(false);
                        setSelectedRowKey(undefined);
                        actionRef.current.reload();
                    }}
                    visible={fileSystemVisible}
                >
                    {fileSystemVisible ?
                        <FileSystem
                            storageId={selectedRowKey}
                            storageType={'storages'}
                            upload={true}
                            download={true}
                            delete={true}
                            rename={true}
                            edit={true}
                            minHeight={window.innerHeight - 103}/>
                        : undefined
                    }

                </Drawer>
            </Content>
        </ConfigProvider>
    );
}

export default Storage;
