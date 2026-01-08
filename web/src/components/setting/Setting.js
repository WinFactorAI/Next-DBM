import { InfoCircleOutlined, QuestionCircleOutlined, SyncOutlined } from '@ant-design/icons';
import { Badge, Button, Collapse, Descriptions, Form, Input, message, Select, Space, Switch, Tabs, Tooltip, Typography } from "antd";
import dayjs from "dayjs";
import i18next from 'i18next';
import React, { Component } from 'react';
import brandingApi from "../../api/branding";
import { GetLicense, GetMachineId } from "../../api/license";
import { server } from "../../common/env";
import { debugLog } from "../../common/logger";
import request from "../../common/request";
import { download, getToken, ND_PACKAGE, ND_UPGRADE } from "../../utils/utils";
let _package = ND_PACKAGE();
let _upgrade = ND_UPGRADE();
const { Paragraph } = Typography;
const { TextArea } = Input;
const { Panel } = Collapse;
const { Option } = Select;
const { TabPane } = Tabs;
const { Title } = Typography;

const formItemLayout = {
    labelCol: { span: 12 },
    wrapperCol: { span: 12 },
};

const formTailLayout = {
    labelCol: { span: 12 },
    wrapperCol: { span: 12 },
};

class Setting extends Component {

    state = {
        key: 0,
        refs: [],
        properties: {},
        ldapUserSyncLoading: false,
        license: {
            name: '免费版',
            expired: undefined
        },
        machineId: '',
        isDownload: false,
        showProgress: false,
        progress: 0,
        proxyMysqlServer: false,
        proxyMariaDBServer: false,
        proxyPostgreServer: false,
        proxyOracleServer: false,
        proxySqlServerServer: false,
        proxyRedisServer: false,

        buttonLoading: false,
        showDot: false,
        versionInfo: {
            version: '',
            detail: '',
            downUrl: '',
        },
        langFields: [{
            key: 'zh-CN',
            name: '简体中文',
            type: 'default'
        }, {
            key: 'en-US',
            name: 'English',
            type: 'default'
        }],
        langs: [],
        branding: {}
    }


    rdpSettingFormRef = React.createRef();
    sshSettingFormRef = React.createRef();
    vncSettingFormRef = React.createRef();
    guacdSettingFormRef = React.createRef();
    mailSettingFormRef = React.createRef();
    logSettingFormRef = React.createRef();
    ldapSettingFormRef = React.createRef();
    otherSettingFormRef = React.createRef();
    proxySettingFormRef = React.createRef();
    aiSettingFormRef = React.createRef();
    langSettingFormRef = React.createRef();

    handleLanguageChange = () => {
        this.setState({ key: this.state.key + 1 }); // 强制触发更新
    }
    componentDidMount() {
        // eslint-disable-next-line no-extend-native
        String.prototype.bool = function () {
            return (/^true$/i).test(this);
        };

        this.setState({
            refs: [
                this.rdpSettingFormRef,
                this.sshSettingFormRef,
                this.vncSettingFormRef,
                this.guacdSettingFormRef,
                this.mailSettingFormRef,
                this.logSettingFormRef,
                this.ldapSettingFormRef,
                this.otherSettingFormRef,
                this.proxySettingFormRef,
                this.aiSettingFormRef,
                this.langSettingFormRef
            ]
        }, this.getProperties)

        i18next.on('languageChanged', this.handleLanguageChange);
    }
    componentWillUnmount() {
        i18next.off('languageChanged', this.handleLanguageChange);
    }
    changeProperties = async (values) => {
        values.langFields = JSON.stringify(values.langFields);
        let result = await request.put('/properties', values);
        if (result.code === 1) {
            message.success('修改成功');
        } else {
            message.error(result.message);
        }
    }

    getProperties = async () => {

        let result = await request.get('/properties');
        if (result['code'] === 1) {
            let properties = result['data'];

            for (let key in properties) {
                if (!properties.hasOwnProperty(key)) {
                    continue;
                }
                if (properties[key] === '-') {
                    properties[key] = '';
                }
                if (key.startsWith('enable') || key.startsWith("disable" || key === 'swap-red-blue')) {
                    properties[key] = properties[key].bool();
                }
            }

            this.setState({
                properties: properties
            })

            for (let ref of this.state.refs) {
                if (ref.current) {
                    ref.current.setFieldsValue(properties)
                }
            }
            // console.log(" this.langSettingFormRef.current?.getFieldValue() ",this.langSettingFormRef.current?.getFieldValue())
            if (!properties.langFields) {
                this.langSettingFormRef.current?.setFieldsValue({ langFields: this.state.langFields });
                this.state.langs = this.state.langFields
            } else {
                this.langSettingFormRef.current?.setFieldsValue({ langFields: JSON.parse(properties.langFields) });
                this.state.langs = JSON.parse(properties.langFields)
            }

        } else {
            message.error(result['message']);
        }
        this.checkVersion();
        let branding = await brandingApi.getBranding();
        this.setState({
            branding: branding
        })
    }
    // mysql server
    startMysqlServer = async (port) => {
        this.setState({ buttonLoading: true });
        setTimeout(() => {
            this.setState({
                buttonLoading: false,
            });
        }, 2000);
        let result = await request.get('/properties/mysqlServer/start/' + port);
        if (result['code'] === 1) {
            message.success('启动成功');
        }
        this.statusMysqlServer();
    }
    stopMysqlServer = async () => {
        this.setState({ buttonLoading: true });
        setTimeout(() => {
            this.setState({
                buttonLoading: false,
            });
        }, 2000);
        let result = await request.get('/properties/mysqlServer/stop');
        if (result['code'] === 1) {
            message.success('停止成功');
        }
        this.statusMysqlServer();
    }
    statusMysqlServer = async () => {
        let result = await request.get('/properties/mysqlServer/status');
        if (result['code'] === 1) {
            // message.success('状态成功');
            this.setState({
                proxyMysqlServer: result['data']
            })
        }
    }
    // MariaDB server
    startMariaDBServer = async (port) => {
        this.setState({ buttonLoading: true });
        setTimeout(() => {
            this.setState({
                buttonLoading: false,
            });
        }, 2000);
        let result = await request.get('/properties/mariaDBServer/start/' + port);
        if (result['code'] === 1) {
            message.success('启动成功');
        }
        this.statusMariaDBServer();
    }
    stopMariaDBServer = async () => {
        this.setState({ buttonLoading: true });
        setTimeout(() => {
            this.setState({
                buttonLoading: false,
            });
        }, 2000);
        let result = await request.get('/properties/mariaDBServer/stop');
        if (result['code'] === 1) {
            message.success('停止成功');
        }
        this.statusMariaDBServer();
    }
    statusMariaDBServer = async () => {
        let result = await request.get('/properties/mariaDBServer/status');
        if (result['code'] === 1) {
            // message.success('状态成功');
            this.setState({
                proxyMariaDBServer: result['data']
            })
        }
    }
    // postgreSql server
    startPostgreServer = async (port) => {
        this.setState({ buttonLoading: true });
        setTimeout(() => {
            this.setState({
                buttonLoading: false,
            });
        }, 2000);
        let result = await request.get('/properties/postgreServer/start/' + port);
        if (result['code'] === 1) {
            message.success('启动成功');
        }
        this.statusPostgreServer();
    }
    stopPostgreServer = async () => {
        this.setState({ buttonLoading: true });
        setTimeout(() => {
            this.setState({
                buttonLoading: false,
            });
        }, 2000);
        let result = await request.get('/properties/postgreServer/stop');
        if (result['code'] === 1) {
            message.success('停止成功');
        }
        this.statusPostgreServer();
    }
    statusPostgreServer = async () => {
        let result = await request.get('/properties/postgreServer/status');
        if (result['code'] === 1) {
            // message.success('状态成功');
            this.setState({
                proxyPostgreServer: result['data']
            })
        }
    }

    // Oracle server
    startOracleServer = async (port) => {
        this.setState({ buttonLoading: true });
        setTimeout(() => {
            this.setState({
                buttonLoading: false,
            });
        }, 2000);
        let result = await request.get('/properties/oracleServer/start/' + port);
        if (result['code'] === 1) {
            message.success('启动成功');
        }
        this.statusOracleServer();
    }
    stopOracleServer = async () => {
        this.setState({ buttonLoading: true });
        setTimeout(() => {
            this.setState({
                buttonLoading: false,
            });
        }, 2000);
        let result = await request.get('/properties/oracleServer/stop');
        if (result['code'] === 1) {
            message.success('停止成功');
        }
        this.statusOracleServer();
    }
    statusOracleServer = async () => {
        let result = await request.get('/properties/oracleServer/status');
        if (result['code'] === 1) {
            // message.success('状态成功');
            this.setState({
                proxyOracleServer: result['data']
            })
        }
    }

    // SqlServer server
    startSqlServerServer = async (port) => {
        this.setState({ buttonLoading: true });
        setTimeout(() => {
            this.setState({
                buttonLoading: false,
            });
        }, 2000);
        let result = await request.get('/properties/sqlServerServer/start/' + port);
        if (result['code'] === 1) {
            message.success('启动成功');
        }
        this.statusSqlServerServer();
    }
    stopSqlServerServer = async () => {
        this.setState({ buttonLoading: true });
        setTimeout(() => {
            this.setState({
                buttonLoading: false,
            });
        }, 2000);
        let result = await request.get('/properties/sqlServerServer/stop');
        if (result['code'] === 1) {
            message.success('停止成功');
        }
        this.statusSqlServerServer();
    }
    statusSqlServerServer = async () => {
        let result = await request.get('/properties/sqlServerServer/status');
        if (result['code'] === 1) {
            // message.success('状态成功');
            this.setState({
                proxySqlServerServer: result['data']
            })
        }
    }

    // Redis server
    startRedisServer = async (port) => {
        this.setState({ buttonLoading: true });
        setTimeout(() => {
            this.setState({
                buttonLoading: false,
            });
        }, 2000);
        let result = await request.get('/properties/redisServer/start/' + port);
        if (result['code'] === 1) {
            message.success('启动成功');
        }
        this.statusRedisServer();
    }
    stopRedisServer = async () => {
        this.setState({ buttonLoading: true });
        setTimeout(() => {
            this.setState({
                buttonLoading: false,
            });
        }, 2000);
        let result = await request.get('/properties/redisServer/stop');
        if (result['code'] === 1) {
            message.success('停止成功');
        }
        this.statusRedisServer();
    }
    statusRedisServer = async () => {
        let result = await request.get('/properties/redisServer/status');
        if (result['code'] === 1) {
            // message.success('状态成功');
            this.setState({
                proxyRedisServer: result['data']
            })
        }
    }


    handleOnTabChange = (key) => {
        if (key === 'license') {
            this.getMachineId();
            this.getLicense();
        } if (key === 'proxy') {
            this.getProperties();

            this.statusMysqlServer();
            this.statusMariaDBServer();
            this.statusPostgreServer();
            this.statusOracleServer();
            this.statusSqlServerServer();
            this.statusRedisServer();
        } else {
            this.getProperties();
        }
    }

    getLicense = async () => {
        let data = await GetLicense();
        if (data) {
            this.setState({
                license: data
            })
        }
    }

    getMachineId = async () => {
        let data = await GetMachineId();
        this.setState({
            machineId: data
        })
    }

    handleImport = () => {
        let files = window.document.getElementById('file-upload').files;
        if (files.length === 0) {
            return;
        }

        const reader = new FileReader();
        reader.onload = async () => {
            let backup = JSON.parse(reader.result.toString());
            this.setState({
                importBtnLoading: true
            })
            try {
                let result = await request.post('/backup/import', backup);
                if (result['code'] === 1) {
                    message.success('恢复成功', 3);
                } else {
                    message.error(result['message'], 10);
                }
            } finally {
                this.setState({
                    importBtnLoading: false
                })
                window.document.getElementById('file-upload').value = "";
            }
        };
        reader.readAsText(files[0]);
    }

    handleImportTranslations = () => {
        let files = window.document.getElementById('file-upload-translations').files;
        if (files.length === 0) {
            return;
        }

        const reader = new FileReader();
        reader.onload = async () => {
            let translations = JSON.parse(reader.result.toString());
            this.setState({
                importBtnLoading: true
            })
            try {
                let result = await request.post('/translations/import', translations);
                if (result['code'] === 1) {
                    message.success('导入国际化成功', 3);
                } else {
                    message.error(result['message'], 10);
                }
            } finally {
                this.setState({
                    importBtnLoading: false
                })
                window.document.getElementById('file-upload-translations').value = "";
            }
        };
        reader.readAsText(files[0]);
    }

    ldapUserSync = async () => {
        const id = 'ldap-user-sync'
        try {
            this.setState({
                ldapUserSyncLoading: true
            });
            message.info({ content: '同步中...', key: id, duration: 5 });
            let result = await request.post(`/properties/ldap-user-sync`);
            if (result.code !== 1) {
                message.error({ content: result.message, key: id, duration: 10 });
                return;
            }
            message.success({ content: '同步成功。', key: id, duration: 3 });
        } finally {
            this.setState({
                ldapUserSyncLoading: false
            });
        }
    }

    handleImportLicense = () => {
        let files = window.document.getElementById('import-license').files;
        if (files.length === 0) {
            return;
        }
        let file = files[0];
        const reader = new FileReader();
        reader.onload = async () => {
            // 当读取完成时，内容只在`reader.result`中
            let license = reader.result;
            debugLog(" license ", license)
            let result = await request.post('/license', { 'license': license });
            if (result['code'] !== 1) {
                message.error(result['message']);
            } else {
                this.getLicense();
            }
        };
        reader.readAsText(file, 'utf-8');
    }

    handleDownloadUpgrade = () => {
        // download('/upgrade');
        this.setState({
            isDownload: true
        })
    }
    checkVersion = async () => {
        let result = await request.get('/properties/app/checkVersion');
        if (result['code'] === 1) {
            this.setState({
                versionInfo: result['data']
            })
        }
    }
    handleUpgrade = async (isProcessing) => {
        this.setState({
            showProgress: isProcessing
        })
        if (isProcessing) {
            // 定时器{i18next.t('settings.base.updateButton')}进度
            await request.get('/properties/app/upgrade');
            var upgradeMsg = message.info('开始升级,系统自动重启,请稍后...', 0);
            this.upgradeTimer = setInterval(() => {
                if (this.state.versionInfo.version === this.state.branding.version) {
                    clearInterval(this.upgradeTimer);
                    this.setState({
                        showProgress: false
                    })
                    message.success('更新成功', 3);
                    upgradeMsg.close();
                }
                this.checkVersion();
            }, 1000);
        }
    };
    render() {

        const renderType = (type) => {
            switch (type) {
                case 'free':
                    return '企业版';
                case 'test':
                    return '测试版';
                case 'vip':
                    return '会员版';
                case 'pro':
                    return '专业版';
                case 'enterprise':
                    return '企业版';
                default:
                    return type;
            }
        }

        const renderCount = (count) => {
            if (count <= 0) {
                return '无限制';
            }
            return count;
        }

        const renderTime = (timeStr) => {
            // 解析时间字符串并转换为时间戳（毫秒）
            const timestampMs = dayjs(timeStr, 'YYYY-MM-DD HH:mm:ss').valueOf();
            // 如果需要转换为秒，可以除以 1000
            const time = timestampMs / 1000;
            if (!time) {
                return '-';
            }
            if (time < 0) {
                return '永久授权';
            }
            let suffix = '';
            let color = '';
            if (new Date().getTime() > time * 1000) {
                suffix = <span style={{ color: 'red' }}>已过期</span>;
                color = 'red';
            } else {
                suffix = <span style={{ color: 'green' }}>正常可用</span>;
                color = 'green';
            }
            return <>
                <span style={{ color: color }}>{dayjs.unix(time).format('YYYY-MM-DD HH:mm:ss')}</span>
                &nbsp;{suffix}
            </>;
        }

        const restart = async () => {
            await request.get('/properties/app/restart');
            const restartMsg = message.info({ content: '请耐心等待,重启中...', duration: 0 });
            //启动定时器检查
            this.timer = setInterval(async () => {
                let status = await request.get('/properties/app/status');
                if (status['code'] === 1) {
                    clearInterval(this.timer);
                    restartMsg();
                    message.success('启动成功');
                }
            }, 1000)
        }
        const stop = async () => {
            await request.get('/properties/app/stop');
            message.success({ content: '停止运行成功，请手动关闭窗口。', duration: 0 });
        }


        return (
            <div className="page-container-white">
                <Tabs tabPosition={'top'} onChange={this.handleOnTabChange} key={this.state.key} >
                    <TabPane tab={i18next.t('settings.base.title')} key="base">
                        <Title level={4}>{i18next.t('settings.base.title')}</Title>
                        <Descriptions title="" column={1}>
                            <Descriptions.Item label={i18next.t('settings.base.hint-label')}>{i18next.t('settings.base.hint')}</Descriptions.Item>
                        </Descriptions>
                        <Form ref={this.guacdSettingFormRef} name="base" onFinish={this.changeProperties}
                            layout="vertical">
                            <Form.Item
                                {...formItemLayout}
                                name="host"
                                label={i18next.t('settings.base.siteDomain')}
                                initialValue=""
                            >
                                <Input type='text' placeholder={i18next.t('settings.base.domainPlaceholder')} />
                            </Form.Item>

                            <Form.Item
                                {...formItemLayout}
                                name="default-language"
                                label={i18next.t('settings.base.defaultLanguage')}
                                initialValue={this.state.properties['default-language']}
                            >
                                <Select onChange={(lang) => {
                                    localStorage.setItem('language', lang);
                                    // i18n.changeLanguage(lang);
                                }}>
                                    {this.state.langs.map(lang => (
                                        <Option value={lang.key}>{lang.name}</Option>
                                    ))}
                                </Select>
                            </Form.Item>

                            <Form.Item
                                {...formItemLayout}
                                name="default-theme"
                                label={i18next.t('settings.base.defaultTheme')}
                                initialValue={this.state.properties['default-theme']}
                            >
                                <Select onChange={(themeKey) => {
                                    const root = document.documentElement; // 获取根元素
                                    root.setAttribute('data-theme', themeKey);

                                    const themeColorMeta = document.querySelector('meta[name="theme-color"]');
                                    if (themeColorMeta) {
                                        if (themeKey === 'default') {
                                            themeColorMeta.setAttribute('content', '#433bbb');
                                        } else if (themeKey === 'light') {
                                            themeColorMeta.setAttribute('content', '#ffffff');
                                        } else {
                                            themeColorMeta.setAttribute('content', '#000000');
                                        }
                                    }
                                    localStorage.setItem('theme', themeKey);
                                }}>
                                    <Option value="default">{i18next.t('settings.base.lightTheme')}</Option>
                                    {/* <Option value="light">亮色</Option> */}
                                    <Option value="dark">{i18next.t('settings.base.darkTheme')}</Option>
                                </Select>
                            </Form.Item>
                            <Form.Item {...formTailLayout}>
                                <Button type="primary" htmlType="submit">
                                    {i18next.t('settings.base.updateButton')}
                                </Button>
                            </Form.Item>
                        </Form>

                        <Title level={4}>{i18next.t('settings.restart.title')}</Title>
                        <Descriptions title="" column={1}>
                            <Descriptions.Item label={i18next.t('settings.base.hint-label')}>{i18next.t('settings.restart.hint')}</Descriptions.Item>
                        </Descriptions>
                        <Space>
                            <Button onClick={() => { restart() }}>
                                {i18next.t('settings.restart.restartButton')}
                            </Button>
                            <Button onClick={() => { stop() }}>
                                {i18next.t('settings.restart.stopButton')}
                            </Button>
                        </Space>


                    </TabPane>

                    <TabPane tab={i18next.t('settings.proxy.title')} key="proxy">
                        <Title level={4}>{i18next.t('settings.proxy.title')}</Title>
                        <Descriptions title="" column={1}>
                            <Descriptions.Item label={i18next.t('settings.base.hint-label')}>{i18next.t('settings.proxy.hint')}</Descriptions.Item>
                        </Descriptions>
                        <Form ref={this.proxySettingFormRef} name="guacd" onFinish={this.changeProperties} layout="vertical">
                            <Form.Item
                                {...formItemLayout}
                                name="proxy-ip-gateway"
                                label={
                                    <span>
                                        {i18next.t('settings.proxy.gatewayIP')}
                                        <Tooltip title={i18next.t('settings.proxy.gatewayIPHelp')}>
                                            <QuestionCircleOutlined
                                                style={{ marginLeft: 6, color: '#999', cursor: 'pointer' }}
                                            />
                                        </Tooltip>
                                    </span>
                                }
                                initialValue=""
                            >
                                <Input type='text' placeholder={i18next.t('settings.proxy.gatewayIPPlaceholder')} />
                            </Form.Item>
                            <Collapse accordion className='settingServer' defaultActiveKey={['mysqlServer', 'MariaDBServer', 'postgreServer', 'oracleServer', 'sqlServerServer', 'redisServer']} style={{ marginBottom: '20px' }}>
                                <Panel header={
                                    <Space>
                                        MysqlServer
                                        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', color: this.state.proxyMysqlServer ? 'green' : 'red', }}>
                                            <SyncOutlined spin={this.state.proxyMysqlServer} />
                                        </div>
                                        <div style={{ color: this.state.proxyMysqlServer ? 'green' : 'red', }}>
                                            {this.state.proxyMysqlServer ? i18next.t('settings.proxy.running') : i18next.t('settings.proxy.stopped')}
                                        </div>
                                    </Space>
                                } key="mysqlServer">
                                    <Form.Item {...formItemLayout} label={
                                        <span>
                                            {i18next.t('settings.proxy.serviceStatus')}
                                            <Tooltip title={i18next.t('settings.proxy.serviceStatusHelp')}>
                                                <QuestionCircleOutlined
                                                    style={{ marginLeft: 6, color: '#999', cursor: 'pointer' }}
                                                />
                                            </Tooltip>
                                        </span>
                                    }>
                                        <Space>
                                            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', color: this.state.proxyMysqlServer ? 'green' : 'red', }}>
                                                <SyncOutlined spin={this.state.proxyMysqlServer} />
                                            </div>
                                            <div style={{ color: this.state.proxyMysqlServer ? 'green' : 'red', }}>
                                                {this.state.proxyMysqlServer ? i18next.t('settings.proxy.running') : i18next.t('settings.proxy.stopped')}
                                            </div>
                                            <Space>
                                                {this.state.proxyMysqlServer ? (
                                                    <Button type="dashed" onClick={() => {
                                                        this.stopMysqlServer()
                                                    }} size='small'
                                                        loading={this.state.buttonLoading}
                                                        disabled={this.state.buttonLoading}
                                                    >
                                                        {i18next.t('settings.proxy.stopButton')}
                                                    </Button>
                                                ) : (
                                                    <Button type="primary" onClick={() => {
                                                        this.startMysqlServer(this.guacdSettingFormRef.current.getFieldValue('mysql-proxy-port'))
                                                    }} size='small'
                                                        loading={this.state.buttonLoading}
                                                        disabled={this.state.buttonLoading}
                                                    >
                                                        {i18next.t('settings.proxy.startButton')}
                                                    </Button>
                                                )}
                                            </Space>
                                        </Space>
                                    </Form.Item>
                                    <Form.Item
                                        {...formItemLayout}
                                        name="mysql-proxy-port"
                                        label={
                                            <span>
                                                {i18next.t('settings.proxy.localPort')}
                                                <Tooltip title={i18next.t('settings.proxy.localPortHelp')}>
                                                    <QuestionCircleOutlined
                                                        style={{ marginLeft: 6, color: '#999', cursor: 'pointer' }}
                                                    />
                                                </Tooltip>
                                            </span>
                                        }
                                        initialValue={3307}
                                        rules={[
                                            {
                                                required: true,
                                            },
                                        ]}
                                    >
                                        <Input type='text' placeholder={i18next.t('settings.proxy.localPortPlaceholder')} />
                                    </Form.Item>
                                    <Form.Item
                                        {...formItemLayout}
                                        name="mysql-proxy-port-gateway"
                                        label={
                                            <span>
                                                {i18next.t('settings.proxy.gatewayPort')}
                                                <Tooltip title={i18next.t('settings.proxy.gatewayPortHelp')}>
                                                    <QuestionCircleOutlined
                                                        style={{ marginLeft: 6, color: '#999', cursor: 'pointer' }}
                                                    />
                                                </Tooltip>
                                            </span>
                                        }
                                        initialValue="3307"
                                    >
                                        <Input type='text' placeholder={i18next.t('settings.proxy.gatewayPortPlaceholder')} />
                                    </Form.Item>
                                    <Form.Item
                                        {...formItemLayout}
                                        name="enable-auto-start-mysql"
                                        label={
                                            <span>
                                                {i18next.t('settings.proxy.autoStart')}
                                                <Tooltip title={i18next.t('settings.proxy.autoStartHelp')}>
                                                    <QuestionCircleOutlined
                                                        style={{ marginLeft: 6, color: '#999', cursor: 'pointer' }}
                                                    />
                                                </Tooltip>
                                            </span>
                                        }
                                        valuePropName="checked"
                                        rules={[
                                            {
                                                required: false,
                                            },
                                        ]}
                                    >
                                        <Switch checkedChildren={i18next.t('settings.proxy.autoStartStart')} unCheckedChildren={i18next.t('settings.proxy.autoStartStop')} onChange={(checked) => {
                                            this.setState({
                                                properties: {
                                                    ...this.state.properties,
                                                    'enable-auto-start-mysql': checked ? "true" : "false",
                                                }
                                            })
                                        }} />
                                    </Form.Item>

                                </Panel>
                                <Panel header={
                                    <Space>
                                        MariaDBServer
                                        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', color: this.state.proxyMariaDBServer ? 'green' : 'red', }}>
                                            <SyncOutlined spin={this.state.proxyMariaDBServer} />
                                        </div>
                                        <div style={{ color: this.state.proxyMariaDBServer ? 'green' : 'red', }}>
                                            {this.state.proxyMariaDBServer ? i18next.t('settings.proxy.running') : i18next.t('settings.proxy.stopped')}
                                        </div>
                                    </Space>
                                } key="MariaDBServer">
                                    <Form.Item {...formItemLayout} label={i18next.t('settings.proxy.serviceStatus')}>
                                        <Space>
                                            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', color: this.state.proxyMariaDBServer ? 'green' : 'red', }}>
                                                <SyncOutlined spin={this.state.proxyMariaDBServer} />
                                            </div>
                                            <div style={{ color: this.state.proxyMariaDBServer ? 'green' : 'red', }}>
                                                {this.state.proxyMariaDBServer ? i18next.t('settings.proxy.running') : i18next.t('settings.proxy.stopped')}
                                            </div>
                                            <Space>
                                                {this.state.proxyMariaDBServer ? (
                                                    <Button type="dashed" onClick={() => {
                                                        this.stopMariaDBServer()
                                                    }} size='small'
                                                        loading={this.state.buttonLoading}
                                                        disabled={this.state.buttonLoading}
                                                    >
                                                        {i18next.t('settings.proxy.stopButton')}
                                                    </Button>
                                                ) : (
                                                    <Button type="primary" onClick={() => {
                                                        this.startMariaDBServer(this.guacdSettingFormRef.current.getFieldValue('mariadb-proxy-port'))
                                                    }} size='small'
                                                        loading={this.state.buttonLoading}
                                                        disabled={this.state.buttonLoading}
                                                    >
                                                        {i18next.t('settings.proxy.startButton')}
                                                    </Button>
                                                )}
                                            </Space>
                                        </Space>
                                    </Form.Item>
                                    <Form.Item
                                        {...formItemLayout}
                                        name="mariadb-proxy-port"
                                        label={i18next.t('settings.proxy.localPort')}
                                        initialValue={3308}
                                        rules={[
                                            {
                                                required: true,
                                            },
                                        ]}
                                    >
                                        <Input type='text' placeholder={i18next.t('settings.proxy.localPortPlaceholder')} />
                                    </Form.Item>
                                    <Form.Item
                                        {...formItemLayout}
                                        name="mariadb-proxy-port-gateway"
                                        label={i18next.t('settings.proxy.gatewayPort')}
                                        initialValue="3307"
                                    >
                                        <Input type='text' placeholder={i18next.t('settings.proxy.gatewayPortPlaceholder')} />
                                    </Form.Item>
                                    <Form.Item
                                        {...formItemLayout}
                                        name="enable-auto-start-mariadb"
                                        label={i18next.t('settings.proxy.autoStart')}
                                        valuePropName="checked"
                                        rules={[
                                            {
                                                required: false,
                                            },
                                        ]}
                                    >
                                        <Switch checkedChildren={i18next.t('settings.proxy.autoStartStart')} unCheckedChildren={i18next.t('settings.proxy.autoStartStop')} onChange={(checked) => {
                                            this.setState({
                                                properties: {
                                                    ...this.state.properties,
                                                    'enable-auto-start-mariadb': checked ? "true" : "false",
                                                }
                                            })
                                        }} />
                                    </Form.Item>

                                </Panel>
                                <Panel header={
                                    <Space>
                                        PostgreServer
                                        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', color: this.state.proxyPostgreServer ? 'green' : 'red', }}>
                                            <SyncOutlined spin={this.state.proxyPostgreServer} />
                                        </div>
                                        <div style={{ color: this.state.proxyPostgreServer ? 'green' : 'red', }}>
                                            {this.state.proxyPostgreServer ? i18next.t('settings.proxy.running') : i18next.t('settings.proxy.stopped')}
                                        </div>
                                    </Space>
                                } key="postgreServer">
                                    <Form.Item {...formItemLayout} label={i18next.t('settings.proxy.serviceStatus')}>
                                        <Space>
                                            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', color: this.state.proxyPostgreServer ? 'green' : 'red', }}>
                                                <SyncOutlined spin={this.state.proxyPostgreServer} />
                                            </div>
                                            <div style={{ color: this.state.proxyPostgreServer ? 'green' : 'red', }}>
                                                {this.state.proxyPostgreServer ? i18next.t('settings.proxy.running') : i18next.t('settings.proxy.stopped')}
                                            </div>
                                            <Space>
                                                {this.state.proxyPostgreServer ? (
                                                    <Button type="dashed" onClick={() => {
                                                        this.stopPostgreServer()
                                                    }} size='small'
                                                        loading={this.state.buttonLoading}
                                                        disabled={this.state.buttonLoading}
                                                    >
                                                        {i18next.t('settings.proxy.stopButton')}
                                                    </Button>
                                                ) : (
                                                    <Button type="primary" onClick={() => {
                                                        this.startPostgreServer(this.guacdSettingFormRef.current.getFieldValue('postgresql-proxy-port'))
                                                    }} size='small'
                                                        loading={this.state.buttonLoading}
                                                        disabled={this.state.buttonLoading}
                                                    >
                                                        {i18next.t('settings.proxy.startButton')}
                                                    </Button>
                                                )}
                                            </Space>
                                        </Space>
                                    </Form.Item>
                                    <Form.Item
                                        {...formItemLayout}
                                        name="postgresql-proxy-port"
                                        label={i18next.t('settings.proxy.localPort')}
                                        initialValue={5433}
                                        rules={[
                                            {
                                                required: true,
                                            },
                                        ]}
                                    >
                                        <Input type='text' placeholder={i18next.t('settings.proxy.localPortPlaceholder')} />
                                    </Form.Item>
                                    <Form.Item
                                        {...formItemLayout}
                                        name="postgresql-proxy-port-gateway"
                                        label={i18next.t('settings.proxy.gatewayPort')}
                                        initialValue="5434"
                                    >
                                        <Input type='text' placeholder={i18next.t('settings.proxy.gatewayPortPlaceholder')} />
                                    </Form.Item>
                                    <Form.Item
                                        {...formItemLayout}
                                        name="enable-auto-start-postgre"
                                        label={i18next.t('settings.proxy.autoStart')}
                                        valuePropName="checked"
                                        rules={[
                                            {
                                                required: false,
                                            },
                                        ]}
                                    >
                                        <Switch checkedChildren={i18next.t('settings.proxy.autoStartStart')} unCheckedChildren={i18next.t('settings.proxy.autoStartStop')} onChange={(checked) => {
                                            this.setState({
                                                properties: {
                                                    ...this.state.properties,
                                                    'enable-auto-start-postgre': checked ? "true" : "false",
                                                }
                                            })
                                        }} />
                                    </Form.Item>

                                </Panel>
                                <Panel header={
                                    <Space>
                                        OracleServer
                                        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', color: this.state.proxyOracleServer ? 'green' : 'red', }}>
                                            <SyncOutlined spin={this.state.proxyOracleServer} />
                                        </div>
                                        <div style={{ color: this.state.proxyOracleServer ? 'green' : 'red', }}>
                                            {this.state.proxyOracleServer ? i18next.t('settings.proxy.running') : i18next.t('settings.proxy.stopped')}
                                        </div>
                                    </Space>
                                } key="oracleServer">
                                    <Form.Item {...formItemLayout} label={i18next.t('settings.proxy.serviceStatus')}>
                                        <Space>
                                            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', color: this.state.proxyMysqlServer ? 'green' : 'red', }}>
                                                <SyncOutlined spin={this.state.proxyOracleServer} />
                                            </div>
                                            <div style={{ color: this.state.proxyOracleServer ? 'green' : 'red', }}>
                                                {this.state.proxyOracleServer ? i18next.t('settings.proxy.running') : i18next.t('settings.proxy.stopped')}
                                            </div>
                                            <Space>
                                                {this.state.proxyOracleServer ? (
                                                    <Button type="dashed" onClick={() => {
                                                        this.stopOracleServer()
                                                    }} size='small'
                                                        loading={this.state.buttonLoading}
                                                        disabled={this.state.buttonLoading}
                                                    >
                                                        {i18next.t('settings.proxy.stopButton')}
                                                    </Button>
                                                ) : (
                                                    <Button type="primary" onClick={() => {
                                                        this.startOracleServer(this.guacdSettingFormRef.current.getFieldValue('oracle-proxy-port'))
                                                    }} size='small'
                                                        loading={this.state.buttonLoading}
                                                        disabled={this.state.buttonLoading}
                                                    >
                                                        {i18next.t('settings.proxy.startButton')}
                                                    </Button>
                                                )}
                                            </Space>
                                        </Space>
                                    </Form.Item>
                                    <Form.Item
                                        {...formItemLayout}
                                        name="oracle-proxy-port"
                                        label={i18next.t('settings.proxy.localPort')}
                                        initialValue={1522}
                                        rules={[
                                            {
                                                required: true,
                                            },
                                        ]}
                                    >
                                        <Input type='text' placeholder={i18next.t('settings.proxy.localPortPlaceholder')} />
                                    </Form.Item>
                                    <Form.Item
                                        {...formItemLayout}
                                        name="enable-auto-start-oracle"
                                        label={i18next.t('settings.proxy.autoStart')}
                                        valuePropName="checked"
                                        rules={[
                                            {
                                                required: false,
                                            },
                                        ]}
                                    >
                                        <Switch checkedChildren={i18next.t('settings.proxy.autoStartStart')} unCheckedChildren={i18next.t('settings.proxy.autoStartStop')} onChange={(checked) => {
                                            this.setState({
                                                properties: {
                                                    ...this.state.properties,
                                                    'enable-auto-start-oracle': checked ? "true" : "false",
                                                }
                                            })
                                        }} />
                                    </Form.Item>

                                </Panel>
                                <Panel header={
                                    <Space>
                                        SqlServerServer
                                        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', color: this.state.proxySqlServerServer ? 'green' : 'red', }}>
                                            <SyncOutlined spin={this.state.proxySqlServerServer} />
                                        </div>
                                        <div style={{ color: this.state.proxySqlServerServer ? 'green' : 'red', }}>
                                            {this.state.proxySqlServerServer ? i18next.t('settings.proxy.running') : i18next.t('settings.proxy.stopped')}
                                        </div>
                                    </Space>
                                } key="sqlServerServer">
                                    <Form.Item {...formItemLayout} label={i18next.t('settings.proxy.serviceStatus')}>
                                        <Space>
                                            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', color: this.state.proxyMysqlServer ? 'green' : 'red', }}>
                                                <SyncOutlined spin={this.state.proxySqlServerServer} />
                                            </div>
                                            <div style={{ color: this.state.proxySqlServerServer ? 'green' : 'red', }}>
                                                {this.state.proxySqlServerServer ? i18next.t('settings.proxy.running') : i18next.t('settings.proxy.stopped')}
                                            </div>
                                            <Space>
                                                {this.state.proxySqlServerServer ? (
                                                    <Button type="dashed" onClick={() => {
                                                        this.stopSqlServerServer()
                                                    }} size='small'
                                                        loading={this.state.buttonLoading}
                                                        disabled={this.state.buttonLoading}
                                                    >
                                                        {i18next.t('settings.proxy.stopButton')}
                                                    </Button>
                                                ) : (
                                                    <Button type="primary" onClick={() => {
                                                        this.startSqlServerServer(this.guacdSettingFormRef.current.getFieldValue('sql-server-proxy-port'))
                                                    }} size='small'
                                                        loading={this.state.buttonLoading}
                                                        disabled={this.state.buttonLoading}
                                                    >
                                                        {i18next.t('settings.proxy.startButton')}
                                                    </Button>
                                                )}
                                            </Space>
                                        </Space>
                                    </Form.Item>
                                    <Form.Item
                                        {...formItemLayout}
                                        name="sql-server-proxy-port"
                                        label={i18next.t('settings.proxy.localPort')}
                                        initialValue={1434}
                                        rules={[
                                            {
                                                required: true,
                                            },
                                        ]}
                                    >
                                        <Input type='text' placeholder={i18next.t('settings.proxy.localPortPlaceholder')} />
                                    </Form.Item>
                                    <Form.Item
                                        {...formItemLayout}
                                        name="enable-auto-start-sql-server"
                                        label={i18next.t('settings.proxy.autoStart')}
                                        valuePropName="checked"
                                        rules={[
                                            {
                                                required: false,
                                            },
                                        ]}
                                    >
                                        <Switch checkedChildren={i18next.t('settings.proxy.autoStartStart')} unCheckedChildren={i18next.t('settings.proxy.autoStartStop')} onChange={(checked) => {
                                            this.setState({
                                                properties: {
                                                    ...this.state.properties,
                                                    'enable-auto-start-sql-server': checked ? "true" : "false",
                                                }
                                            })
                                        }} />
                                    </Form.Item>

                                </Panel>
                                <Panel header={
                                    <Space>
                                        RedisServer
                                        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', color: this.state.proxyRedisServer ? 'green' : 'red', }}>
                                            <SyncOutlined spin={this.state.proxyRedisServer} />
                                        </div>
                                        <div style={{ color: this.state.proxyRedisServer ? 'green' : 'red', }}>
                                            {this.state.proxyRedisServer ? i18next.t('settings.proxy.running') : i18next.t('settings.proxy.stopped')}
                                        </div>
                                    </Space>
                                } key="redisServer">
                                    <Form.Item {...formItemLayout} label={i18next.t('settings.proxy.serviceStatus')}>
                                        <Space>
                                            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', color: this.state.proxyRedisServer ? 'green' : 'red', }}>
                                                <SyncOutlined spin={this.state.proxyRedisServer} />
                                            </div>
                                            <div style={{ color: this.state.proxyRedisServer ? 'green' : 'red', }}>
                                                {this.state.proxyRedisServer ? i18next.t('settings.proxy.running') : i18next.t('settings.proxy.stopped')}
                                            </div>
                                            <Space>
                                                {this.state.proxyRedisServer ? (
                                                    <Button type="dashed" onClick={() => {
                                                        this.stopRedisServer()
                                                    }} size='small'
                                                        loading={this.state.buttonLoading}
                                                        disabled={this.state.buttonLoading}
                                                    >
                                                        {i18next.t('settings.proxy.stopButton')}
                                                    </Button>
                                                ) : (
                                                    <Button type="primary" onClick={() => {
                                                        this.startRedisServer(this.guacdSettingFormRef.current.getFieldValue('redis-proxy-port'))
                                                    }} size='small'
                                                        loading={this.state.buttonLoading}
                                                        disabled={this.state.buttonLoading}
                                                    >
                                                        {i18next.t('settings.proxy.startButton')}
                                                    </Button>
                                                )}
                                            </Space>
                                        </Space>
                                    </Form.Item>
                                    <Form.Item
                                        {...formItemLayout}
                                        name="redis-proxy-port"
                                        label={i18next.t('settings.proxy.port')}
                                        initialValue={6380}
                                        rules={[
                                            {
                                                required: true,
                                            },
                                        ]}
                                    >
                                        <Input type='text' placeholder={i18next.t('settings.proxy.portPlaceholder')} />
                                    </Form.Item>
                                    <Form.Item
                                        {...formItemLayout}
                                        name="enable-auto-start-redis"
                                        label={i18next.t('settings.proxy.autoStart')}
                                        valuePropName="checked"
                                        rules={[
                                            {
                                                required: false,
                                            },
                                        ]}
                                    >
                                        <Switch checkedChildren={i18next.t('settings.proxy.autoStartStart')} unCheckedChildren={i18next.t('settings.proxy.autoStartStop')} onChange={(checked) => {
                                            this.setState({
                                                properties: {
                                                    ...this.state.properties,
                                                    'enable-auto-start-redis': checked ? "true" : "false",
                                                }
                                            })
                                        }} />
                                    </Form.Item>


                                </Panel>
                            </Collapse>

                            <Form.Item {...formTailLayout}>
                                <Button type="primary" htmlType="submit">
                                    {i18next.t('settings.base.updateButton')}
                                </Button>
                            </Form.Item>
                        </Form>
                    </TabPane>
                    <TabPane tab={i18next.t('settings.mail.title')} key="mail">
                        <Title level={4}>{i18next.t('settings.mail.title')}</Title>
                        {/* <Alert
                            message="配置邮箱后，添加用户将向对方的邮箱发送账号密码。"
                            type="info"
                            style={{marginBottom: 10}}
                        /> */}
                        <Descriptions title="" column={1}>
                            <Descriptions.Item label={i18next.t('settings.base.hint-label')}>{i18next.t('settings.mail.hint')}</Descriptions.Item>
                        </Descriptions>
                        <Form ref={this.mailSettingFormRef} name='mail' onFinish={this.changeProperties}
                            layout="vertical">

                            <Form.Item
                                {...formItemLayout}
                                name="mail-host"
                                label={i18next.t('settings.mail.mailHost')}
                                rules={[
                                    {
                                        required: false,
                                        message: i18next.t('settings.mail.mailHost'),
                                    },
                                ]}
                            >
                                <Input type='text' placeholder={i18next.t('settings.mail.mailHostPlaceholder')} />
                            </Form.Item>

                            <Form.Item
                                {...formItemLayout}
                                name="mail-port"
                                label={i18next.t('settings.mail.mailPort')}
                                rules={[
                                    {
                                        required: false,
                                        message: i18next.t('settings.mail.mailPort'),
                                        min: 1,
                                        max: 65535
                                    },
                                ]}
                            >
                                <Input type='number' placeholder={i18next.t('settings.mail.mailPortPlaceholder')} />
                            </Form.Item>

                            <Form.Item
                                {...formItemLayout}
                                name="mail-username"
                                label={i18next.t('settings.mail.mailUsername')}
                                rules={[
                                    {
                                        required: false,
                                        type: "email",
                                        message: i18next.t('settings.mail.mailUsernameRules'),
                                    },
                                ]}
                            >
                                <Input type='email' placeholder={i18next.t('settings.mail.mailUsernamePlaceholder')} />
                            </Form.Item>
                            <input type='password' hidden={true} autoComplete='new-password' />
                            <Form.Item
                                {...formItemLayout}
                                name="mail-password"
                                label={i18next.t('settings.mail.mailPassword')}
                                rules={[
                                    {
                                        required: false,
                                        message: i18next.t('settings.mail.mailPassword'),
                                    },
                                ]}
                            >
                                <Input type='password' placeholder={i18next.t('settings.mail.mailPasswordPlaceholder')} />
                            </Form.Item>

                            <Form.Item {...formTailLayout}>
                                <Button type="primary" htmlType="submit">
                                    {i18next.t('settings.base.updateButton')}
                                </Button>
                            </Form.Item>
                        </Form>

                    </TabPane>

                    <TabPane tab={i18next.t('settings.log.title')} key="log">
                        <Title level={4}>{i18next.t('settings.log.title')}</Title>
                        <Form ref={this.logSettingFormRef} name="log" onFinish={this.changeProperties}
                            layout="vertical">

                            <Form.Item
                                {...formItemLayout}
                                name="login-log-saved-limit"
                                label={i18next.t('settings.log.loginLog')}
                                initialValue=""
                            >
                                <Select onChange={null}>
                                    <Option value="">{i18next.t('settings.log.forever')}</Option>
                                    <Option value="3">3{i18next.t('settings.log.days')}</Option>
                                    <Option value="10">10{i18next.t('settings.log.days')}</Option>
                                    <Option value="20">20{i18next.t('settings.log.days')}</Option>
                                    <Option value="30">30{i18next.t('settings.log.days')}</Option>
                                    <Option value="60">60{i18next.t('settings.log.days')}</Option>
                                    <Option value="180">180{i18next.t('settings.log.days')}</Option>
                                    <Option value="360">360{i18next.t('settings.log.days')}</Option>
                                </Select>
                            </Form.Item>

                            <Form.Item
                                {...formItemLayout}
                                name="sql-log-saved-limit"
                                label={i18next.t('settings.log.sqlLog')}
                                initialValue=""
                            >
                                <Select onChange={null}>
                                    <Option value="">{i18next.t('settings.log.forever')}</Option>
                                    <Option value="3">3{i18next.t('settings.log.days')}</Option>
                                    <Option value="10">10{i18next.t('settings.log.days')}</Option>
                                    <Option value="20">20{i18next.t('settings.log.days')}</Option>
                                    <Option value="30">30{i18next.t('settings.log.days')}</Option>
                                    <Option value="60">60{i18next.t('settings.log.days')}</Option>
                                    <Option value="180">180{i18next.t('settings.log.days')}</Option>
                                    <Option value="360">360{i18next.t('settings.log.days')}</Option>
                                </Select>
                            </Form.Item>
                            <Form.Item
                                {...formItemLayout}
                                name="webhook-push-log-saved-limit"
                                label={i18next.t('settings.log.webhookPushLog')}
                                initialValue=""
                            >
                                <Select onChange={null}>
                                    <Option value="">{i18next.t('settings.log.forever')}</Option>
                                    <Option value="3">3{i18next.t('settings.log.days')}</Option>
                                    <Option value="10">10{i18next.t('settings.log.days')}</Option>
                                    <Option value="20">20{i18next.t('settings.log.days')}</Option>
                                    <Option value="30">30{i18next.t('settings.log.days')}</Option>
                                    <Option value="60">60{i18next.t('settings.log.days')}</Option>
                                    <Option value="180">180{i18next.t('settings.log.days')}</Option>
                                    <Option value="360">360{i18next.t('settings.log.days')}</Option>
                                </Select>
                            </Form.Item>
                            <Form.Item
                                {...formItemLayout}
                                name="oper-log-saved-limit"
                                label={i18next.t('settings.log.operLog')}
                                initialValue=""
                            >
                                <Select onChange={null}>
                                    <Option value="">{i18next.t('settings.log.forever')}</Option>
                                    <Option value="3">3{i18next.t('settings.log.days')}</Option>
                                    <Option value="10">10{i18next.t('settings.log.days')}</Option>
                                    <Option value="20">20{i18next.t('settings.log.days')}</Option>
                                    <Option value="30">30{i18next.t('settings.log.days')}</Option>
                                    <Option value="60">60{i18next.t('settings.log.days')}</Option>
                                    <Option value="180">180{i18next.t('settings.log.days')}</Option>
                                    <Option value="360">360{i18next.t('settings.log.days')}</Option>
                                </Select>
                            </Form.Item>

                            <Form.Item
                                {...formItemLayout}
                                name="cron-log-saved-limit"
                                label={i18next.t('settings.log.cronLog')}
                                initialValue=""
                            >
                                <Select onChange={null}>
                                    <Option value="">{i18next.t('settings.log.forever')}</Option>
                                    <Option value="3">3{i18next.t('settings.log.days')}</Option>
                                    <Option value="10">10{i18next.t('settings.log.days')}</Option>
                                    <Option value="20">20{i18next.t('settings.log.days')}</Option>
                                    <Option value="30">30{i18next.t('settings.log.days')}</Option>
                                    <Option value="60">60{i18next.t('settings.log.days')}</Option>
                                    <Option value="180">180{i18next.t('settings.log.days')}</Option>
                                    <Option value="360">360{i18next.t('settings.log.days')}</Option>
                                </Select>
                            </Form.Item>

                            <Form.Item
                                {...formItemLayout}
                                name="build-log-saved-limit"
                                label={i18next.t('settings.log.buildLog')}
                                initialValue=""
                            >
                                <Select onChange={null}>
                                    <Option value="">{i18next.t('settings.log.forever')}</Option>
                                    <Option value="3">3{i18next.t('settings.log.days')}</Option>
                                    <Option value="10">10{i18next.t('settings.log.days')}</Option>
                                    <Option value="20">20{i18next.t('settings.log.days')}</Option>
                                    <Option value="30">30{i18next.t('settings.log.days')}</Option>
                                    <Option value="60">60{i18next.t('settings.log.days')}</Option>
                                    <Option value="180">180{i18next.t('settings.log.days')}</Option>
                                    <Option value="360">360{i18next.t('settings.log.days')}</Option>
                                </Select>
                            </Form.Item>
                            <Form.Item {...formTailLayout}>
                                <Button type="primary" htmlType="submit">
                                    {i18next.t('settings.base.updateButton')}
                                </Button>
                            </Form.Item>
                        </Form>
                    </TabPane>
                    <TabPane tab={i18next.t('settings.ldap.title')} key="ldap">
                        <Title level={4}>{i18next.t('settings.ldap.sub-title')}</Title>
                        {/* <Alert
                            message="配置LDAP服务器后，服务器将开机自动启动，请确保LDAP服务器已安装并配置好。"
                            type="info"
                            style={{ marginBottom: 10 }}
                        /> */}
                        <Form ref={this.ldapSettingFormRef} name='ldap' onFinish={this.changeProperties}
                            layout="vertical">

                            <Form.Item
                                {...formItemLayout}
                                name="ldap-url"
                                label={i18next.t('settings.ldap.ip')}
                                rules={[
                                    {
                                        required: false,
                                        message: i18next.t('settings.ldap.ip'),
                                    },
                                ]}
                            >
                                <Input type='text' placeholder={i18next.t('settings.ldap.iphint')} value="127.0.0.1" />
                            </Form.Item>

                            {/* <Form.Item
                                {...formItemLayout}
                                name="ldap-port"
                                label={i18next.t('settings.ldap.port')}
                                rules={[
                                    {
                                        required: false,
                                        message: i18next.t('settings.ldap.port'),
                                        min: 1,
                                        max: 65535
                                    },
                                ]}
                            >
                                <Input type='number' placeholder={i18next.t('settings.ldap.porthint')} />
                            </Form.Item> */}

                            <Form.Item
                                {...formItemLayout}
                                name="ldap-dn"
                                label={i18next.t('settings.ldap.basedn')}
                                rules={[
                                    {
                                        required: false,
                                        message: i18next.t('settings.ldap.basedn'),
                                        min: 1,
                                        max: 65535
                                    },
                                ]}
                            >
                                <Input type='text' placeholder={i18next.t('settings.ldap.basendhint')} />
                            </Form.Item>


                            <Form.Item
                                {...formItemLayout}
                                name="ldap-username"
                                label={i18next.t('settings.ldap.account')}
                                rules={[
                                    {
                                        required: false,
                                        type: "text",
                                        message: i18next.t('settings.ldap.account'),
                                    },
                                ]}
                            >
                                <Input type='text' placeholder={i18next.t('settings.ldap.accounthint')} />
                            </Form.Item>
                            <input type='password' hidden={true} autoComplete='new-password' />
                            <Form.Item
                                {...formItemLayout}
                                name="ldap-password"
                                label={i18next.t('settings.ldap.password')}
                                rules={[
                                    {
                                        required: false,
                                        message: i18next.t('settings.ldap.password'),
                                    },
                                ]}
                            >
                                <Input.Password type='password' placeholder={i18next.t('settings.ldap.passwordhint')} />
                            </Form.Item>

                            <Form.Item {...formTailLayout}>
                                <Button type="primary" htmlType="submit">
                                    {i18next.t('settings.base.updateButton')}
                                </Button>
                                <Button style={{ marginLeft: 8 }} onClick={this.ldapUserSync}>
                                    {i18next.t('settings.base.syncButton')}
                                </Button>
                            </Form.Item>
                        </Form>

                    </TabPane>
                    <TabPane tab={i18next.t('settings.ai.title')} key="ai">
                        <Title level={4}>{i18next.t('settings.ai.title')}</Title>
                        <Form ref={this.aiSettingFormRef} name="guacd" onFinish={this.changeProperties} layout="vertical">

                            <Collapse defaultActiveKey={['DeepSeek']} accordion style={{ marginBottom: '20px' }}>
                                <Panel header="DeepSeek" key="DeepSeek">
                                    <Form.Item
                                        {...formItemLayout}
                                        name="ai-deepseek-apiKey"
                                        label="apiKey"
                                        initialValue=""
                                        rules={[
                                            {
                                                required: true,
                                            },
                                        ]}
                                    >
                                        <Input type='text' placeholder="请输入apiKey" />
                                    </Form.Item>
                                    <Form.Item
                                        {...formItemLayout}
                                        name="ai-deepseek-maxTokens"
                                        label="maxTokens"
                                        initialValue=""
                                    >
                                        <Input type='text' placeholder="请输入maxTokens" />
                                    </Form.Item>
                                    <Form.Item
                                        {...formItemLayout}
                                        name="ai-deepseek-model"
                                        label="model"
                                        initialValue="deepseek-coder"
                                    >
                                        <Input type='text' placeholder="请输入model" />
                                    </Form.Item>
                                </Panel>
                            </Collapse>

                            <Form.Item {...formTailLayout}>
                                <Button type="primary" htmlType="submit">
                                    {i18next.t('settings.base.updateButton')}
                                </Button>
                            </Form.Item>
                        </Form>
                    </TabPane>
                    <TabPane tab={i18next.t('settings.other.title')} key="other">
                        <Title level={4}>{i18next.t('settings.other.title')}</Title>
                        <Form ref={this.otherSettingFormRef} name="other" onFinish={this.changeProperties}
                            layout="vertical">

                            <Form.Item
                                {...formItemLayout}
                                name="user-default-storage-size"
                                label={i18next.t('settings.other.userStorage')}
                                tooltip={i18next.t('settings.other.unlimited')}
                            >
                                <Input type={'number'} min={-1} suffix="MB" />
                            </Form.Item>

                            <Form.Item {...formTailLayout}>
                                <Button type="primary" htmlType="submit">
                                    {i18next.t('settings.base.updateButton')}
                                </Button>
                            </Form.Item>
                        </Form>
                    </TabPane>
                    <TabPane tab={i18next.t('settings.backup.title')} key="backup">
                        <Title level={4}>{i18next.t('settings.backup.title')}</Title>

                        <Space direction="vertical">
                            <Descriptions title="" column={1}>
                                <Descriptions.Item label={i18next.t('settings.base.hint-label')}>{i18next.t('settings.backup.hint')}</Descriptions.Item>
                            </Descriptions>

                            <Space>
                                <Button type="primary" onClick={() => {
                                    download(`${server}/backup/export?X-Auth-Token=${getToken()}&t=${new Date().getTime()}`);
                                }}>
                                    {i18next.t('settings.backup.exportBackup')}
                                </Button>

                                <Button type="dashed" loading={this.state['importBtnLoading']} onClick={() => {
                                    window.document.getElementById('file-upload').click();
                                }}>
                                    {i18next.t('settings.backup.importBackup')}
                                </Button>
                                <input type="file" id="file-upload" style={{ display: 'none' }}
                                    onChange={this.handleImport} />
                            </Space>
                        </Space>

                    </TabPane>
                    <TabPane tab={i18next.t('settings.translations.title')} key="translations">
                        <Title level={4}>{i18next.t('settings.translations.title')}</Title>

                        {/* <Descriptions title=""  column={1}>
                            <Descriptions.Item label={i18next.t('settings.base.hint-label')}>配置国际化支持语言的信息</Descriptions.Item>
                        </Descriptions>
                        <Form ref={this.langSettingFormRef} name="base" initialValues={{ langFields: this.state.langFields }} onFinish={this.changeProperties} layout="vertical">
                            <Form.List  
                                 {...formItemLayout}
                                 name="langFields"
                                 label="语言"
                                >
                                {(fields, { add, remove }) => (
                                <>
                                    {fields.map(({ key, name, type, ...restField }) => {
                                     const fieldType = this.langSettingFormRef.current?.getFieldValue(["langFields", name, "type"]);
                                     console.log(" fieldType ",fieldType)
                                     return (
                                        <Space key={key} style={{ display: "flex", marginBottom: 8 }} align="baseline">
                                          <Form.Item
                                            {...restField}
                                            name={[name, "key"]}
                                            rules={[{ required: true, message: "请输入英文 key!" }]}
                                          >
                                            <Input placeholder="编码" readOnly={fieldType === "default"} />
                                          </Form.Item>
                                          <Form.Item
                                            {...restField}
                                            name={[name, "name"]}
                                            rules={[{ required: true, message: "请输入显示语言名称!" }]}
                                          >
                                            <Input placeholder="名字" readOnly={fieldType === "default"} />
                                          </Form.Item>
                                          {fieldType !== "default" && (
                                            <MinusCircleOutlined onClick={() => remove(name)} style={{ color: "red" }} />
                                          )}
                                        </Space>
                                      );
                                    })}
                                    <Form.Item>
                                        <Button style={{maxWidth:'200px'}} type="dashed" onClick={() => add()} block >
                                            添加语言
                                        </Button>
                                    </Form.Item>
                                </>
                                )}
                            </Form.List>

                            <Form.Item {...formTailLayout}>
                                <Button type="primary" htmlType="submit">
                                    {i18next.t('settings.base.updateButton')}
                                </Button>
                            </Form.Item>
                        </Form> */}

                        <Space direction="vertical">
                            <Descriptions title="" column={1}>
                                <Descriptions.Item label={i18next.t('settings.base.hint-label')}>{i18next.t('settings.translations.hint')}</Descriptions.Item>
                            </Descriptions>

                            <Space>
                                <Button type="dashed" loading={this.state['importBtnLoading']} onClick={() => {
                                    window.document.getElementById('file-upload-translations').click();
                                }}>
                                    {i18next.t('settings.translations.importTranslations')}
                                </Button>
                                <input type="file" id="file-upload-translations" style={{ display: 'none' }}
                                    onChange={this.handleImportTranslations} />
                            </Space>
                        </Space>

                    </TabPane>
                    <TabPane tab={i18next.t('settings.license.title')} key="license">
                        <Title level={4}>{i18next.t('settings.license.title')}</Title>

                        <Space direction="vertical">
                            {/* <Alert
                                message="恢复数据时，如存在登录账号相同的用户时，会保留原系统中的数据，此外由于登录密码加密之后不可逆，恢复的账户密码将随机产生。"
                                type="info"
                            /> */}
                            <Descriptions title={i18next.t('settings.license.licenseType')} column={1}>
                                <Descriptions.Item label={i18next.t('settings.license.licenseType')}>免费开源版本</Descriptions.Item>
                                <Descriptions.Item label={i18next.t('settings.license.machineCode')}>
                                    <Paragraph
                                        style={{ marginBottom: 0 }}
                                        copyable={{ text: this.state.machineId, }}>
                                        {this.state.machineId}
                                    </Paragraph>
                                </Descriptions.Item>
                                <Descriptions.Item label={i18next.t('settings.license.maxConcurrency')}>{renderCount(this.state.license.UserCount)}</Descriptions.Item>
                                {/* <Descriptions.Item label="最大资产数">{renderCount(this.state.license.MaxAsset)}</Descriptions.Item>
                                <Descriptions.Item label="最大用户数">{renderCount(this.state.license.MaxUser)}</Descriptions.Item> */}
                                <Descriptions.Item label={i18next.t('settings.license.licenseExpiry')}>{renderTime(this.state.license.EndDate)}</Descriptions.Item>
                            </Descriptions>

                            <Space>
                                <Button type="primary" loading={this.state['importBtnLoading']} onClick={() => {
                                    window.document.getElementById('import-license').click();
                                }}>
                                    {i18next.t('settings.license.importLicense')}
                                </Button>

                                <Button type="dashed" onClick={() => {
                                    window.open("http://license.aiputing.com/");
                                }}>
                                    {i18next.t('settings.license.applyOnline')}
                                </Button>
                                <input type="file" id="import-license" style={{ display: 'none' }}
                                    onChange={this.handleImportLicense} />
                            </Space>
                        </Space>

                    </TabPane>
                    <TabPane tab={
                        <Space>
                            <Badge dot={this.state.versionInfo.version && this.state.versionInfo.version !== this.state.branding.version} />{i18next.t('settings.upgrade.title')}
                        </Space>
                    } key="upgrade">
                        <Title level={4}>{i18next.t('settings.upgrade.title')}</Title>
                        <Space direction="vertical">

                            <Space direction='vertical'>
                                <Space direction="vertical">
                                    <span>{i18next.t('settings.upgrade.currentVersion')}{this.state.branding.version}</span>
                                    <pre>
                                        {this.state.branding.upgrade}
                                    </pre>
                                </Space>
                                {
                                    this.state.versionInfo.version && this.state.versionInfo.version !== this.state.branding.version && <Space direction="vertical">
                                        <Space style={{ color: 'red' }}>
                                            <span >{i18next.t('settings.upgrade.newVersion')}{this.state.versionInfo.version}</span>
                                            <a href={this.state.versionInfo.detail} target="_blank" rel="noreferrer"><InfoCircleOutlined />{i18next.t('settings.upgrade.releaseNotes')}</a>
                                        </Space>
                                    </Space>
                                }
                            </Space>
                            {
                                this.state.versionInfo.version && this.state.versionInfo.version !== this.state.branding.version &&
                                <Space style={{ marginTop: '20px' }}>
                                    <Button type="primary" loading={this.state['showProgress']} onClick={() => { this.handleUpgrade(true) }}>
                                        {i18next.t('settings.upgrade.upgradeButton')}
                                    </Button>
                                </Space>
                            }
                        </Space>

                    </TabPane>
                    <TabPane tab={i18next.t('settings.about.title')} key="about">
                        <Title level={4}>{i18next.t('settings.about.title')}</Title>

                        <Space direction="vertical">
                            {/* <Alert
                                message="恢复数据时，如存在登录账号相同的用户时，会保留原系统中的数据，此外由于登录密码加密之后不可逆，恢复的账户密码将随机产生。"
                                type="info"
                            /> */}

                            <Space direction='vertical'>
                                <div>{i18next.t('settings.about.copyright')}{new Date().getFullYear()} aiputing.com</div>
                                <div>{i18next.t('settings.about.terms')}</div>
                                <div>{i18next.t('settings.about.apache')}</div>
                                <div>{i18next.t('settings.about.thirdParty')}</div>
                                <div>{i18next.t('settings.about.licenseDetails')}</div>
                            </Space>

                        </Space>

                    </TabPane>
                </Tabs>
            </div>
        );
    }
}

export default Setting;
