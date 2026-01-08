import { Line, Pie } from '@ant-design/charts';
import { BlockOutlined, BuildOutlined, CodeOutlined, ConsoleSqlOutlined, DatabaseOutlined, DisconnectOutlined, ForkOutlined, LoginOutlined, ProductOutlined, UserOutlined } from '@ant-design/icons';
import { ProCard, StatisticCard } from '@ant-design/pro-components';
import { Col, Row, Segmented } from 'antd';
import i18next from 'i18next';
import { Component } from 'react';
import request from "../../common/request";
import './Dashboard.css';
class Dashboard extends Component {

    state = {
        key: 0 ,
        counter: {
            onlineUser: 0,
            totalUser: 0,
            activeAsset: 0,
            totalAsset: 0,
            failLoginCount: 0,
            onlineSession:0,
            offlineSession: 0,
            totalGit: 0,
            totalBuild: 0,
            buildFailCount: 0,
            buildSuccessCount: 0,
            totalSensitive: 0,
            totalSensitiveGroup: 0,
            totalTrigger: 0,
            totalTriggerGroup: 0,
            totalProxy: 0,
            totalSqlLog: 0,
            sqlLogSuccessCount: 0,
        },
        asset: {
            "mysql": 0,
            "mariadb": 0,
            "oracle": 0,
            "redis": 0,
            "mongodb": 0,
            "sqlserver": 0,
            "postgresql": 0,
            "sqlite": 0,
        },
        dateCounter: [],
    }

    handleLanguageChange = () => {
        this.setState({ key: this.state.key + 1 }); // 强制触发更新
    }
    
    componentDidMount() {
        this.getCounter();
        this.getAsset();
        this.getDateCounter('week');
        i18next.on('languageChanged', this.handleLanguageChange);
    }

    componentWillUnmount() {
        i18next.off('languageChanged', this.handleLanguageChange);
    }

    getCounter = async () => {
        let result = await request.get('/overview/counter');
        if (result['code'] === 1) {
            this.setState({
                counter: result['data']
            })
        }
    }

    getDateCounter = async (d) => {
        let result = await request.get('/overview/date-counter?d=' + d);
        if (result['code'] === 1) {
            const translatedData = result.data.map(item => ({
                ...item,
                type: i18next.t(item.type)  // 翻译 type 字段
            }));
            this.setState({
                dateCounter: translatedData
            })
        }
    }

    getAsset = async () => {
        let result = await request.get('/overview/asset');
        if (result['code'] === 1) {
            this.setState({
                asset: result['data']
            })
        }
    }

    handleChangeDateCounter = (value) => {
        if(value === '按周'){
            this.getDateCounter('week');
        }else {
            this.getDateCounter('month');
        }
    }

    
    render() {

        const assetData = [
            {
                type: 'MySQL',
                value: this.state.asset['mysql'],
            },
            {
                type: 'MariaDB',
                value: this.state.asset['mariadb'],
            },
            {
                type: 'oracel',
                value: this.state.asset['oracel'],
            },
            {
                type: 'Redis',
                value: this.state.asset['redis'],
            },
            {
                type: 'MongoDB',
                value: this.state.asset['mongodb'],
            },
            {
                type: 'SqlServer',
                value: this.state.asset['sqlserver'],
            },
            {
                type: 'PostgreSQL',
                value: this.state.asset['postgresql'],
            },
            {
                type: 'Sqlite',
                value: this.state.asset['sqlite'],
            }
        ];
        const assetConfig = {
            width: 200,
            height: 200,
            appendPadding: 10,
            data: assetData,
            angleField: 'value',
            colorField: 'type',
            radius: 1,
            innerRadius: 0.6,
            label: {
                type: 'inner',
                offset: '-50%',
                content: '{value}',
                style: {
                    textAlign: 'center',
                    fontSize: 14,
                },
            },
            interactions: [{type: 'element-selected'}, {type: 'element-active'}],
            statistic: {
                title: false,
                content: {
                    formatter: () => {
                        return i18next.t('dashboard.asset_type');
                    },
                    style: {
                        fontSize: 18,
                    }
                },
            },
        };

        const dateCounterConfig = {
            height: 270,
            data: this.state.dateCounter,
            xField: 'date',
            yField: 'value',
            seriesField: 'type',
            legend: {
                position: 'top',
            },
            smooth: true,
            animation: {
                appear: {
                    animation: 'path-in',
                    duration: 5000,
                },
            },
        };
        
        return (<>
            <div className="dashboard-container" style={{margin: 16}}>
                <ProCard
                    key={this.state.key} 
                    title={i18next.t('dashboard.data_overview')}
                    split={'horizontal'}
                    headerBordered
                    bordered
                >
                    <Row gutter={16}>
                        <Col xs={24} sm={12} md={12} lg={12} xl={12} className='row-col-right'>
                            <ProCard split="horizontal" >
                                <ProCard split='vertical' className='ant-pro-card-split-vertical'>
                                    <StatisticCard
                                        statistic={{
                                            title: i18next.t('dashboard.user_online_total'),
                                            value: this.state.counter['onlineUser'] + '/' + this.state.counter['totalUser'],
                                            prefix: <UserOutlined/>
                                        }}
                                    />
                                    <StatisticCard
                                        statistic={{
                                            title: i18next.t('dashboard.assets_running_total'),
                                            value: this.state.counter['activeAsset'] + '/' + this.state.counter['totalAsset'],
                                            prefix: <DatabaseOutlined />
                                        }}
                                    />
                                </ProCard>
                                <ProCard split='vertical' className='ant-pro-card-split-vertical row-col-bottom'>
                                    <StatisticCard
                                        statistic={{
                                            title: i18next.t('dashboard.login_failed_count'),
                                            value: this.state.counter['failLoginCount'],
                                            prefix: <LoginOutlined/>
                                        }}
                                    />
                                    <StatisticCard
                                        statistic={{
                                            title: i18next.t('dashboard.his_session_total'),
                                            value:  this.state.counter['onlineSession'] + '/' +this.state.counter['offlineSession'],
                                            prefix: <DisconnectOutlined/>
                                        }}
                                    />
                                </ProCard>
                            </ProCard>
                        </Col>
                        <Col xs={24} sm={12} md={12} lg={12} xl={12} className='row-col-left'>
                            <ProCard className='pie-card'>
                                <ProCard>
                                    <Pie {...assetConfig} />
                                </ProCard>
                            </ProCard>
                        </Col>
                    </Row>
                    {/* </ProCard> */}

                </ProCard>

                <ProCard
                    style={{marginTop: 16}}
                    title={i18next.t('dashboard.version_build_overview')}
                    split={'horizontal'}
                    headerBordered
                    bordered
                >
                    {/* <ProCard split={'vertical'}> */}
                    <Row gutter={16}>
                        <Col xs={24} sm={12} md={12} lg={12} xl={12} className='row-col-right'>
                            <ProCard split="horizontal"  >
                                <ProCard split='vertical' className='ant-pro-card-split-vertical'>
                                    <StatisticCard
                                        statistic={{
                                            title: i18next.t('dashboard.version_count'),
                                            value: this.state.counter['totalGit'],
                                            prefix: <ForkOutlined />
                                        }}
                                    />
                                    <StatisticCard
                                        statistic={{
                                            title: i18next.t('dashboard.build_count_success_total'),
                                            value: this.state.counter['buildSuccessCount'] + '/' + this.state.counter['totalBuild'],
                                            prefix: <BuildOutlined/>
                                        }}
                                    />
                                </ProCard>
                                <ProCard split='vertical' className='ant-pro-card-split-vertical row-col-bottom'>
                                    <StatisticCard
                                        statistic={{
                                            title: i18next.t('dashboard.proxy_count'),
                                            value: this.state.counter['totalProxy'],
                                            prefix: <BlockOutlined />
                                        }}
                                    />
                                    <StatisticCard
                                        statistic={{
                                            title: i18next.t('dashboard.execution_log_success_total'),
                                            value: this.state.counter['sqlLogSuccessCount']+ '/' + this.state.counter['totalSqlLog'],
                                            prefix: <ConsoleSqlOutlined/>
                                            
                                        }}
                                    />
                                </ProCard>
                            </ProCard>
                        </Col>
                        <Col xs={24} sm={12} md={12} lg={12} xl={12} className='row-col-left'>
                            <ProCard split="horizontal">
                                <ProCard split='vertical'>
                                    <StatisticCard
                                        statistic={{
                                            title: i18next.t('dashboard.sensitive_command_count'),
                                            value: this.state.counter['totalSensitive'],
                                            prefix: <CodeOutlined/>
                                        }}
                                    />
                                    <StatisticCard
                                        statistic={{
                                            title: i18next.t('dashboard.trigger_command_count'),
                                            value: this.state.counter['totalTrigger'],
                                            prefix: <CodeOutlined/>
                                        }}
                                    />
                                </ProCard>
                                <ProCard split='vertical'>
                                    <StatisticCard
                                        statistic={{
                                            title: i18next.t('dashboard.sensitive_policy_count'),
                                            value: this.state.counter['totalSensitiveGroup'],
                                            prefix: <ProductOutlined/>
                                        }}
                                    />
                                    <StatisticCard
                                        statistic={{
                                            title: i18next.t('dashboard.trigger_policy_count'),
                                            value: this.state.counter['totalTriggerGroup'],
                                            prefix: <ProductOutlined/>
                                        }}
                                    />
                                </ProCard>
                            </ProCard>
                        </Col>
                    </Row>
                    {/* </ProCard> */}

                </ProCard>
                <ProCard title={i18next.t('dashboard.session_statistics')} style={{marginTop: 16}}
                         extra={<Segmented options={[i18next.t('dashboard.weekly'), i18next.t('dashboard.monthly')]} onChange={this.handleChangeDateCounter}/>}>
                    <Line {...dateCounterConfig} />
                </ProCard>
            </div>
        </>);
    }
}

export default Dashboard;
