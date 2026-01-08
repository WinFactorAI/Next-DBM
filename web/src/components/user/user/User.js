import { ExclamationCircleOutlined, LockTwoTone } from "@ant-design/icons";
import { ProTable, TableDropdown } from "@ant-design/pro-components";
import multiavatar from '@multiavatar/multiavatar/esm';
import { Button, Col, Collapse, ConfigProvider, Input, Layout, message, Modal, Popconfirm, Row, Switch, Table } from "antd";
import i18next from 'i18next';
import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from "react-router-dom";
import userApi from "../../../api/user";
import localeConfig from '../../../common/localeConfig';
import { debugLog } from "../../../common/logger";
import Show from "../../../dd/fi/show";
import ColumnState, { useColumnState } from "../../../hook/column-state";
import { hasMenu } from "../../../service/permission";
import arrays from "../../../utils/array";
import strings from "../../../utils/strings";
import UserGroupTree from "./UserGroupTree";
import UserModal from "./UserModal";
const { Panel } = Collapse;
const api = userApi;

const { Content } = Layout;

const actionRef = React.createRef();

const User = () => {
    let [visible, setVisible] = useState(false);
    let [confirmLoading, setConfirmLoading] = useState(false);
    let [selectedRowKey, setSelectedRowKey] = useState(undefined);
    let [selectedRowKeys, setSelectedRowKeys] = useState([]);

    const [userGroupId, setUserGroupId] = useState(undefined);

    const [columnsStateMap, setColumnsStateMap] = useColumnState(ColumnState.USER);
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
        {
            dataIndex: 'index',
            valueType: 'indexBorder',
            width: 48,
        }, {
            title: i18next.t('user.column.header'),
            dataIndex: 'header',
            key: 'header',
            hideInSearch: true,
            width: 48,
            render: (text, record) => {
                let view = <span className='avatar' dangerouslySetInnerHTML={{ __html: multiavatar(record['nickname']) }} />;
                return view;
            }
        }, {
            title: i18next.t('user.column.nickname'),
            dataIndex: 'nickname',
            key: 'nickname',
            sorter: true,
            render: (text, record) => {
                let view = <div>{text}</div>;
                if (hasMenu('user-detail')) {
                    view = <Link to={`/user/${record['id']}`}>{text}</Link>;
                }
                return view;
            }
        }, {
            title: i18next.t('user.column.username'),
            dataIndex: 'username',
            key: 'username',
            sorter: true,
        }, {
            title: i18next.t('user.column.mail'),
            dataIndex: 'mail',
            key: 'mail',
        }, {
            title: i18next.t('user.column.status'),
            dataIndex: 'status',
            key: 'status',
            hideInSearch: true,
            render: (status, record, index) => {
                return <Switch checkedChildren={i18next.t('user.status.enabled')} unCheckedChildren={i18next.t('user.status.disabled')}
                    checked={status !== 'disabled'}
                    onChange={checked => {
                        handleChangeUserStatus(record['id'], checked, index);
                    }} />
            }
        }, {
            title: i18next.t('user.column.online'),
            dataIndex: 'online',
            key: 'online',
            valueType: 'radio',
            sorter: true,
            valueEnum: {
                true: { text: i18next.t('user.online.status.success'), status: 'success' },
                false: { text: i18next.t('user.online.status.default'), status: 'default' },
            },
        },
        {
            title: i18next.t('user.column.created'),
            key: 'created',
            dataIndex: 'created',
            hideInSearch: true,
        },
        {
            title: i18next.t('user.column.option'),
            valueType: 'option',
            key: 'option',
            render: (text, record, _, action) => [
                <Show menu={'user-edit'} key={'user-edit'}>
                    <a
                        key="edit"
                        onClick={() => {
                            setVisible(true);
                            setSelectedRowKey(record['id']);
                        }}
                    >
                        {i18next.t('user.button.edit')}
                    </a>
                </Show>
                ,
                <Show menu={'user-del'} key={'user-del'}>
                    <Popconfirm
                        key={'confirm-delete'}
                        title={i18next.t('user.modal.confirm.delete')}
                        onConfirm={async () => {
                            await api.deleteById(record.id);
                            actionRef.current.reload();
                        }}
                        okText={i18next.t('user.modal.confirm.delete.okText')}
                        cancelText={i18next.t('user.modal.confirm.delete.cancelText')}
                    >
                        <a key='delete' className='danger'>{i18next.t('user.button.delete')}</a>
                    </Popconfirm>
                </Show>,
                <TableDropdown
                    key="actionGroup"
                    onSelect={(key) => {
                        switch (key) {
                            case 'user-detail':
                                navigate(`/user/${record['id']}?activeKey=info`);
                                break;
                            case 'user-authorised-asset':
                                navigate(`/user/${record['id']}?activeKey=asset`);
                                break;
                            case 'user-login-policy':
                                navigate(`/user/${record['id']}?activeKey=login-policy`);
                                break;
                        }
                    }}
                    menus={[
                        { key: 'user-detail', name: i18next.t('user.dropdown.userDetail'), disabled: !hasMenu('user-detail') },
                        { key: 'user-authorised-asset', name: i18next.t('user.dropdown.userAuthorisedAsset'), disabled: !hasMenu('user-authorised-asset') },
                        { key: 'user-login-policy', name: i18next.t('user.dropdown.userLoginPolicy'), disabled: !hasMenu('user-login-policy') },
                    ]}
                />,
            ],
        },
    ];

    const handleChangeUserStatus = async (id, checked, index) => {
        await api.changeStatus(id, checked ? 'enabled' : 'disabled');
        actionRef.current.reload();
    }

    const handleResetTotp = () => {
        Modal.confirm({
            title: i18next.t('user.modal.confirm.resetTotp.title'),
            icon: <ExclamationCircleOutlined />,
            content: i18next.t('user.modal.confirm.resetTotp.content'),
            onOk() {
                return new Promise(async (resolve, reject) => {
                    await api.resetTotp(selectedRowKeys.join(','));
                    resolve();
                    message.success(i18next.t('user.dropdown.changePassword.resetSuccess'));
                }).catch(() => debugLog('Oops errors!'))
            },
        });
    }

    const handleChangePassword = () => {
        let password = '';
        Modal.confirm({
            title: i18next.t('user.modal.confirm.changePassword.title'),
            icon: <LockTwoTone />,
            content: <Input.Password onChange={e => password = e.target.value} placeholder={i18next.t('user.modal.confirm.changePassword.placeholder')} />,
            onOk() {
                return new Promise(async (resolve, reject) => {
                    if (!strings.hasText(password)) {
                        reject();
                        message.warn(i18next.t('user.dropdown.changePassword.title'));
                        return;
                    }
                    await api.changePassword(selectedRowKeys.join(','), password);
                    resolve();
                    message.success(i18next.t('user.dropdown.changePassword.success'));
                }).catch(() => debugLog('Oops errors!'))
            },
        });
    }
    const handleChangeProxyAuth = () => {
        let password = '';
        Modal.confirm({
            title: i18next.t('user.modal.confirm.changeProxyAuth.title'),
            icon: <LockTwoTone />,
            content: <Input.Password onChange={e => password = e.target.value} placeholder={i18next.t('user.modal.confirm.changeProxyAuth.placeholder')} />,
            onOk() {
                return new Promise(async (resolve, reject) => {
                    if (!strings.hasText(password)) {
                        reject();
                        message.warn("请输入密码");
                        return;
                    }
                    await api.changeProxyAuth(selectedRowKeys.join(','), password);
                    resolve();
                    message.success("修改成功");
                }).catch(() => debugLog('Oops errors!'))
            },
        });
    }
    return (<Content className="page-container">
        <ConfigProvider locale={locale}>
            <Row gutter={16}>
                <Col xs={24} sm={6} md={4} lg={4} xl={4}>
                    <Collapse defaultActiveKey={['1']} className="collapse-box">
                        <Panel header={i18next.t('user.userGroup.title')} key="1" >
                            <UserGroupTree onSelect={(node) => {
                                setUserGroupId(node.key)
                                actionRef.current.reload();
                                // console.log(" node ", node)
                            }} />
                        </Panel>
                    </Collapse>
                </Col>
                <Col xs={24} sm={18} md={20} lg={20} xl={20}>
                    <ProTable
                        scroll={{ x: 'max-content' }}
                        columns={columns}
                        actionRef={actionRef}
                        columnsState={{
                            value: columnsStateMap,
                            onChange: setColumnsStateMap
                        }}
                        rowSelection={{
                            selections: [Table.SELECTION_ALL, Table.SELECTION_INVERT],
                            selectedRowKeys: selectedRowKeys,
                            onChange: (keys) => {
                                setSelectedRowKeys(keys);
                            }
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
                                userGroupId: userGroupId,
                                nickname: params.nickname,
                                username: params.username,
                                mail: params.mail,
                                online: params.online,
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
                            showSizeChanger: true
                        }}
                        dateFormatter="string"
                        headerTitle={i18next.t('user.table.title')}
                        toolBarRender={() => [
                            <Show menu={'user-add'}>
                                <Button key="button" type="primary" onClick={() => {
                                    setVisible(true)
                                }}>
                                    {i18next.t('user.button.new')}
                                </Button>
                            </Show>,
                            <Show menu={'user-change-password'}>
                                <Button key="button"
                                    disabled={arrays.isEmpty(selectedRowKeys)}
                                    onClick={handleChangeProxyAuth}>
                                    {i18next.t('user.modal.confirm.changeProxyAuth.title')}
                                </Button>
                            </Show>,
                            <Show menu={'user-change-password'}>
                                <Button key="button"
                                    disabled={arrays.isEmpty(selectedRowKeys)}
                                    onClick={handleChangePassword}>
                                    {i18next.t('user.button.changePassword')}
                                </Button>
                            </Show>,
                            <Show menu={'user-reset-totp'}>
                                <Button key="button"
                                    disabled={arrays.isEmpty(selectedRowKeys)}
                                    onClick={handleResetTotp}>
                                    {i18next.t('user.dropdown.userResetTotp')}
                                </Button>
                            </Show>,
                        ]}
                    />
                </Col>
            </Row>
        </ConfigProvider>

        <UserModal
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
    </Content>);
}

export default User;
