import { Area, DualAxes, Liquid } from "@ant-design/charts";
import i18next from 'i18next';
import { useEffect, useState } from 'react';
import localeConfig from '../../common/localeConfig';
// import { Liquid } from '@ant-design/plots';
import { ProCard, StatisticCard } from '@ant-design/pro-components';
import { Col, Row, Space, Tooltip } from "antd";
import dayjs from "dayjs";
import { useQuery } from "react-query";
import monitorApi from "../../api/monitor";
import { renderSize } from "../../utils/utils";
import { renderWeekDay } from "../../utils/week";
import './Monitoring.css';
const { Statistic } = StatisticCard;



const initData = {
    loadStat: {
        load1: 0, load5: 0, load15: 0, percent: 0
    },
    mem: {
        total: 0,
        available: 0,
        usedPercent: 0
    },
    cpu: {
        count: 0,
        usedPercent: 0,
        info: [{
            'modelName': ''
        }]
    },
    disk: {
        total: 0,
        available: 0,
        usedPercent: 0
    },
    diskIO: [], netIO: [], cpuStat: [], memStat: [],
}

const Monitoring = () => {

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
    const renderLoad = (percent) => {
        if (percent >= 0.9) {
            return i18next.t('monitoring.diskIO.percent.blockage');
        } else if (percent >= 0.8) {
            return i18next.t('monitoring.diskIO.percent.slow');
        } else if (percent >= 0.7) {
            return i18next.t('monitoring.diskIO.percent.normal');
        } else {
            return i18next.t('monitoring.diskIO.percent.smooth');
        }
    }

    let monitorQuery = useQuery('getMonitorData', monitorApi.getData, {
        initialData: initData,
        refetchInterval: 5000
    });

    let loadPercent = monitorQuery.data?.loadStat['percent'];
    let loadColor = '#5B8FF9';
    if (loadPercent > 0.9) {
        loadColor = '#F4664A';
    } else if (loadPercent > 0.8) {
        loadColor = '#001D70';
    } else if (loadPercent > 0.7) {
        loadColor = '#0047A5';
    }

    const loadStatConfig = {
        height: 130,
        width: 130,
        shape: function (x, y, width, height) {
            const r = width / 4;
            const dx = x - width / 2;
            const dy = y - height / 2;
            return [
                ['M', dx, dy + r * 2],
                ['A', r, r, 0, 0, 1, x, dy + r],
                ['A', r, r, 0, 0, 1, dx + width, dy + r * 2],
                ['L', x, dy + height],
                ['L', dx, dy + r * 2],
                ['Z'],
            ];
        },
        style: {
            outlineBorder: 8,
            outlineDistance: 4,
            waveLength: 128,
        },
        percent: loadPercent,
        outline: {
            border: 4, distance: 4,
        },
        wave: {
            length: 64,
        },
        theme: {
            styleSheet: {
                brandColor: loadColor,
            },
        },
        statistic: {
            title: false,
            content: false
        },
        pattern: {
            type: 'dot',
        },
    };

    let cpuPercent = monitorQuery.data?.cpu['usedPercent'] / 100;
    let cpuColor = '#5B8FF9';
    if (cpuPercent > 0.9) {
        cpuColor = '#F4664A';
    } else if (cpuPercent > 0.8) {
        cpuColor = '#001D70';
    }
    const cpuStatConfig = {
        height: 130,
        width: 130,
        shape: 'diamond',
        percent: cpuPercent,
        style: {
            outlineBorder: 8,
            outlineDistance: 4,
            waveLength: 128,
        },
        outline: {
            border: 4, distance: 4,
        },
        wave: {
            length: 64,
        },
        theme: {
            styleSheet: {
                brandColor: cpuColor,
            },
        },
        pattern: {
            type: 'line',
        },
        statistic: {
            title: false,
            content: false
        }
    };

    let memPercent = monitorQuery.data?.mem['usedPercent'] / 100;
    let memColor = '#5B8FF9';
    if (memPercent > 0.75) {
        memColor = '#F4664A';
    }

    const memStatConfig = {
        height: 130,
        width: 130,
        percent: memPercent,
        style: {
            outlineBorder: 8,
            outlineDistance: 4,
            waveLength: 128,
        },
        outline: {
            border: 4, distance: 4,
        },
        wave: {
            length: 64,
        },
        theme: {
            styleSheet: {
                brandColor: memColor,
            },
        },
        statistic: {
            title: false, content: false
        },
        pattern: {
            type: 'dot',
        },
    };

    let diskPercent = monitorQuery.data?.disk['usedPercent'] / 100;
    let diskColor = '#5B8FF9';
    if (diskPercent > 0.9) {
        diskColor = '#F4664A';
    } else if (diskPercent > 0.8) {
        diskColor = '#001D70';
    }

    const diskStatConfig = {
        height: 130,
        width: 130,
        shape: 'rect',
        percent: diskPercent,
        style: {
            outlineBorder: 8,
            outlineDistance: 4,
            waveLength: 128,
        },
        outline: {
            border: 4, distance: 4,
        },
        wave: {
            length: 64,
        },
        theme: {
            styleSheet: {
                brandColor: diskColor,
            },
        },
        pattern: {
            type: 'line',
        },
        statistic: {
            title: false, content: false
        }
    };

    const diskIOConfig = {
        height: 150,
        data: [monitorQuery.data['diskIO'], monitorQuery.data['diskIO']],
        xField: 'time',
        yField: ['read', 'write'],
        meta: {
            read: {
                alias: i18next.t('monitoring.diskIO.alias.read'),
            }, write: {
                alias: i18next.t('monitoring.diskIO.alias.write')
            }
        },
        geometryOptions: [{
            geometry: 'line', color: '#5B8FF9', smooth: true,
        }, {
            geometry: 'line', color: '#5AD8A6', smooth: true,
        },],
    };

    const netIOConfig = {
        height: 150,
        data: [monitorQuery.data['netIO'], monitorQuery.data['netIO']],
        xField: 'time',
        yField: ['read', 'write'],
        meta: {
            read: {
                alias: i18next.t('monitoring.netIO.alias.receive'),
            }, write: {
                alias: i18next.t('monitoring.netIO.alias.send')
            }
        },
        geometryOptions: [{
            geometry: 'line', color: '#5B8FF9', smooth: true,
        }, {
            geometry: 'line', color: '#5AD8A6', smooth: true,
        },],
    };

    const cpuConfig = {
        height: 150, data: monitorQuery.data['cpuStat'], xField: 'time', yField: 'value', smooth: true, areaStyle: {
            fill: '#d6e3fd',
        },
    };

    const memConfig = {
        height: 150, data: monitorQuery.data['memStat'], xField: 'time', yField: 'value', smooth: true, areaStyle: {
            fill: '#d6e3fd',
        },
    };

    const cpuModelName = monitorQuery.data['cpu']['info'][0]['modelName'].length > 10 ? monitorQuery.data['cpu']['info'][0]['modelName'].substring(0, 10) + '...' : monitorQuery.data['cpu']['info'][0]['modelName'];

    return (<>
        <div className="monitoring" style={{ margin: 16 }}>
            <ProCard
                key={`monitoring-${i18next.language}-${i18nVersion}`}
                title={i18next.t('monitoring.title')}
                extra={dayjs().format("YYYY[-]MM[-]DD[-]") + ' ' + renderWeekDay(dayjs().day())}
                split={'horizontal'}
                headerBordered
                bordered
            >

                <Row gutter={[8, 8, 8, 8]}>
                    <Col xs={24} sm={12} md={8} lg={6}>
                        <ProCard>
                            <StatisticCard
                                statistic={{
                                    title: i18next.t('monitoring.load.title'),
                                    value: renderLoad(monitorQuery.data['loadStat']['percent']),
                                    description: <Space direction="vertical" size={1}>
                                        <Statistic title={i18next.t('monitoring.load.load1')} value={monitorQuery.data['loadStat']['load1'].toFixed(2)} />
                                        <Statistic title={i18next.t('monitoring.load.load5')} value={monitorQuery.data['loadStat']['load5'].toFixed(2)} />
                                        <Statistic title={i18next.t('monitoring.load.load15')} value={monitorQuery.data['loadStat']['load15'].toFixed(2)} />
                                    </Space>,
                                }}
                                chart={<Liquid {...loadStatConfig} />}
                                chartPlacement="left"
                            />
                        </ProCard>
                    </Col>
                    <Col xs={24} sm={12} md={8} lg={6}>
                        <ProCard>
                            <StatisticCard
                                statistic={{
                                    title: i18next.t('monitoring.cpu.title'),
                                    value: monitorQuery.data['cpu']['count'],
                                    suffix: '个',
                                    description: <Space direction="vertical" size={1}>
                                        <Statistic title={i18next.t('monitoring.cpu.usage')}
                                            value={monitorQuery.data['cpu']['usedPercent'].toFixed(2) + '%'} />
                                        <Statistic title={i18next.t('monitoring.cpu.physicalCores')}
                                            value={monitorQuery.data['cpu']['phyCount'] + ' 个'} />
                                        <Tooltip title={monitorQuery.data['cpu']['info'][0]['modelName']}>
                                            <Statistic title={i18next.t('monitoring.cpu.model')} value={cpuModelName} />
                                        </Tooltip>
                                    </Space>,
                                }}
                                chart={<Liquid {...cpuStatConfig} />}
                                chartPlacement="left"
                            />
                        </ProCard>
                    </Col>

                    <Col xs={24} sm={12} md={8} lg={6}>
                        <ProCard>
                            <StatisticCard
                                statistic={{
                                    title: i18next.t('monitoring.memory.title'),
                                    value: renderSize(monitorQuery.data['mem']['total']),
                                    description: <Space direction="vertical" size={1}>
                                        <Statistic title={i18next.t('monitoring.memory.usage')}
                                            value={monitorQuery.data['mem']['usedPercent'].toFixed(2) + '%'} />
                                        <Statistic title={i18next.t('monitoring.memory.available')}
                                            value={renderSize(monitorQuery.data['mem']['available'])} />
                                        <Statistic title={i18next.t('monitoring.memory.used')} value={renderSize(monitorQuery.data['mem']['used'])} />
                                    </Space>,
                                }}
                                chart={<Liquid {...memStatConfig} />}
                                chartPlacement="left"
                            />
                        </ProCard>
                    </Col>
                    <Col xs={24} sm={12} md={8} lg={6}>
                        <ProCard>
                            <StatisticCard
                                statistic={{
                                    title: i18next.t('monitoring.disk.title'),
                                    value: renderSize(monitorQuery.data['disk']['total']),
                                    description: <Space direction="vertical" size={1}>
                                        <Statistic title={i18next.t('monitoring.disk.usage')}
                                            value={monitorQuery.data['disk']['usedPercent'].toFixed(2) + '%'} />
                                        <Statistic title={i18next.t('monitoring.disk.available')}
                                            value={renderSize(monitorQuery.data['disk']['available'])} />
                                        <Statistic title={i18next.t('monitoring.disk.used')} value={renderSize(monitorQuery.data['disk']['used'])} />
                                    </Space>,
                                }}
                                chart={<Liquid {...diskStatConfig} />}
                                chartPlacement="left"
                            />
                        </ProCard>
                    </Col>
                </Row>
                <Row gutter={[24, 24]}>
                    <Col xs={24} sm={24} md={24} lg={12}>
                        <ProCard title={i18next.t('monitoring.cpuLoad.title')}>
                            <Area {...cpuConfig} />
                        </ProCard>
                    </Col>
                    <Col xs={24} sm={24} md={24} lg={12}>
                        <ProCard title={i18next.t('monitoring.memoryLoad.title')}>
                            <Area {...memConfig} />
                        </ProCard>
                    </Col>
                </Row>
                <Row gutter={[24, 24]}>
                    <Col xs={24} sm={24} md={24} lg={12}>
                        <ProCard title={i18next.t('monitoring.networkThroughput.title')}>
                            <DualAxes onlyChangeData={true} {...netIOConfig} />
                        </ProCard>
                    </Col>
                    <Col xs={24} sm={24} md={24} lg={12}>
                        <ProCard title={i18next.t('monitoring.diskIO.title')}>
                            <DualAxes onlyChangeData={true} {...diskIOConfig} />
                        </ProCard>
                    </Col>
                </Row>


            </ProCard>
        </div>
    </>);
}

export default Monitoring;
