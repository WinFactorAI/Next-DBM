import { ProTable } from "@ant-design/pro-components";
import { Badge, ConfigProvider, Select, Space, Tag, Tooltip, message } from "antd";
import dayjs from "dayjs";
import React, { useEffect, useState } from 'react';
import { useQuery } from "react-query";
import workAssetApi from "../../api/worker/asset";
import MariadbIcon from "../../images/icons/mariadb.svg";
import MongodbIcon from "../../images/icons/mongodb.svg";
import MysqlIcon from "../../images/icons/mysql.svg";
import OracleIcon from "../../images/icons/oracle.svg";
import PostgreSqlIcon from "../../images/icons/postgreSQL.svg";
import RedisIcon from "../../images/icons/redis.svg";
import SqlLiteIcon from "../../images/icons/sqlLite.svg";
import SqlServerIcon from "../../images/icons/sqlServer.svg";

import i18next from 'i18next';
import localeConfig from '../../common/localeConfig';
import strings from "../../utils/strings";
import ProxyInfoModal from "../asset/ProxyInfoModal";

const actionRef = React.createRef();

const MyAsset = () => {
    let [selectedRowKey, setSelectedRowKey] = useState(undefined);
    let [proxyInfoVisible, setProxyInfoVisible] = useState(false);
    const tagQuery = useQuery('getAllTag', workAssetApi.tags);
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
                const types = await workAssetApi.types();
                setDbTypes(types);
            } catch (error) {
                console.log('Failed to fetch data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
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
                return <div>
                    <div>{text}</div>
                    <div style={{
                        color: 'rgba(0, 0, 0, 0.45)',
                        lineHeight: 1.45,
                        fontSize: '14px'
                    }}>{record['description']}</div>
                </div>
            },
        }, {
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
                    sqlServer: SqlServerIcon,
                    oracle: OracleIcon,
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
        }, {
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
                    <Select mode="multiple"
                        allowClear>
                        {
                            tagQuery.data?.map(tag => {
                                if (tag === '-') {
                                    return undefined;
                                }
                                return <Select.Option key={tag}>{tag}</Select.Option>
                            })
                        }
                    </Select>
                );
            },
        }, {
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
                    url = `#/term?assetId=${id}&assetName=${name}&isWorker=true`;
                } else {
                    // url = `#/access?assetId=${id}&assetName=${name}&protocol=${protocol}`;
                    url = `#/dbm-access?assetId=${id}&assetName=${name}&protocol=${protocol}&isWorker=true`;
                }

                return [
                    <a
                        key="access"
                        href={url}
                        rel="noreferrer"
                        target='_blank'
                    >
                        {i18next.t('asset.access')}
                    </a>,
                    <a
                        key="access"
                        onClick={() => {
                            setProxyInfoVisible(true);
                            setSelectedRowKey(record['id']);
                        }}
                        rel="noreferrer"
                        target='_blank'
                    >
                        {i18next.t('asset.proxy-access')}
                    </a>
                ]
            },
        },
    ];

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
    return (
        <ConfigProvider locale={locale}>
            <ProTable
                scroll={{ x: 'max-content' }}
                key={`menu-${i18next.language}-${i18nVersion}`}
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
                        type: params.type,
                        protocol: params.protocol,
                        active: params.active,
                        'tags': params.tags?.join(','),
                        field: field,
                        order: order
                    }
                    let result = await workAssetApi.getPaging(queryParams);

                    return {
                        data: result['items'],
                        success: true,
                        total: result['total']
                    };
                }}
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
            />

            <ProxyInfoModal
                id={selectedRowKey}
                type="worker"
                visible={proxyInfoVisible}
                handleOk={() => {
                    setProxyInfoVisible(false);
                }}
            />
        </ConfigProvider>
    );
}

export default MyAsset;