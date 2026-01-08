import { DownOutlined } from '@ant-design/icons';
import { ProTable, TableDropdown } from "@ant-design/pro-components";
import {
    Badge,
    Button,
    ConfigProvider,
    Dropdown,
    Layout,
    Menu,
    Modal,
    Popconfirm,
    Popover,
    Select,
    Space,
    Table,
    Tag,
    Tooltip,
    Upload,
    message,
    notification
} from "antd";
import dayjs from "dayjs";
import i18next from 'i18next';
import React, { useEffect, useState } from 'react';
import { useQuery } from "react-query";
import { Link, useNavigate } from "react-router-dom";
import assetApi from "../../api/asset";
import tagApi from "../../api/tag";
import localeConfig from '../../common/localeConfig';
import { debugLog } from '../../common/logger';
import Show from "../../dd/fi/show";
import ColumnState, { useColumnState } from "../../hook/column-state";
import MariadbIcon from "../../images/icons/mariadb.svg";
import MongodbIcon from "../../images/icons/mongodb.svg";
import MysqlIcon from "../../images/icons/mysql.svg";
import OracleIcon from "../../images/icons/oracle.svg";
import PostgreSqlIcon from "../../images/icons/postgreSQL.svg";
import RedisIcon from "../../images/icons/redis.svg";
import SqlLiteIcon from "../../images/icons/sqlLite.svg";
import SqlServerIcon from "../../images/icons/sqlServer.svg";
import { getCurrentUser, hasMenu } from "../../service/permission";
import strings from "../../utils/strings";
import ChangeOwner from "./ChangeOwner";
import DBMAssetModal from "./DBMAssetModal";
import ProxyInfoModal from "./ProxyInfoModal";
const api = assetApi;
const { Content } = Layout;
const actionRef = React.createRef();

function downloadImportExampleCsv() {
    let csvString = 'name,ssh,127.0.0.1,22,username,password,privateKey,passphrase,description,tag1|tag2|tag3';
    //前置的"\uFEFF"为“零宽不换行空格”，可处理中文乱码问题
    const blob = new Blob(["\uFEFF" + csvString], { type: 'text/csv;charset=gb2312;' });
    let a = document.createElement('a');
    a.download = 'sample.csv';
    a.href = URL.createObjectURL(blob);
    a.click();
}



const DBMAsset = () => {

    const userId = getCurrentUser().id
    const importExampleContent = <>
        <a onClick={downloadImportExampleCsv}>{i18next.t('action.download')}</a>
        <div dangerouslySetInnerHTML={{ __html: i18next.t('action.import-db-asset') }} ></div>
    </>


    let [visible, setVisible] = useState(false);
    let [proxyInfoVisible, setProxyInfoVisible] = useState(false);


    let [confirmLoading, setConfirmLoading] = useState(false);
    let [selectedRowKey, setSelectedRowKey] = useState(undefined);
    let [items, setItems] = useState([]);
    let [selectedRowKeys, setSelectedRowKeys] = useState([]);
    let [copied, setCopied] = useState(false);


    let [selectedRow, setSelectedRow] = useState(undefined);
    let [changeOwnerVisible, setChangeOwnerVisible] = useState(false);

    const [columnsStateMap, setColumnsStateMap] = useColumnState(ColumnState.ASSET);

    const tagQuery = useQuery('getAllTag', tagApi.getAll);
    let navigate = useNavigate();

    const handleCopy = (text) => {
        navigator.clipboard.writeText(text).then(() => {
            message.success('复制成功！');
        }).catch(() => {
            message.error('复制失败，请重试。');
        });
    };

    const [dbTypes, setDbTypes] = useState([]); // 存储数据库类型数据
    const [loading, setLoading] = useState(false); // 加载状态

    // 从接口获取数据
    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const types = await api.types();
                setDbTypes(types);
            } catch (error) {
                debugLog.error('Failed to fetch data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

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
            title: i18next.t('asset.name'),
            dataIndex: 'name',
            sorter: true,
            fieldProps: {
                placeholder: i18next.t('asset.name-placeholder')
            },
            render: (text, record) => {
                if (record['description'] === '-') {
                    record['description'] = '';
                }

                let view = <div>{text}</div>;
                if (hasMenu('asset-detail')) {
                    view = <Link to={`/asset/${record['id']}`}>{text}</Link>;
                }
                return <div>
                    {view}
                    <div style={{
                        color: 'rgba(0, 0, 0, 0.45)',
                        lineHeight: 1.45,
                        fontSize: '14px'
                    }}>{record['description']}</div>
                </div>
            },
        },
        {
            title: i18next.t('asset.db-type'),
            dataIndex: 'protocol',
            key: 'protocol',
            sorter: true,
            fieldProps: {
                placeholder: i18next.t('asset.db-type-placeholder')
            },
            render: (text, record) => {
                const icons = {
                    Redis: RedisIcon,
                    MariaDB: MariadbIcon,
                    MongoDB: MongodbIcon,
                    MySQL: MysqlIcon,
                    Oracle: OracleIcon,
                    SQLServer: SqlServerIcon,
                    PostgreSQL: PostgreSqlIcon,
                    SQLite: SqlLiteIcon,
                };

                if (icons[text]) {
                    return (
                        <Space align="center">
                            <span className={`db-icon-${text}`}>
                                <img src={icons[text]} alt={text} />
                            </span>
                            <span className={`db-text-${text}`}>{text}</span>
                        </Space>
                    );
                }
                return text;
            },
            renderFormItem: (item, { type, defaultRender, ...rest }, form) => {
                if (type === 'form') {
                    return null;
                }
                // 分组数据
                const groupedData = dbTypes.reduce((acc, item) => {
                    if (!acc[item.type]) {
                        acc[item.type] = [];
                    }
                    acc[item.type].push(item);
                    return acc;
                }, {});
                const icons = {
                    redis: RedisIcon,
                    mariadb: MariadbIcon,
                    mysql: MysqlIcon,
                    oracle: OracleIcon,
                    sqlServer: SqlServerIcon,
                    postgreSQL: PostgreSqlIcon,
                    sqlLite: SqlLiteIcon,
                    mongodb: MongodbIcon,
                };
                return (
                    <Select loading={loading} allowClear>
                        {/* 关系型数据库 */}
                        <Select.OptGroup label={i18next.t('database.rdbms')}>
                            {groupedData.rdbms?.map((option) => (
                                <Select.Option key={option.value} value={option.value} disabled={option.disabled}>
                                    <Space align="center">
                                        <span className={`db-icon-${option.icon}`}>
                                            <img src={icons[option.icon]} alt={option.icon} />
                                        </span>
                                        <span className={`db-text-${option.icon}`}>{option.name}</span>
                                    </Space>
                                </Select.Option>
                            ))}
                        </Select.OptGroup>

                        {/* 非关系型数据库 */}
                        <Select.OptGroup label={i18next.t('database.nosql')}>
                            {groupedData.nosql?.map((option) => (
                                <Select.Option key={option.value} value={option.value} disabled={option.disabled}>
                                    <Space align="center">
                                        <span className={`db-icon-${option.icon}`}>
                                            <img src={icons[option.icon]} alt={option.name} />
                                        </span>
                                        <span className={`db-text-${option.icon}`}>{option.name}</span>
                                    </Space>
                                </Select.Option>
                            ))}
                        </Select.OptGroup>
                    </Select>
                );

            },
        },
        {
            title: i18next.t('asset.network'),
            dataIndex: 'network',
            key: 'network',
            sorter: true,
            fieldProps: {
                placeholder: i18next.t('asset.network-placeholder')
            },
            render: (text, record) => {
                return `${record['ip'] + ':' + record['port']}`;
            }
        },
        {
            title: i18next.t('asset.tags'),
            dataIndex: 'tags',
            key: 'tags',
            fieldProps: {
                placeholder: i18next.t('asset.tags-placeholder')
            },
            render: tags => {
                if (strings.hasText(tags)) {
                    return tags.split(',').filter(tag => tag !== '-').map(tag => <Tag key={tag}>{tag}</Tag>);
                }
            },
            renderFormItem: (item, { type, defaultRender, ...rest }, form) => {
                if (type === 'form') {
                    return null;
                }

                return (
                    <Select mode="multiple" allowClear>
                        {tagQuery.data?.map(tag => {
                            if (tag === '-') {
                                return undefined;
                            }
                            return <Select.Option key={tag}>{tag}</Select.Option>
                        })}
                    </Select>
                );
            },
        },
        {
            title: i18next.t('asset.status'),
            dataIndex: 'active',
            key: 'active',
            fieldProps: {
                placeholder: i18next.t('asset.status-placeholder')
            },
            sorter: true,
            render: (text, record) => {
                if (record['testing'] === true) {
                    return (
                        <Tooltip title={i18next.t('asset.test-status.processing')}>
                            <Badge status="processing" text={i18next.t('asset.test-status.processing')} />
                        </Tooltip>
                    );
                }
                if (text) {
                    return (
                        <Tooltip title={i18next.t('asset.test-status.running')}>
                            <Badge status="success" text={i18next.t('asset.test-status.running')} />
                        </Tooltip>
                    );
                } else {
                    return (
                        <Tooltip title={record['activeMessage']}>
                            <Badge status="error" text={i18next.t('asset.test-status.unavailable')} />
                        </Tooltip>
                    );
                }
            },
            renderFormItem: (item, { type, defaultRender, ...rest }, form) => {
                if (type === 'form') {
                    return null;
                }

                return (
                    <Select>
                        <Select.Option value="true">{i18next.t('asset.test-status.running')}</Select.Option>
                        <Select.Option value="false">{i18next.t('asset.test-status.unavailable')}</Select.Option>
                    </Select>
                );
            },
        },
        {
            title: i18next.t('asset.owner'),
            dataIndex: 'ownerName',
            key: 'ownerName',
            hideInSearch: true,
        },
        {
            title: i18next.t('asset.create-time'),
            key: 'created',
            sorter: true,
            dataIndex: 'created',
            hideInSearch: true,
        },
        {
            title: i18next.t('asset.last-access-time'),
            key: 'lastAccessTime',
            sorter: true,
            dataIndex: 'lastAccessTime',
            hideInSearch: true,
            render: (text, record) => {
                if (text === '0001-01-01 00:00:00') {
                    return '-';
                }
                return (
                    <Tooltip title={text}>
                        {dayjs(text).fromNow()}
                    </Tooltip>
                )
            },
        },
        {
            title: i18next.t('asset.action'),
            valueType: 'option',
            key: 'option',
            render: (text, record, index, action) => {
                const id = record['id'];
                const protocol = record['protocol'];
                const name = record['name'];
                let url = '';
                if (protocol === 'ssh') {
                    url = `#/term?assetId=${id}&assetName=${name}`;
                } else {
                    url = `#/dbm-access?assetId=${id}&assetName=${name}&protocol=${protocol}`;
                }

                return [
                    <Show menu={'asset-access'} key={'asset-access'}>
                        <a key="access" href={url} target='_blank' rel="noreferrer">{i18next.t('asset.access')}</a>
                    </Show>,
                    <Show menu={'asset-access'} key={'asset-access'}>
                        <a
                            key="proxy-access"
                            onClick={() => {
                                setProxyInfoVisible(true);
                                setSelectedRowKey(record['id']);
                            }}
                            rel="noreferrer"
                            target='_blank'
                        >
                            {i18next.t('asset.proxy-access')}
                        </a>
                    </Show>,
                    <Show menu={'asset-edit'} key={'asset-edit'}>
                        <a
                            key="edit"
                            onClick={() => {
                                setVisible(true);
                                setSelectedRowKey(record['id']);
                            }}
                        >
                            {i18next.t('asset.edit')}
                        </a>
                    </Show>,
                    <Show menu={'asset-del'} key={'asset-del'}>
                        <Popconfirm
                            key={'confirm-delete'}
                            title={i18next.t('asset.confirm-delete')}
                            onConfirm={async () => {
                                await api.deleteById(record.id);
                                actionRef.current.reload();
                            }}
                            okText={i18next.t('asset.confirm')}
                            cancelText={i18next.t('asset.cancel')}
                        >
                            <a key='delete' className='danger'>{i18next.t('asset.delete')}</a>
                        </Popconfirm>
                    </Show>,
                    <TableDropdown
                        key="actionGroup"
                        onSelect={(key) => {
                            switch (key) {
                                case "copy":
                                    setCopied(true);
                                    setVisible(true);
                                    setSelectedRowKey(record['id']);
                                    break;
                                case "test":
                                    connTest(record['id'], index);
                                    break;
                                case "change-owner":
                                    handleChangeOwner(record);
                                    break;
                                case 'asset-detail':
                                    navigate(`/dbm-asset/${record['id']}?activeKey=info`);
                                    break;
                                case 'asset-authorised-user':
                                    navigate(`/dbm-asset/${record['id']}?activeKey=bind-user`);
                                    break;
                                case 'asset-authorised-user-group':
                                    navigate(`/dbm-asset/${record['id']}?activeKey=bind-user-group`);
                                    break;
                            }
                        }}
                        menus={[
                            { key: 'copy', name: i18next.t('asset.copy'), disabled: !hasMenu('asset-copy') },
                            { key: 'test', name: i18next.t('asset.test-connectivity'), disabled: !hasMenu('asset-conn-test') },
                            { key: 'change-owner', name: i18next.t('asset.change-owner'), disabled: !hasMenu('asset-change-owner') },
                            { key: 'asset-detail', name: i18next.t('asset.details'), disabled: !hasMenu('asset-detail') },
                            { key: 'asset-authorised-user', name: i18next.t('asset.authorized-user'), disabled: !hasMenu('asset-authorised-user') },
                            { key: 'asset-authorised-user-group', name: i18next.t('asset.authorized-user-group'), disabled: !hasMenu('asset-authorised-user-group') }
                        ]}
                    />,
                ]
            },
        },
    ];

    const connTest = async (id, index) => {
        items[index]['testing'] = true;
        setItems(items.slice());
        let [active, msg] = await assetApi.connTest(id);
        items[index]['active'] = active;
        items[index]['activeMessage'] = msg;
        items[index]['testing'] = false;
        setItems(items.slice());
    }

    const connTestInBatch = async () => {
        for (let i = 0; i < items.length; i++) {
            let item = items[i];
            if (selectedRowKeys.includes(item['id'])) {
                connTest(item['id'], i);
            }
        }
        setSelectedRowKeys([]);
    }

    const handleImportAsset = async (file) => {

        let [success, data] = await api.importAsset(file);
        if (success === false) {
            notification['error']({
                message: '导入DB资产失败',
                description: data,
            });
            return false;
        }

        let successCount = data['successCount'];
        let errorCount = data['errorCount'];
        if (errorCount === 0) {
            notification['success']({
                message: '导入DB资产成功',
                description: '共导入成功' + successCount + '条DB资产。',
            });
        } else {
            notification['info']({
                message: '导入DB资产完成',
                description: `共导入成功${successCount}条DB资产，失败${errorCount}条DB资产。`,
            });
        }
        actionRef.current.reload();
        return false;
    }

    const handleChangeOwner = (row) => {
        setSelectedRow(row);
        setChangeOwnerVisible(true);
    }

    const settings = [
        { title: i18next.t('setting.columns'), key: 'columns', children: columns }, // 列设置
        { title: i18next.t('setting.density'), key: 'density' }, // 密度设置
        { title: i18next.t('setting.reload'), key: 'reload' }, // 重新加载设置
    ];

    return (<Content className="page-container"  >
        <ConfigProvider locale={locale}>
            <ProTable
                scroll={{ x: 'max-content' }}
                key={`menu-${i18next.language}-${i18nVersion}`}
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
                        if (field === 'network') {
                            field = 'ip';
                        }
                        order = Object.values(sort)[0];
                    }

                    let ip, port;
                    if (params.network) {
                        let split = params.network.split(':');
                        if (split.length >= 2) {
                            ip = split[0];
                            port = split[1];
                        } else {
                            ip = split[0];
                        }
                    }

                    let queryParams = {
                        pageIndex: params.current,
                        pageSize: params.pageSize,
                        name: params.name,
                        type: params.type,
                        protocol: params.protocol,
                        active: params.active,
                        'tags': params.tags?.join(','),
                        ip: ip,
                        port: port,
                        field: field,
                        order: order
                    }
                    let result = await api.getPaging(queryParams);
                    setItems(result['items']);
                    return {
                        data: items,
                        success: true,
                        total: result['total']
                    };
                }}
                rowSelection={{
                    selections: [Table.SELECTION_ALL, Table.SELECTION_INVERT],
                    selectedRowKeys: selectedRowKeys,
                    onChange: (keys) => {
                        setSelectedRowKeys(keys);
                    }
                }}
                dataSource={items}
                rowKey="id"
                search={{
                    labelWidth: 'auto',
                    searchText: i18next.t('asset.query'),
                    submitText: i18next.t('asset.query'),
                    resetText: i18next.t('asset.reset')
                }}
                pagination={{
                    defaultPageSize: 10,
                    showSizeChanger: true
                }}
                dateFormatter="string"
                headerTitle={i18next.t('asset.table-title')}
                toolBarRender={() => {
                    const dropdownMenu = (
                        <Menu>
                            <Menu.Item key="import">
                                <Show menu={'asset-import'}>
                                    <Popover content={importExampleContent}>
                                        <Upload
                                            maxCount={1}
                                            beforeUpload={handleImportAsset}
                                            showUploadList={false}
                                        >
                                            {i18next.t('action.import')}
                                        </Upload>
                                    </Popover>
                                </Show>
                            </Menu.Item>
                            <Menu.Item key="delete" disabled={selectedRowKeys.length === 0}
                                danger
                                onClick={() => {
                                    Modal.confirm({
                                        title: i18next.t('action.delete.confirm'),
                                        content: i18next.t('action.delete.warning'),
                                        okText: i18next.t('action.delete.ok'),
                                        okType: 'danger',
                                        cancelText: i18next.t('action.delete.cancel'),
                                        onOk: async () => {
                                            await api.deleteById(selectedRowKeys.join(","));
                                            actionRef.current.reload();
                                            setSelectedRowKeys([]);
                                        }
                                    });
                                }}>
                                <Show menu={'asset-del'}>
                                    {i18next.t('action.delete')}
                                </Show>
                            </Menu.Item>
                        </Menu>
                    );
                    return [
                        <Show menu={'asset-add'}>
                            <Button key="add" type="primary" onClick={() => {
                                setVisible(true)
                            }}>
                                {i18next.t('action.create')}
                            </Button>
                        </Show>,
                        <Show menu={'asset-conn-test'}>
                            <Button key="connTest"
                                disabled={selectedRowKeys.length === 0}
                                onClick={connTestInBatch}>
                                {i18next.t('action.connectivity-test')}
                            </Button>
                        </Show>,
                        <Dropdown overlay={dropdownMenu}>
                            <Button>
                                {i18next.t('action.more')} <DownOutlined />
                            </Button>
                        </Dropdown>
                    ];
                }}
            />
            <ProxyInfoModal
                id={selectedRowKey}
                visible={proxyInfoVisible}
                userId={userId}
                type="manager"
                handleOk={() => {
                    setProxyInfoVisible(false);
                }}
            />

            <DBMAssetModal
                id={selectedRowKey}
                copied={copied}
                visible={visible}
                confirmLoading={confirmLoading}
                handleCancel={() => {
                    setVisible(false);
                    setSelectedRowKey(undefined);
                    setCopied(false);
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
                        setSelectedRowKey(undefined);
                        setCopied(false);
                    }
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
}

export default DBMAsset;
