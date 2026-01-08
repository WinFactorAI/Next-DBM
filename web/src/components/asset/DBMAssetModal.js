import { BellOutlined, DesktopOutlined } from "@ant-design/icons";
import { Collapse, Form, Input, InputNumber, Modal, Select, Space, Tabs, Tooltip, Typography } from "antd";
import i18next from "i18next";
import { useEffect, useState } from 'react';
import assetApi from "../../api/asset";
import credentialApi from "../../api/credential";
import tagApi from "../../api/tag";
import localeConfig from '../../common/localeConfig';
import { debugLog } from "../../common/logger";
import request from "../../common/request";
import MariadbIcon from "../../images/icons/mariadb.svg";
import MongodbIcon from "../../images/icons/mongodb.svg";
import MysqlIcon from "../../images/icons/mysql.svg";
import OracleIcon from "../../images/icons/oracle.svg";
import PostgreSqlIcon from "../../images/icons/postgreSQL.svg";
import RedisIcon from "../../images/icons/redis.svg";
import SqlLiteIcon from "../../images/icons/sqlLite.svg";
import SqlServerIcon from "../../images/icons/sqlServer.svg";
import arrays from "../../utils/array";
import strings from "../../utils/strings";
import './AssetModal.css';
const { TextArea } = Input;
const { Option } = Select;
const { OptGroup } = Select;
const { Text } = Typography;
const { Panel } = Collapse;

// 子级页面
// Ant form create 表单内置方法



const formLayout = {
    labelCol: { span: 6 },
    wrapperCol: { span: 16 },
};

const TELENETFormItemLayout = {
    labelCol: { span: 6 },
    wrapperCol: { span: 14 },
};

const DBMAssetModal = function ({
    visible,
    handleOk,
    handleCancel,
    confirmLoading,
    id,
    copied
}) {

    const protocolMapping = {
        'MySQL': [
            { text: i18next.t('dbAsset.from.protocolMapping-custom-label'), value: 'custom' },
            { text: i18next.t('dbAsset.from.protocolMapping-private-key-label'), value: 'private-key' },
            { text: i18next.t('dbAsset.from.protocolMapping-credential-label'), value: 'credential' },
        ],
        'MariaDB': [
            { text: i18next.t('dbAsset.from.protocolMapping-custom-label'), value: 'custom' },
            { text: i18next.t('dbAsset.from.protocolMapping-private-key-label'), value: 'private-key' },
            { text: i18next.t('dbAsset.from.protocolMapping-credential-label'), value: 'credential' },
        ],
        'PostgreSQL': [
            { text: i18next.t('dbAsset.from.protocolMapping-custom-label'), value: 'custom' },
            { text: i18next.t('dbAsset.from.protocolMapping-private-key-label'), value: 'private-key' },
            { text: i18next.t('dbAsset.from.protocolMapping-credential-label'), value: 'credential' },
        ],
        'Oracle': [
            { text: i18next.t('dbAsset.from.protocolMapping-custom-label'), value: 'custom' },
            { text: i18next.t('dbAsset.from.protocolMapping-private-key-label'), value: 'private-key' },
            { text: i18next.t('dbAsset.from.protocolMapping-credential-label'), value: 'credential' },
        ],
        'SQLServer': [
            { text: i18next.t('dbAsset.from.protocolMapping-custom-label'), value: 'custom' },
            { text: i18next.t('dbAsset.from.protocolMapping-private-key-label'), value: 'private-key' },
            { text: i18next.t('dbAsset.from.protocolMapping-credential-label'), value: 'credential' },
        ],

        'MongoDB': [
            { text: i18next.t('dbAsset.from.protocolMapping-custom-label'), value: 'custom' },
            { text: i18next.t('dbAsset.from.protocolMapping-private-key-label'), value: 'private-key' },
            { text: i18next.t('dbAsset.from.protocolMapping-credential-label'), value: 'credential' },
        ],
        'Redis': [
            { text: i18next.t('dbAsset.from.protocolMapping-custom-label'), value: 'custom' },
            { text: i18next.t('dbAsset.from.protocolMapping-private-key-label'), value: 'private-key' },
            { text: i18next.t('dbAsset.from.protocolMapping-credential-label'), value: 'credential' },
        ],
        'SQLite': [
            { text: i18next.t('dbAsset.from.protocolMapping-custom-label'), value: 'custom' },
            { text: i18next.t('dbAsset.from.protocolMapping-private-key-label'), value: 'private-key' },
            { text: i18next.t('dbAsset.from.protocolMapping-credential-label'), value: 'credential' },
        ],
        // 'ssh': [
        //     { text: i18next.t('dbAsset.from.protocolMapping-custom-label'), value: 'custom' },
        //     { text: i18next.t('dbAsset.from.protocolMapping-private-key-label'), value: 'private-key' },
        //     { text: i18next.t('dbAsset.from.protocolMapping-credential-label'), value: 'credential' },
        // ],
        // 'rdp': [{ text: i18next.t('dbAsset.from.protocolMapping-custom-label'), value: 'custom' }, { text: i18next.t('dbAsset.from.protocolMapping-credential-label'), value: 'credential' }],
        // 'vnc': [{ text: i18next.t('dbAsset.from.protocolMapping-custom-label'), value: 'custom' }, { text: i18next.t('dbAsset.from.protocolMapping-credential-label'), value: 'credential' }],
        // 'telnet': [{ text: i18next.t('dbAsset.from.protocolMapping-custom-label'), value: 'custom' }, { text: i18next.t('dbAsset.from.protocolMapping-credential-label'), value: 'credential' }]
    }
    const [form] = Form.useForm();

    let [accountType, setAccountType] = useState('custom');
    let [protocol, setProtocol] = useState('MySQL');
    let [protocolOptions, setProtocolOptions] = useState(protocolMapping['MySQL']);
    let [useSSL, setUseSSL] = useState(false);
    let [storages, setStorages] = useState([]);
    let [enableDrive, setEnableDrive] = useState(false);
    let [socksProxyEnable, setSocksProxyEnable] = useState(true);

    let [accessGateways, setAccessGateways] = useState([]);
    let [tags, setTags] = useState([]);
    let [credentials, setCredentials] = useState([]);

    const getStorages = async () => {
        const result = await request.get('/storages/shares');
        if (result.code === 1) {
            setStorages(result['data']);
        }
    }

    const [groupedData, setGroupedData] = useState([]); // 存储数据库类型数据
    const [loading, setLoading] = useState(false); // 加载状态
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

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const types = await assetApi.types();
                const groupedData = types.reduce((acc, item) => {
                    if (!acc[item.type]) {
                        acc[item.type] = [];
                    }
                    acc[item.type].push(item);
                    return acc;
                }, {});

                setGroupedData(groupedData);
            } catch (error) {
                debugLog.error('Failed to fetch data:', error);
            } finally {
                setLoading(false);
            }
        };
        const getItem = async () => {
            let asset = await assetApi.getById(id);
            if (asset) {
                asset['use-ssl'] = asset['use-ssl'] === 'true';
                asset['ignore-cert'] = asset['ignore-cert'] === 'true';
                asset['enable-drive'] = asset['enable-drive'] === 'true';
                asset['socks-proxy-enable'] = asset['socks-proxy-enable'] === 'true';
                asset['force-lossless'] = asset['force-lossless'] === 'true';
                for (let key in asset) {
                    if (asset.hasOwnProperty(key)) {
                        if (asset[key] === '-') {
                            asset[key] = '';
                        }
                    }
                }
                if (strings.hasText(asset['tags'])) {
                    asset['tags'] = asset['tags'].split(',');
                } else {
                    asset['tags'] = [];
                }
                setAccountType(asset['accountType']);
                if (asset['accountType'] === 'credential') {
                    getCredentials();
                }
                setProtocolOptions(protocolMapping[asset['protocol']]);
                setProtocol(asset['protocol']);
                setUseSSL(asset['use-ssl']);
                setEnableDrive(asset['enable-drive']);
                setSocksProxyEnable(asset['socks-proxy-enable']);
                form.setFieldsValue(asset);
            }
        }

        const getAccessGateways = async () => {
            const result = await request.get('/access-gateways');
            if (result.code === 1) {
                setAccessGateways(result['data']);
            }
        }

        const getTags = async () => {
            let tags = await tagApi.getAll();
            setTags(tags);
        }

        if (visible) {
            if (id) {
                getItem();
            }
            fetchData();
            getTags();
            getAccessGateways();
        } else {
            form.setFieldsValue({
                'accountType': accountType,
                'protocol': protocol,
                'port': 3306,
                'enable-drive': false,
                'force-lossless': false,
                'socks-proxy-enable': false,
                'ignore-cert': false,
                'use-ssl': false,
            });
        }

    }, [visible]);

    const handleProtocolChange = value => {
        // debugLog(" handleProtocolChange ",value);
        setProtocol(value)
        let port;
        switch (value) {
            case 'MySQL':
                port = 3306;
                setProtocolOptions(protocolMapping['MySQL']);
                form.setFieldsValue({ accountType: 'custom', });
                handleAccountTypeChange('custom');
                break;
            case 'MariaDB':
                port = 3306;
                setProtocolOptions(protocolMapping['MariaDB']);
                form.setFieldsValue({ accountType: 'custom', });
                handleAccountTypeChange('custom');
                break;
            case 'Oracle':
                port = 3306;
                setProtocolOptions(protocolMapping['Oracle']);
                form.setFieldsValue({ accountType: 'custom', });
                handleAccountTypeChange('custom');
                break;

            case 'SQL Server':
                port = 1433;
                setProtocolOptions(protocolMapping['SQL Server']);
                form.setFieldsValue({ accountType: 'custom', });
                handleAccountTypeChange('custom');
                break;
            case 'Redis':
                port = 6379;
                setProtocolOptions(protocolMapping['Redis']);
                form.setFieldsValue({ accountType: 'custom', });
                handleAccountTypeChange('custom');
                break;
            case 'PostgreSQL':
                port = 5432;
                setProtocolOptions(protocolMapping['PostgreSQL']);
                form.setFieldsValue({ accountType: 'custom', });
                handleAccountTypeChange('custom');
                break;
            case 'MongoDB':
                port = 27017;
                setProtocolOptions(protocolMapping['MongoDB']);
                form.setFieldsValue({ accountType: 'custom', });
                handleAccountTypeChange('custom');
                break;
            case 'SQLite':
                port = 22;
                setProtocolOptions(protocolMapping['SQLite']);
                form.setFieldsValue({ accountType: 'custom', });
                handleAccountTypeChange('custom');
                break;
            // case 'ssh':
            //     port = 22;
            //     setProtocolOptions(protocolMapping['ssh']);
            //     form.setFieldsValue({ accountType: 'custom', });
            //     handleAccountTypeChange('custom');
            //     break;
            // case 'rdp':
            //     port = 3389;
            //     setProtocolOptions(protocolMapping['rdp']);
            //     form.setFieldsValue({ accountType: 'custom', });
            //     handleAccountTypeChange('custom');
            //     break;
            // case 'vnc':
            //     port = 5900;
            //     setProtocolOptions(protocolMapping['vnc']);
            //     form.setFieldsValue({ accountType: 'custom', });
            //     handleAccountTypeChange('custom');
            //     break;
            // case 'telnet':
            //     port = 23;
            //     setProtocolOptions(protocolMapping['telnet']);
            //     form.setFieldsValue({ accountType: 'custom', });
            //     handleAccountTypeChange('custom');
            //     break;
            // case 'kubernetes':
            //     port = 6443;
            //     break
            default:
                port = 65535;
        }

        form.setFieldsValue({
            port: port,
        });
    };

    const getCredentials = async () => {
        let items = await credentialApi.getAll();
        setCredentials(items);
    }

    const handleAccountTypeChange = v => {
        setAccountType(v);
        if (v === 'credential') {
            getCredentials();
        }
    }

    const basicView = <div className='basic' style={{ marginTop: 16 }}>
        <Form.Item label={i18next.t('dbAsset.from.name-label')} name='name' rules={[{ required: true, message: i18next.t('dbAsset.from.name-rules') }]}>
            <Input placeholder={i18next.t('dbAsset.from.name-placeholder')} />
        </Form.Item>

        <Form.Item label={i18next.t('dbAsset.from.protocol-label')} name='protocol' rules={[{ required: true, message: i18next.t('dbAsset.from.protocol-rules') }]}>
            <Select style={{ width: 200 }} onChange={handleProtocolChange}>
                {/* 关系型数据库 */}
                <Select.OptGroup label={i18next.t('database.rdbms')}>
                    {groupedData.rdbms?.map((option) => (
                        <Option key={option.value} value={option.value} disabled={option.disabled}>
                            <Space align="center">
                                <span className={`db-icon-${option.icon}`}>
                                    <img src={icons[option.icon]} alt={option.icon} />
                                </span>
                                <span className={`db-text-${option.icon}`}>{option.name}</span>
                            </Space>
                        </Option>
                    ))}
                </Select.OptGroup>

                {/* 非关系型数据库 */}
                <Select.OptGroup label={i18next.t('database.nosql')}>
                    {groupedData.nosql?.map((option) => (
                        <Option key={option.value} value={option.value} disabled={option.disabled}>
                            <Space align="center">
                                <span className={`db-icon-${option.icon}`}>
                                    <img src={icons[option.icon]} alt={option.name} />
                                </span>
                                <span className={`db-text-${option.icon}`}>{option.name}</span>
                            </Space>
                        </Option>
                    ))}
                </Select.OptGroup>
            </Select>
        </Form.Item>

        <Form.Item label={i18next.t('dbAsset.from.host-label')} rules={[{ required: true, message: i18next.t('dbAsset.from.host-rules') }]}>
            <Input.Group compact>
                <Form.Item noStyle name='ip'>
                    <Input style={{ width: '80%' }} placeholder={i18next.t('dbAsset.from.host-placeholder')} />
                </Form.Item>

                <Form.Item noStyle name='port'>
                    <InputNumber style={{ width: '20%' }} min={1} max={65535} placeholder={i18next.t('dbAsset.from.port-placeholder')} />
                </Form.Item>
            </Input.Group>
        </Form.Item>


        {
            protocol === 'kubernetes' ? <>
                <Form.Item
                    name="namespace"
                    label={i18next.t('dbAsset.from.namespace-label')}
                >
                    <Input type='text' placeholder={i18next.t('dbAsset.from.namespace-placeholder')} />
                </Form.Item>

                <Form.Item
                    name="pod"
                    label="pod"
                    rules={[{ required: true, message: i18next.t('dbAsset.from.pod-rules') }]}
                >
                    <Input type='text' placeholder={i18next.t('dbAsset.from.pod-placeholder')} />
                </Form.Item>

                <Form.Item
                    name="container"
                    label={i18next.t('dbAsset.from.container-label')}
                >
                    <Input type='text' placeholder={i18next.t('dbAsset.from.container-placeholder')} />
                </Form.Item>
            </> : <>
                <Form.Item label={i18next.t('dbAsset.from.accountType-label')} name='accountType'
                    rules={[{ required: true, message: i18next.t('dbAsset.from.accountType-rules') }]}>
                    <Select onChange={handleAccountTypeChange}>
                        {protocolOptions.map(item => {
                            return (
                                <Option key={item.value} value={item.value}>{item.text}</Option>)
                        })}
                    </Select>
                </Form.Item>


                {
                    accountType === 'credential' ?
                        <>
                            <Form.Item label={i18next.t('dbAsset.from.credentialId-label')} name='credentialId'
                                rules={[{ required: true, message: i18next.t('dbAsset.from.credentialId-rules') }]}>
                                <Select onChange={() => null}>
                                    {credentials.map(item => {
                                        return (
                                            <Option key={item.id} value={item.id}>
                                                <Tooltip placement="topLeft" title={item.name}>
                                                    {item.name}
                                                </Tooltip>
                                            </Option>
                                        );
                                    })}
                                </Select>
                            </Form.Item>
                        </>
                        : null
                }

                {
                    accountType === 'custom' ?
                        <>
                            <input type='password' hidden={true} autoComplete='new-password' />
                            <Form.Item label={i18next.t('dbAsset.from.username-label')} name='username'>
                                <Input autoComplete="off" placeholder={i18next.t('dbAsset.from.username-placeholder')} />
                            </Form.Item>

                            <Form.Item label={i18next.t('dbAsset.from.password-label')} name='password'>
                                <Input.Password autoComplete="off" placeholder={i18next.t('dbAsset.from.password-placeholder')} />
                            </Form.Item>
                        </>
                        : null
                }

                {
                    accountType === 'private-key' ?
                        <>
                            <Form.Item label={i18next.t('dbAsset.from.username-label')} name='username'>
                                <Input placeholder={i18next.t('dbAsset.from.username-placeholder')} />
                            </Form.Item>

                            <Form.Item label={i18next.t('dbAsset.from.privateKey-label')} name='privateKey'
                                rules={[{ required: true, message: i18next.t('dbAsset.from.privateKey-rules') }]}>
                                <TextArea rows={4} />
                            </Form.Item>
                            <Form.Item label={i18next.t('dbAsset.from.passphrase-label')} name='passphrase'>
                                <TextArea rows={1} />
                            </Form.Item>
                        </>
                        : null
                }
            </>
        }

        <Form.Item label={i18next.t('dbAsset.from.accessGatewayId-label')} name='accessGatewayId' tooltip={i18next.t('dbAsset.from.accessGatewayId-tooltip')}>
            <Select onChange={() => null} allowClear={true}>
                {accessGateways.map(item => {
                    return (
                        <Option key={item.id} value={item.id} placeholder={i18next.t('dbAsset.from.accessGatewayId-placeholder')}>
                            <Tooltip placement="topLeft" title={item.name}>
                                {item.name}
                            </Tooltip>
                        </Option>
                    );
                })}
            </Select>
        </Form.Item>

        <Form.Item label={i18next.t('dbAsset.from.tags-label')} name='tags'>
            <Select mode="tags" placeholder={i18next.t('dbAsset.from.tags-placeholder')}>
                {tags.map(tag => {
                    if (tag === '-') {
                        return undefined;
                    }
                    return (<Option key={tag}>{tag}</Option>)
                })}
            </Select>
        </Form.Item>

        <Form.Item label={i18next.t('dbAsset.from.description-label')} name='description'>
            <TextArea rows={4} placeholder={i18next.t('dbAsset.from.description-placeholder')} />
        </Form.Item>
    </div>;

    const advancedView = <div className='advanced'>
        <Collapse
            defaultActiveKey={['socks']}
            ghost>
            <Panel header={<Text strong>Socks 代理</Text>} key="socks">

                <Form.Item label={i18next.t('dbAsset.from.socks-proxy-host-label')} name='socks-proxy-host'
                    rules={[{ required: true }]}>
                    <Input placeholder={i18next.t('dbAsset.from.socks-proxy-host-placeholder')} />
                </Form.Item>

                <Form.Item label={i18next.t('dbAsset.from.socks-proxy-port-label')} name='socks-proxy-port'
                    rules={[{ required: true }]}>
                    <InputNumber min={1} max={65535}
                        placeholder={i18next.t('dbAsset.from.socks-proxy-port-placeholder')} />
                </Form.Item>

                <input type='password' hidden={true}
                    autoComplete='new-password' />
                <Form.Item label={i18next.t('dbAsset.from.socks-proxy-username-label')} name='socks-proxy-username'>
                    <Input autoComplete="off" placeholder={i18next.t('dbAsset.from.socks-proxy-username-placeholder')} />
                </Form.Item>

                <Form.Item label={i18next.t('dbAsset.from.socks-proxy-password-label')} name='socks-proxy-password'>
                    <Input.Password autoComplete="off"
                        placeholder={i18next.t('dbAsset.from.socks-proxy-password-placeholder')} />
                </Form.Item>
            </Panel>
        </Collapse>
    </div>;

    const [webhookOptions, setWebhookOptions] = useState([]);
    const getWebhookOptions = async (action) => {
        // let params = {
        //     pageIndex: 1,
        //     pageSize: 100,
        //     serviceType: "asset",
        // }
        // const res = await webhookApi.getPaging(params);

        // const items = Array.isArray(res?.items) ? res.items : [];

        // debugLog(" webhook items 1 ", items)
        // setWebhookOptions(items)
    }
    useEffect(() => {
        getWebhookOptions()
    }, []);
    const webhookView = <div className='basic' style={{ marginTop: 16 }}>
        <Form.Item label={i18next.t('build.modal.tabs.webhook.label')} name='webhookId'>
            <Select
                placeholder={i18next.t('webhook.form.placeholder.actions')}
                options={webhookOptions?.map(item => ({ value: item.id, label: item.name }))}
                allowClear
            />
        </Form.Item>
    </div>

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

        <Modal
            key={`modal-${i18next.language}-${i18nVersion}`}
            className={'dbm-modal'}
            title={id && copied === false ? i18next.t('dbAsset.from.title-updateDBAsset') : i18next.t('dbAsset.from.title-createDBAsset')}
            visible={visible}
            maskClosable={false}
            destroyOnClose={true}
            centered
            width={700}
            onOk={() => {
                form
                    .validateFields()
                    .then(async values => {
                        if (copied === true) {
                            values['id'] = undefined;
                        }
                        debugLog(values['tags'], arrays.isEmpty(values['tags']))
                        if (!arrays.isEmpty(values['tags'])) {
                            values.tags = values['tags'].join(',');
                        } else {
                            values.tags = '';
                        }
                        form.resetFields();
                        await handleOk(values);
                    });
            }}
            onCancel={() => {
                form.resetFields();
                handleCancel();
            }}
            confirmLoading={confirmLoading}
            okText={i18next.t('common.ok')}
            cancelText={i18next.t('common.cancel')}
        >

            <Form form={form} {...formLayout}>
                <Form.Item name='id' noStyle>
                    <Input hidden={true} />
                </Form.Item>

                <Tabs
                    defaultActiveKey="basic"
                    items={[
                        {
                            label: <span><DesktopOutlined />{i18next.t('dbAsset.from.tabs-label')}</span>,
                            key: 'basic',
                            children: basicView,
                        },
                        {
                            label: <span><BellOutlined />{i18next.t('build.modal.tabs.webhook')}</span>,
                            key: 'webhook',
                            children: webhookView,
                        },
                        // {
                        //     label: <span><ControlOutlined/>高级配置</span>,
                        //     key: 'advanced',
                        //     children: advancedView,
                        // },
                    ]}
                />

            </Form>
        </Modal>
    )
}

export default DBMAssetModal;
