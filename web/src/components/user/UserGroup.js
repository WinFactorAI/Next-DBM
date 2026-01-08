import i18next from 'i18next';
import React, { useEffect, useState } from 'react';
import localeConfig from '../../common/localeConfig';

import { ProTable, TableDropdown } from "@ant-design/pro-components";
import { Button, ConfigProvider, Layout, Popconfirm } from "antd";
import { Link, useNavigate } from "react-router-dom";
import userGroupApi from "../../api/user-group";
import Show from "../../dd/fi/show";
import ColumnState, { useColumnState } from "../../hook/column-state";
import { hasMenu } from "../../service/permission";
import UserGroupModal from "./UserGroupModal";

const api = userGroupApi;
const { Content } = Layout;

const actionRef = React.createRef();

const UserGroup = () => {

    let [visible, setVisible] = useState(false);
    let [confirmLoading, setConfirmLoading] = useState(false);
    let [selectedRowKey, setSelectedRowKey] = useState(undefined);

    const [columnsStateMap, setColumnsStateMap] = useColumnState(ColumnState.USER_GROUP);
    let navigate = useNavigate();

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
        // {
        //     dataIndex: 'index',
        //     valueType: 'indexBorder',
        //     width: 48,
        // },
        {
            title: i18next.t('userGroup.column.name'),
            dataIndex: 'name',
            render: (text, record) => {
                let view = <div>{text}</div>;
                if (hasMenu('user-group-detail')) {
                    view = <Link to={`/user-group/${record['id']}`}>{text}</Link>;
                }
                return view;
            },
        },
        {
            title: i18next.t('userGroup.column.created'),
            key: 'created',
            dataIndex: 'created',
            hideInSearch: true,
        },
        {
            title: i18next.t('userGroup.column.action'),
            valueType: 'option',
            key: 'option',
            render: (text, record, _, action) => [
                <Show menu={'user-group-edit'} key={'user-group-edit'}>
                    <a
                        key="edit"
                        onClick={() => {
                            setVisible(true);
                            setSelectedRowKey(record['id']);
                        }}
                    >
                        {i18next.t('userGroup.action.edit')}
                    </a>
                </Show>
                ,
                <Show menu={'user-group-del'} key={'user-group-del'}>
                    <Popconfirm
                        key={'confirm-delete'}
                        title={i18next.t('userGroup.action.confirmDelete')}
                        onConfirm={async () => {
                            await api.deleteById(record.id);
                            actionRef.current.reload();
                        }}
                        okText={i18next.t('userGroup.action.confirm')}
                        cancelText={i18next.t('userGroup.action.cancel')}
                    >
                        <a key='delete' className='danger'>{i18next.t('userGroup.action.delete')}</a>
                    </Popconfirm>
                </Show>
                ,
                <TableDropdown
                    key="actionGroup"
                    onSelect={(key) => {
                        switch (key) {
                            case 'user-group-detail':
                                navigate(`/user-group/${record['id']}?activeKey=info`);
                                break;
                            case 'user-group-authorised-asset':
                                navigate(`/user-group/${record['id']}?activeKey=asset`);
                                break;
                        }
                    }}
                    menus={[
                        { key: 'user-group-detail', name: i18next.t('userGroup.action.detail'), disabled: !hasMenu('user-group-detail') },
                        { key: 'user-group-authorised-asset', name: i18next.t('userGroup.action.authorisedAsset'), disabled: !hasMenu('user-group-authorised-asset') },
                    ]}
                />,
            ],
        },
    ];

    const handleChangeUserStatus = async (id, checked, index) => {
        await api.changeStatus(id, checked ? 'enabled' : 'disabled');
        actionRef.current.reload();
    }
    const [expandedKeys, setExpandedKeys] = useState([]);
    const [allParentKeys, setAllParentKeys] = useState([]);
    // 切换展开/折叠
    const toggleExpand = () => {
        // console.log(allParentKeys);
        setExpandedKeys(prev =>
            prev.length === allParentKeys.length ? [] : allParentKeys
        );
    };
    return (<Content className="page-container">
        <ConfigProvider locale={locale}>
            <ProTable
                scroll={{ x: 'max-content' }}
                // 配置子节点字段名（默认是 'children'，可省略）
                expandable={{
                    expandedRowKeys: expandedKeys,
                    childrenColumnName: 'children',
                    onExpandedRowsChange: (keys) => setExpandedKeys(keys),
                    indentSize: 14  // 缩进宽度
                }}
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
                        parentId: params.name ? null : "0",
                        field: field,
                        order: order
                    }
                    let result = await api.getPaging(queryParams);
                    const convertTreeData = (data) => {
                        return data.map(item => ({
                            name: item.name,  // 将原始字段映射到 name
                            id: item.id,      // 映射到 id
                            status: item.status,
                            sort: item.sort,
                            created: item.created,
                            children: item.subItems && item.subItems.length > 0 ? convertTreeData(item.subItems) : undefined
                        }));
                    };
                    const getKeys = (data) => {
                        return data.reduce((acc, node) => {
                            if (node.children) {
                                return [...acc, node.id, ...getKeys(node.children)];
                            }
                            return acc;
                        }, []);
                    };
                    var resultItems = convertTreeData(result['items'])
                    setAllParentKeys(getKeys(resultItems))
                    return {
                        data: resultItems,
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
                headerTitle={i18next.t('userGroup.table.title')}
                toolBarRender={() => [
                    <Show menu={'user-group-add'}>
                        <Button key="button" type="primary" onClick={() => {
                            setVisible(true)
                        }}>
                            {i18next.t('userGroup.action.add')}
                        </Button>
                    </Show>,
                    <Show menu={'user-group-add'}>
                        <Button key="button" type="primary" onClick={toggleExpand}>
                            {expandedKeys.length ? '折叠全部' : '展开全部'}
                        </Button>
                    </Show>,
                ]}
            />

            <UserGroupModal
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

export default UserGroup;
