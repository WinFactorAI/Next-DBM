import { ProTable } from "@ant-design/pro-components";
import { Button, ConfigProvider, Layout, Popconfirm, Tag } from "antd";
import i18next from 'i18next';
import React, { useEffect, useState } from 'react';
import { Link } from "react-router-dom";
import strategyApi from "../../api/strategy";
import localeConfig from '../../common/localeConfig';
import Show from "../../dd/fi/show";
import ColumnState, { useColumnState } from "../../hook/column-state";
import { hasMenu } from "../../service/permission";
import StrategyModal from "./StrategyModal";

const api = strategyApi;
const {Content} = Layout;
const actionRef = React.createRef();



const Strategy = () => {
    const renderStatus = (text) => {
        if (text === true) {
            return <Tag color={'green'}>{i18next.t('strategy.renderStatus.start')}</Tag>
        } else {
            return <Tag color={'red'}>{i18next.t('strategy.renderStatus.close')}</Tag>
        }
    }
    let [visible, setVisible] = useState(false);
    let [confirmLoading, setConfirmLoading] = useState(false);
    let [selectedRowKey, setSelectedRowKey] = useState(undefined);

    const [columnsStateMap, setColumnsStateMap] = useColumnState(ColumnState.STRATEGY);

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


    const columns = [{
        dataIndex: 'index',
        valueType: 'indexBorder',
        width: 48,
    }, {
        title: i18next.t('strategy.column.name'),
        dataIndex: 'name',
        key: 'name',
        sorter: true,
        render: (text, record) => {
            let view = <div>{text}</div>;
            if(hasMenu('strategy-detail')){
                view = <Link to={`/strategy/${record['id']}`}>{text}</Link>;
            }
            return view;
        },
    }, {
        title: i18next.t('strategy.column.upload'),
        dataIndex: 'upload',
        key: 'upload',
        hideInSearch: true,
        render: (text) => {
            return renderStatus(text);
        }
    }, {
        title: i18next.t('strategy.column.download'),
        dataIndex: 'download',
        key: 'download',
        hideInSearch: true,
        render: (text) => {
            return renderStatus(text);
        }
    }, {
        title: i18next.t('strategy.column.edit'),
        dataIndex: 'edit',
        key: 'edit',
        hideInSearch: true,
        render: (text) => {
            return renderStatus(text);
        }
    }, {
        title: i18next.t('strategy.column.delete'),
        dataIndex: 'delete',
        key: 'delete',
        hideInSearch: true,
        render: (text) => {
            return renderStatus(text);
        }
    }, {
        title: i18next.t('strategy.column.rename'),
        dataIndex: 'rename',
        key: 'rename',
        hideInSearch: true,
        render: (text) => {
            return renderStatus(text);
        }
    }, {
        title: i18next.t('strategy.column.copy'),
        dataIndex: 'copy',
        key: 'copy',
        hideInSearch: true,
        render: (text) => {
            return renderStatus(text);
        }
    }, {
        title: i18next.t('strategy.column.paste'),
        dataIndex: 'paste',
        key: 'paste',
        hideInSearch: true,
        render: (text) => {
            return renderStatus(text);
        }
    }, {
        title: i18next.t('strategy.column.created'),
        dataIndex: 'created',
        key: 'created',
        hideInSearch: true,
    },
        {
            title: i18next.t('strategy.column.action'),
            valueType: 'option',
            key: 'option',
            render: (text, record, _, action) => [
                <Show menu={'strategy-detail'} key={'strategy-get'}>
                    <Link key="get" to={`/strategy/${record['id']}`}>{i18next.t('strategy.button.detail')}</Link>
                </Show>
                ,
                <Show menu={'strategy-edit'} key={'strategy-edit'}>
                    <a
                        key="edit"
                        onClick={() => {
                            setVisible(true);
                            setSelectedRowKey(record['id']);
                        }}
                    >
                        {i18next.t('strategy.button.edit')}
                    </a>
                </Show>
                ,
                <Show menu={'strategy-del'} key={'strategy-del'}>
                    <Popconfirm
                        key={'confirm-delete'}
                        title={i18next.t('strategy.popconfirm.delete.title')}
                        onConfirm={async () => {
                            await api.deleteById(record.id);
                            actionRef.current.reload();
                        }}
                        okText={i18next.t('strategy.popconfirm.delete.okText')}
                        cancelText={i18next.t('strategy.popconfirm.delete.cancelText')}
                    >
                        <a key='delete' className='danger'>{i18next.t('strategy.button.delete')}</a>
                    </Popconfirm>
                </Show>
                ,
            ],
        },
    ];

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
                        defaultPageSize: 10,
                    }}
                    dateFormatter="string"
                    headerTitle={i18next.t('strategy.table.title')}
                    toolBarRender={() => [
                        <Show menu={'strategy-add'}>
                            <Button key="button" type="primary" onClick={() => {
                                setVisible(true)
                            }}>
                                {i18next.t('strategy.button.new')}
                            </Button>
                        </Show>
                        ,
                    ]}
                />

                <StrategyModal
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
            </Content>
        </ConfigProvider>
    );
}

export default Strategy;
