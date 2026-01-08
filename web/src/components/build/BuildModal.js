import { BellOutlined, ControlOutlined, DesktopOutlined, MinusCircleOutlined, PlusOutlined } from "@ant-design/icons";
import { Anchor, Button, Checkbox, Divider, Form, Input, Modal, Select, Space, Table, Tabs, Typography, message } from "antd";
import i18next from 'i18next';
import { useEffect, useState } from 'react';
import assetApi from "../../api/asset";
import buildApi from "../../api/build";
import buildTriggerApi from "../../api/build-trigger";
import gitApi from "../../api/git";
import workBuildManagerApi from "../../api/worker/command";
import { debugLog } from "../../common/logger";
import EnglishInput from "./components/EnglishInput";
import SqlsEditer from "./components/SqlsEditer";
const { Link } = Anchor;
const api = buildApi;
const { TextArea } = Input;
const { Search } = Input;
const { Paragraph } = Typography;
const BuildModal = ({
    visible,
    handleOk,
    handleCancel,
    confirmLoading,
    id,
    worker
}) => {
    const [form] = Form.useForm();
    const [gitId, setGitId] = useState([]);
    const [gitOptions, setGitOptions] = useState([]);
    const [activeTab, setActiveTab] = useState('basic');
    const [host, setHost] = useState("")
    const [selectedRowKeys, setSelectedRowKeys] = useState([]);
    const formItemLayout = {
        labelCol: { span: 6 },
        wrapperCol: { span: 18 },
    };

    useEffect(() => {
        const getHost = async () => {
            let result = await buildTriggerApi.getHost();
            setHost(result);
        }
        getHost();
        const getGitAll = async () => {
            let items = await gitApi.getAll();
            setGitOptions(items)
            debugLog("result", items)
        }
        getGitAll();


        const getDBAsset = async () => {
            let items = await assetApi.getAll();
            setDBAssetsOptions(items)
            debugLog("result", items)
        }
        const getItem = async () => {
            let data;
            if (worker === true) {
                data = await workBuildManagerApi.getById(id);
            } else {
                data = await api.getById(id);
                let trigger = []
                data.triggers.forEach(element => {
                    trigger.push(element.trigger)
                });
                data.webhook = trigger
                data.triggers = data.triggers
                setCheckedValues(trigger)
                // let triggerParams = {
                //     pageIndex: 1,
                //     pageSize: 100,
                //     buildId: id
                // }
                // await buildTriggerApi.getPaging(triggerParams).then(res => {
                //     // debugLog("res",res)
                //     let trigger = []
                //     res.items.forEach(element => {
                //         trigger.push(element.trigger)
                //     });
                //     data.webhook = trigger
                //     data.triggers  = res.items
                //     setCheckedValues(trigger)
                // });
                data.stables = data.stables.split(',')
                data.buildRules = data.buildRules.split(',')


                await assetApi.tables({ id: data.sassetId, database: data.sdatabase }).then((tables) => {
                    debugLog(" tables ", tables)
                    setTableData(tables)
                    setFilteredData(tables)
                    setSelectedRowKeys(data.stables)

                })
            }
            if (data) {
                debugLog(" # data", data)
                form.setFieldsValue(data);

            }
        }


        if (visible) {
            getDBAsset()
            if (id) {
                getItem();
            } else {
                form.setFieldsValue({});
            }
        } else {
            form.setFieldsValue({});
        }
    }, [visible]);
    const plainOptions = [
        // { label: i18next.t('build.modal.trigger.type.timer'), value: 'timer' },
        { label: i18next.t('build.modal.trigger.type.http'), value: 'Https' },
        // { label: i18next.t('build.modal.trigger.type.gitLab'), value: 'gitLab' },
        // { label: i18next.t('build.modal.trigger.type.gitHub'), value: 'gitHub' },
        // { label: i18next.t('build.modal.trigger.type.gitee'), value: 'gitee' },
    ];




    const options = [];
    for (let i = 10; i < 36; i++) {
        options.push({
            value: i.toString(36) + i,
            label: i.toString(36) + i,
        });
    }
    const handleChange = (value, triggerIndex) => {
        debugLog(`selected ${value}`);
        const enName = form.getFieldValue('enName') || [];
        const triggers = form.getFieldValue('triggers') || [];
        debugLog(" triggers ", triggers)
        const updatedTriggers = triggers.map((trigger, index) => {
            if (index === triggerIndex) {
                // 更新匹配到的 triggerIndex 对应的项
                return {
                    ...trigger,
                    webhookUrl: `${host}building/${enName}/start`, // 生成新的 webhookUrl
                };
            }
            return trigger; // 其他的 trigger 不变
        });
        form.setFieldsValue({ triggers: updatedTriggers });
    };

    const getSecreToken = (triggerIndex) => {
        buildTriggerApi.getSecreToken().then(res => {
            debugLog(" res ", res)
            debugLog(" triggerIndex ", triggerIndex)

            setSecreTokens((prev) => ({
                ...prev,
                [triggerIndex]: res, // 更新指定触发器的 token
            }));
            form.setFieldValue(['triggers', triggerIndex, 'secreToken'], res);
        }).catch(err => {
            debugLog("Error fetching Secret Token:", err);
        });
    }



    // 用于格式化显示的逻辑（可选）
    const formatText = (text) => {
        return text.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    };
    const handleEnNameChange = (value) => {
        // setInputValue(value);  // 更新 EnglishInput 的值
        // 当任务名改变时，动态更新 Form.List 中的 webhookUrl
        const triggers = form.getFieldValue('triggers') || [];
        debugLog(" triggers ", triggers)
        const updatedTriggers = triggers.map((trigger, index) => ({
            ...trigger,
            webhookUrl: `${host}building/${value}/start`, // 动态生成 webhook URL
        }));
        form.setFieldsValue({ triggers: updatedTriggers });
    };

    const handleAccountTypeChange = v => {
        // setAccountType(v);
        // if (v === 'credential') {
        //     getCredentials();
        // }
    }

    let [dbAssetsOptions, setDBAssetsOptions] = useState([]);
    const [secreTokens, setSecreTokens] = useState({}); // 管理多个触发器的 secreToken
    let [databasesOptions, setDatabasesOptions] = useState([]);
    let [ddatabaseOptions, setDDatabaseOptions] = useState([]);

    let [tableData, setTableData] = useState([]);
    const [filteredData, setFilteredData] = useState(tableData); // 搜索过滤后的数据


    // 资产Id变化触发事件
    const handleSAssetIdChange = async (assetId) => {
        const checkItem = dbAssetsOptions.find(item => item.id === assetId);
        debugLog(" checkItem ", checkItem)
        if (checkItem.active == false) {
            message.error('未激活资产')
        } else {
            debugLog(" result handleAssetIdChange ", assetId)
            setDatabasesOptions([]);
            let items = await assetApi.databases({ id: assetId });
            setDatabasesOptions(items)
        }
    }
    // 数据库变化触发事件
    const handleSDatabasesChange = async (database) => {
        debugLog(" result handleDatabasesChange ", database)
        // 获取表单指定字段值
        const assetId = form.getFieldValue('sassetId');
        await assetApi.tables({ id: assetId, database: database }).then((tables) => {
            debugLog(" tables ", tables)
            setTableData(tables)
            setFilteredData(tables)
        })
    }

    const handleDAssetIdChange = async (assetId) => {
        const checkItem = dbAssetsOptions.find(item => item.id === assetId);
        debugLog(" checkItem ", checkItem)
        if (checkItem.active == false) {
            message.error('未激活资产')
        } else {
            debugLog(" result handleDAssetIdChange assetId ", assetId)
            const sdatabase = form.getFieldValue('sdatabase');
            debugLog(" result handleDAssetIdChange sdatabase ", sdatabase)
            // setDatabasesOptions([]);
            let items = await assetApi.databases({ id: assetId });
            // 过滤 items 中符合特定条件的数据
            // let filteredItems = items.filter(item => {
            //     // 假设你要过滤出 name 字段等于某个值的项
            //     return item !== sdatabase;  // 这里的条件根据实际需求修改
            // });
            setDDatabaseOptions(items)
        }
    }
    const formLayout = {
        labelCol: { span: 6 },
        wrapperCol: { span: 16 },
    };
    const buildRulesOptions = [
        {
            label: '新增结构版本',
            value: 'autoStructs',
        },
        // {
        //     label: '删除结构错误忽略',
        //     value: 'deleteErrorIgnore',
        // },
        // {
        //     label: '删除数据错误忽略',
        //     value: 'deleteDataIgnore',
        // },
    ];
    const onChangeUpdate = (checkedValues) => {
        debugLog('checked = ', checkedValues);
    };

    const [checkedValues, setCheckedValues] = useState([]); // 默认选中 'Apple'
    const onSearch = (value) => {
        debugLog('search:', value);
    };

    const onSearchTabls = (value) => {
        const filtered = tableData.filter((item) =>
            Object.values(item).some((val) =>
                String(val).toLowerCase().includes(value.toLowerCase())
            )
        );
        setFilteredData(filtered);
    }
    // Checkbox.Group 变化时的处理函数
    const onChangeCheckboxGroup = (checkedValues) => {
        debugLog('checked = ', checkedValues);
        setCheckedValues(checkedValues); // 更新选中的值
    };
    const columns = [
        {
            title: i18next.t('build.modal.table.name'),
            dataIndex: 'name',
            render: (text) => <a>{text}</a>,
        },
        {
            title: i18next.t('build.modal.table.comment'),
            dataIndex: 'comment',
        },
    ];


    // rowSelection object indicates the need for row selection
    const rowSelection = {
        selectedRowKeys,
        onChange: (keys, selectedRows) => {
            setSelectedRowKeys(keys);
        },
        getCheckboxProps: (record) => ({
            disabled: record.name === 'Disabled User',
            // Column configuration not to be checked
            name: record.name,
        }),
    };


    const basicView = <div className='basic' style={{ marginTop: 16 }}>
        {/* <Divider orientation="left">基本信息</Divider> */}
        <Form.Item label={i18next.t('build.modal.basic.name.label')} name='name' rules={[{ required: true, message: i18next.t('build.modal.basic.name.rules') }]}>
            <Input placeholder={i18next.t('build.modal.basic.name.placeholder')} />
        </Form.Item>

        <Form.Item label={i18next.t('build.modal.basic.content.label')} name='content' rules={[{ required: true, message: i18next.t('build.modal.basic.content.rules') }]}>
            <TextArea autoSize={{ minRows: 2, maxRows: 10 }} placeholder={i18next.t('build.modal.basic.content.placeholder')} />
        </Form.Item>
        <Form.Item label={i18next.t('build.modal.basic.sasset.label')} name='sassetId' rules={[{ required: true, message: i18next.t('build.modal.basic.sasset.rules') }]} help={i18next.t('build.modal.basic.sasset.help')}>
            <Select onChange={handleSAssetIdChange}
                showSearch
                placeholder={i18next.t('build.modal.basic.sasset.placeholder')}
                optionFilterProp="children"
                onSearch={onSearch}
                filterOption={(input, option) =>
                    (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                }
            >
                {dbAssetsOptions.map(item => {
                    return (<Select.Option key={item.id} value={item.id}>{item.name} {item.active ? i18next.t('build.modal.asset.status.active') : i18next.t('build.modal.asset.status.inactive')}</Select.Option>)
                })}
            </Select>
        </Form.Item>
        <Form.Item label={i18next.t('build.modal.basic.sdatabase.label')} name='sdatabase' rules={[{ required: true, message: i18next.t('build.modal.basic.sasset.rules') }]} help={i18next.t('build.modal.basic.sasset.help')}>
            <Select onChange={handleSDatabasesChange}
                showSearch
                placeholder={i18next.t('build.modal.basic.sasset.placeholder')}
                optionFilterProp="children"
                onSearch={onSearch}
                filterOption={(input, option) =>
                    (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                }
            >
                {databasesOptions.map(item => {
                    return (<Select.Option key={item} value={item}>{item}</Select.Option>)
                })}
            </Select>
        </Form.Item>
        <Form.Item label={i18next.t('build.modal.basic.stables.label')} name='stables' >
            <Space direction="vertical" style={{ width: '100%', }}>
                <Search
                    placeholder={i18next.t('build.modal.basic.searchTables.placeholder')}
                    onSearch={onSearchTabls}
                    style={{
                        width: '100%',
                        marginBottom: '10px',
                    }}
                    allowClear
                />
                <Table
                    size="small"
                    rowSelection={{
                        type: 'checkbox',
                        ...rowSelection,
                    }}
                    columns={columns}
                    dataSource={filteredData}
                    scroll={{ y: 240, }}
                    pagination={false}
                />
            </Space>
        </Form.Item>

        <Form.Item label={i18next.t('build.modal.basic.sqls.label')} name='sqls' help={i18next.t('build.modal.basic.sqls.placeholder')}>
            <SqlsEditer id={"buildEditor"} height={'400'} sql={form.getFieldValue('sqls')} onChange={(value) => form.setFieldValue('sqls', value)} />
        </Form.Item>
        <Form.Item label={i18next.t('build.modal.basic.buildRules.label')} name='buildRules' help={i18next.t('build.modal.basic.buildRules.help')}>
            <Checkbox.Group options={buildRulesOptions} defaultValue={['Apple']} onChange={onChangeUpdate} />
        </Form.Item>

        <Form.Item label={i18next.t('build.modal.basic.dasset.label')} name='dassetId' rules={[{ required: true, message: i18next.t('build.modal.basic.dasset.rules') }]} >
            <Select onChange={handleDAssetIdChange}
                showSearch
                placeholder={i18next.t('build.modal.basic.dasset.placeholder')}
                optionFilterProp="children"
                onSearch={onSearch}
                filterOption={(input, option) =>
                    (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                }
            >
                {dbAssetsOptions.map(item => {
                    return (
                        <Select.Option key={item.id} value={item.id}>{item.name} {item.active ? i18next.t('build.modal.asset.status.active') : i18next.t('build.modal.asset.status.inactive')}</Select.Option>)
                })}
            </Select>
        </Form.Item>
        <Form.Item label={i18next.t('build.modal.basic.ddatabase.label')} name='ddatabase' rules={[{ required: true, message: i18next.t('build.modal.basic.dasset.rules') }]} >
            <Select
                showSearch
                placeholder={i18next.t('build.modal.basic.dasset.placeholder')}
                optionFilterProp="children"
                onSearch={onSearch}
                filterOption={(input, option) =>
                    (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                }
            >
                {ddatabaseOptions.map(item => {
                    return (<Select.Option key={item} value={item}>{item}</Select.Option>)
                })}
            </Select>
        </Form.Item>
    </div>

    const triggerView = <div className='basic' style={{ marginTop: 16 }}>
        <Form.Item label={i18next.t('build.modal.trigger.enName.label')} name='enName' rules={[{ required: true, message: i18next.t('build.modal.trigger.enName.rules') }]}>
            <EnglishInput onChange={handleEnNameChange} />
        </Form.Item>
        <Form.List name="triggers">
            {(triggersFields, { add, remove }) => (
                <>

                    <div className="formList-box">
                        {triggersFields.map(({ key, name, fieldKey, ...restField }) => (
                            <div key={key}>
                                <Divider orientation="left">{i18next.t('build.modal.trigger.dividerTitle')} {name + 1}
                                    <Button shape="link" danger icon={<MinusCircleOutlined />} onClick={() => remove(name)}></Button>
                                </Divider>
                                <Form.Item
                                    {...restField}
                                    label={i18next.t('build.modal.trigger.type.label')}
                                    name={[name, 'trigger']}
                                    rules={[{ required: true, message: i18next.t('build.modal.trigger.type.rules') }]}
                                    fieldKey={[fieldKey, 'trigger']}>
                                    <Select
                                        style={{
                                            textAlign: 'left',
                                            width: '200px',
                                        }}
                                        placeholder={i18next.t('build.modal.trigger.type.placeholder')}
                                        onChange={(value) => handleChange(value, name)}
                                        options={plainOptions}
                                    />
                                </Form.Item>

                                <Form.Item
                                    {...restField}
                                    label={i18next.t('build.modal.trigger.webhookUrl.label')}
                                    name={[name, 'webhookUrl']}
                                    fieldKey={[fieldKey, 'webhookUrl']}
                                    rules={[{ required: true, message: i18next.t('build.modal.trigger.webhookUrl.rules') }]}
                                >
                                    <Paragraph copyable>
                                        {form.getFieldValue(['triggers', name, 'webhookUrl']) || '暂无 URL'}
                                    </Paragraph>
                                </Form.Item>
                                <Form.Item
                                    {...restField}
                                    label={i18next.t('build.modal.trigger.secreToken.label')}
                                    name={[name, 'secreToken']}
                                    fieldKey={[fieldKey, 'secreToken']}
                                    rules={[{ required: true, message: i18next.t('build.modal.trigger.webhookUrl.rules') }]}
                                >
                                    <Space direction="horizontal">
                                        <Input placeholder={i18next.t('build.modal.trigger.secreToken.placeholder')} style={{ width: 320 }}
                                            value={secreTokens[name] || form.getFieldValue(['triggers', name, 'secreToken']) || ''}
                                            onChange={(e) => {
                                                // 让用户手动输入时更新 secreTokens 状态
                                                setSecreTokens((prev) => ({
                                                    ...prev,
                                                    [name]: e.target.value,
                                                }));
                                                // 更新 Form 中的对应字段值
                                                form.setFieldValue(['triggers', name, 'secreToken'], e.target.value);
                                            }} />
                                        <Button onClick={() => {
                                            getSecreToken(name);  // 传入当前触发器索引
                                        }}>{i18next.t('build.modal.trigger.generateBtn')}</Button>
                                    </Space>
                                </Form.Item>
                                {/* <Form.Item
                                    {...restField}
                                    label={i18next.t('build.modal.trigger.webhookUrl.label')}
                                >
                                    <Paragraph copyable>
                                        {form.getFieldValue(['triggers', name, 'webhookUrl'])+ "&secreToken="+form.getFieldValue(['triggers', name, 'secreToken']) || '暂无 URL'}
                                    </Paragraph>
                                </Form.Item>      */}
                            </div>
                        ))}
                    </div>
                    <Form.Item label={i18next.t('build.modal.trigger.dividerTitle')} className="add">
                        <Space direction="vertical">
                            <Button
                                onClick={() => add()}
                                icon={<PlusOutlined />}>
                                {i18next.t('build.modal.trigger.addTrigger')}
                            </Button>
                        </Space>
                    </Form.Item>
                </>
            )}
        </Form.List>
    </div>

    const [webhookOptions, setWebhookOptions] = useState([]);
    const getWebhookOptions = async (action) => {
        // let params = {
        //     pageIndex: 1,
        //     pageSize: 100,
        //     serviceType: "build",
        // }
        // const res = await webhookApi.getPaging(params);

        // const items = Array.isArray(res?.items) ? res.items : [];
        // debugLog(" webhook items ", items)
        // setWebhookOptions(items)
    }
    useEffect(() => {
        getWebhookOptions()
    }, []);
    const webhookView = <div className='basic' style={{ marginTop: 16 }}>
        <Form.Item label={i18next.t('build.modal.tabs.webhook.label')} name='webhookId'>
            <Select
                placeholder={i18next.t('webhook.form.placeholder.actions')}
                options={webhookOptions.map(item => ({ value: item.id, label: item.name }))}
                allowClear
            />
        </Form.Item>
    </div>
    return (

        <Modal
            className="dbm-modal"
            width={700}
            title={id ? i18next.t('build.modal.title.update') : i18next.t('build.modal.title.create')}
            visible={visible}
            maskClosable={false}
            destroyOnClose={true}
            onOk={() => {
                form.setFieldValue('stables', selectedRowKeys.join(','));
                let buildRules = form.getFieldValue('buildRules')
                if (buildRules) {
                    debugLog(' buildRules ', buildRules);
                    form.setFieldValue('buildRules', buildRules.join(','));
                }

                form
                    .validateFields()
                    .then(async values => {
                        let ok = await handleOk(values);
                        if (ok) {
                            form.resetFields();
                        }
                    })
                    .catch((errorInfo) => {
                        // 定位错误字段所在的 Tab
                        const errorFields = errorInfo.errorFields;
                        if (errorFields.length > 0) {
                            const firstErrorField = errorFields[0].name[0];
                            debugLog(' firstErrorField ', firstErrorField);
                            if (firstErrorField === 'enName') {
                                setActiveTab('advanced'); // 切换到触发器 Tab
                            } else {
                                setActiveTab('basic');
                            }
                        }
                    });
            }}
            onCancel={() => {
                form.resetFields();
                handleCancel();
            }}
            confirmLoading={confirmLoading}
            okText={i18next.t('build.modal.actions.confirm')}
            cancelText={i18next.t('build.modal.actions.cancel')}
        >

            <Form form={form} {...formItemLayout}>
                <Form.Item name='id' noStyle>
                    <Input hidden={true} />
                </Form.Item>

                <Tabs
                    activeKey={activeTab}
                    onChange={(key) => setActiveTab(key)}
                    items={[
                        {
                            label: <span><DesktopOutlined />{i18next.t('build.modal.tabs.basic')}</span>,
                            key: 'basic',
                            children: basicView,
                            forceRender: true,
                        },
                        {
                            label: <span><ControlOutlined />{i18next.t('build.modal.tabs.trigger')}</span>,
                            key: 'advanced',
                            children: triggerView,
                            forceRender: true,
                        },
                        {
                            label: <span><BellOutlined />{i18next.t('build.modal.tabs.webhook')}</span>,
                            key: 'webhook',
                            children: webhookView,
                            forceRender: true,
                        }
                    ]}
                />
            </Form>
        </Modal>
    )
};

export default BuildModal;
