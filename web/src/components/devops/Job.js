import { ProTable } from "@ant-design/pro-components";
import { Button, ConfigProvider, Layout, message, Popconfirm, Switch, Tag, Tooltip } from "antd";
import dayjs from "dayjs";
import i18next from 'i18next';
import React, { useEffect, useState } from 'react';
import jobApi from "../../api/job";
import localeConfig from '../../common/localeConfig';
import Show from "../../dd/fi/show";
import ColumnState, { useColumnState } from "../../hook/column-state";
import { hasMenu } from "../../service/permission";
import './Job.css';
import JobLog from "./JobLog";
import JobModal from "./JobModal";

const {Content} = Layout;

const actionRef = React.createRef();

const api = jobApi;

const Job = () => {
    let [visible, setVisible] = useState(false);
    let [confirmLoading, setConfirmLoading] = useState(false);
    let [selectedRowKey, setSelectedRowKey] = useState(undefined);

    let [logVisible, setLogVisible] = useState(false);

    let [execLoading, setExecLoading] = useState([]);
    const [columnsStateMap, setColumnsStateMap] = useColumnState(ColumnState.JOB);

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
            title: i18next.t('job.column.name'),
            dataIndex: 'name',
            key: 'name',
            sorter: true,
        }
        , {
            title: i18next.t('job.column.status'),
            dataIndex: 'status',
            key: 'status',
            hideInSearch: true,
            render: (status, record, index) => {
                return <Switch disabled={!hasMenu('job-change-status')} checkedChildren={i18next.t('job.status.running')} unCheckedChildren={i18next.t('job.status.not-running')}
                               checked={status === 'running'}
                               onChange={(checked) => handleChangeStatus(record['id'], checked ? 'running' : 'not-running', index)}
                />
            }
        }, {
            title: i18next.t('job.column.func'),
            dataIndex: 'func',
            key: 'func',
            hideInSearch: true,
            render: (func, record) => {
                switch (func) {
                    case "check-asset-status-job":
                        return <Tag color="green">{i18next.t('job.type.check-asset-status-job')}</Tag>;
                    case "shell-job":
                        return <Tag color="volcano">{i18next.t('job.type.shell-job')}</Tag>;
                    case "build-job":
                        return <Tag color="volcano">{i18next.t('job.type.build-job')}</Tag>;
                    case "git-job":
                        return <Tag color="blue">{i18next.t('job.type.git-job')}</Tag>;     
                    default:
                        return '';
                }
            }
        }, {
            title: i18next.t('job.column.cron'),
            dataIndex: 'cron',
            key: 'cron',
            hideInSearch: true,
        }, {
            title: i18next.t('job.column.created'),
            dataIndex: 'created',
            key: 'created',
            hideInSearch: true,
            render: (text, record) => {
                return (
                    <Tooltip title={text}>
                        {dayjs(text).fromNow()}
                    </Tooltip>
                )
            },
            sorter: true,
        }, {
            title: i18next.t('job.column.updated'),
            dataIndex: 'updated',
            key: 'updated',
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
            sorter: true,
        },
        {
            title: i18next.t('job.column.operation'),
            valueType: 'option',
            key: 'option',
            render: (text, record, index, action) => [
                <Show menu={'job-run'} key={'job-run'}>
                    <a
                        key="exec"
                        disabled={execLoading[index]}
                        onClick={() => handleExec(record['id'], index)}
                    >
                        {i18next.t('job.action.exec')}
                    </a>
                </Show>,
                <Show menu={'job-log'} key={'job-log'}>
                    <a
                        key="logs"
                        onClick={() => handleShowLog(record['id'])}
                    >
                        {i18next.t('job.action.logs')}
                    </a>
                </Show>,
                <Show menu={'job-edit'} key={'job-edit'}>
                    <a
                        key="edit"
                        onClick={() => {
                            setVisible(true);
                            setSelectedRowKey(record['id']);
                        }}
                    >
                        {i18next.t('job.action.edit')}
                    </a>
                </Show>,
                <Show menu={'job-del'} key={'job-del'}>
                    <Popconfirm
                        key={'confirm-delete'}
                        title={i18next.t('job.modal.confirm.delete')}
                        onConfirm={async () => {
                            await api.deleteById(record.id);
                            actionRef.current.reload();
                        }}
                        okText={i18next.t('job.modal.confirm.ok')}
                        cancelText={i18next.t('job.modal.confirm.cancel')}
                    >
                        <a key='delete' className='danger'>{i18next.t('job.action.delete')}</a>
                    </Popconfirm>
                </Show>,
            ],
        },
    ];

    const handleChangeStatus = async (id, status, index) => {
        await api.changeStatus(id, status);
        actionRef.current.reload();
    }

    const handleExec = async (id, index) => {
        message.loading({content: i18next.t('job.message.exec.loading'), key: id, duration: 30});
        execLoading[index] = true;
        setExecLoading(execLoading.slice());

        await api.exec(id);

        message.success({content: i18next.t('job.message.exec.success'), key: id});
        execLoading[index] = false;
        setExecLoading(execLoading.slice());
        actionRef.current.reload();
    }

    const handleShowLog = (id) => {
        setLogVisible(true);
        setSelectedRowKey(id);
    }

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
                        let items = result['items'];

                        for (let i = 0; i < items.length; i++) {
                            execLoading.push(false);
                        }
                        setExecLoading(execLoading.slice());

                        return {
                            data: items,
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
                    headerTitle={i18next.t('job.table.title')}
                    toolBarRender={() => [
                        <Show menu={'job-add'}>
                            <Button key="button" type="primary" onClick={() => {
                                setVisible(true)
                            }}>
                                {i18next.t('job.modal.title.new')}
                            </Button>
                        </Show>,
                    ]}
                />

                <JobModal
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
                            if (values['func'] === 'shell-job') {
                                values['metadata'] = JSON.stringify({
                                    'shell': values['shell']
                                });
                            }
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

                <JobLog
                    id={selectedRowKey}
                    visible={logVisible}
                    handleCancel={() => {
                        setLogVisible(false);
                        setSelectedRowKey(undefined);
                    }}
                >

                </JobLog>
            </Content>
        </ConfigProvider>
    );
}

export default Job;
