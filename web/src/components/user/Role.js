import i18next from 'i18next';
import React, { useEffect, useState } from 'react';
import localeConfig from '../../common/localeConfig';

import { ProTable } from "@ant-design/pro-components";
import { Button, ConfigProvider, Layout, Popconfirm } from "antd";
import { Link } from "react-router-dom";
import roleApi from "../../api/role";
import Show from "../../dd/fi/show";
import ColumnState, { useColumnState } from "../../hook/column-state";
import { hasMenu } from "../../service/permission";
import RoleModal from "./RoleModal";

const api = roleApi;
const {Content} = Layout;

const actionRef = React.createRef();

const Role = () => {

    let [visible, setVisible] = useState(false);
    let [confirmLoading, setConfirmLoading] = useState(false);
    let [selectedRowKey, setSelectedRowKey] = useState(undefined);

    const [columnsStateMap, setColumnsStateMap] = useColumnState(ColumnState.ROLE);

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
            title: i18next.t("role.column.name"),
            dataIndex: 'name',
            render: (text, record) => {
                let view = <div>{text}</div>;
                if (hasMenu('role-detail')) {
                    view = <Link to={`/role/${record['id']}`}>{text}</Link>;
                }
                return view;
            },
        },
        {
            title: i18next.t("role.column.type"),
            dataIndex: 'type',
            valueType: 'radio',
            sorter: true,
            valueEnum: {
                'default': {text: i18next.t("role.column.type.default")},
                'new': {text: i18next.t("role.column.type.new")},
            },
        },
        {
            title: i18next.t("role.column.created"),
            key: 'created',
            dataIndex: 'created',
            hideInSearch: true,
        },
        {
            title: i18next.t("role.column.action"),
            valueType: 'option',
            key: 'option',
            render: (text, record, _, action) => [
                <Show menu={'role-detail'} key={'role-get'}>
                    <Link key="get" to={`/role/${record['id']}`}>{i18next.t("role.action.detail")}</Link>
                </Show>
                ,
                <Show menu={'role-edit'} key={'role-edit'}>
                    <a
                        key="edit"
                        disabled={!record['modifiable']}
                        onClick={() => {
                            setVisible(true);
                            setSelectedRowKey(record['id']);
                        }}
                    >
                        {i18next.t("role.action.edit")}
                    </a>
                </Show>
                ,
                <Show menu={'role-del'} key={'role-del'}>
                    <Popconfirm
                        key={'confirm-delete'}
                        title={i18next.t("role.delete.confirm.title")}
                        onConfirm={async () => {
                            await api.deleteById(record.id);
                            actionRef.current.reload();
                        }}
                        okText={i18next.t("role.delete.confirm.okText")}
                        cancelText={i18next.t("role.delete.confirm.cancelText")}
                    >
                        <a key='delete' disabled={!record['deletable']} className='danger'>{i18next.t("role.action.delete")}</a>
                    </Popconfirm>
                </Show>,
            ],
        },
    ];

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
                    type: params.type,
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
            headerTitle={i18next.t("role.table.title")}
            toolBarRender={() => [
                <Show menu={'role-add'}>
                    <Button key="button" type="primary" onClick={() => {
                        setVisible(true)
                    }}>
                        {i18next.t("role.toolbar.add")}
                    </Button>
                </Show>,
            ]}
        />

        <RoleModal
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
        </ConfigProvider>
    </Content>);
}

export default Role;
