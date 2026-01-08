import { DesktopOutlined } from "@ant-design/icons";
import { Checkbox, Form, Input, message, Modal, Select, Space, Table, Tabs, Tooltip } from "antd";
import i18next from 'i18next';
import { useEffect, useState } from 'react';
import assetApi from "../../api/asset";
import credentialApi from "../../api/credential";
import gitApi from "../../api/git";
import triggerCommandGroupApi from "../../api/trigger-command-group";
import workGitManagerApi from "../../api/worker/command";
import { debugLog } from "../../common/logger";
const api = gitApi;

const { TextArea } = Input;
const { Option } = Select;
const { OptGroup } = Select;
const { Search } = Input;


const GitManagerModal = ({
    visible,
    handleOk,
    handleCancel,
    confirmLoading,
    id,
    worker
}) => {

    const protocolMapping = {
        'Git': [
            { text: i18next.t('git.modal.label.password'), value: 'custom' },
            { text: i18next.t('git.modal.label.privateKey'), value: 'private-key' },
            { text: i18next.t('git.modal.label.credential'), value: 'credential' },
        ],
    }
    const [form] = Form.useForm();
    let [accountType, setAccountType] = useState('custom');
    let [protocolOptions, setProtocolOptions] = useState(protocolMapping['Git']);
    let [credentials, setCredentials] = useState([]);
    let [dbAssetsOptions, setDBAssetsOptions] = useState([]);
    let [databasesOptions, setDatabasesOptions] = useState([]);
    let [tableData, setTableData] = useState([]);
    const [filteredData, setFilteredData] = useState(tableData); // 搜索过滤后的数据
    const [selectedRowKeys, setSelectedRowKeys] = useState([]);
    const [triggerCommandOptions, setTriggerCommandOptions] = useState([]); // 搜索框的值
    const formItemLayout = {
        labelCol: { span: 4 },
        wrapperCol: { span: 20 },
    };


    useEffect(() => {
        setProtocolOptions(protocolMapping['Git'])
        const getDBAsset = async () => {
            let items = await assetApi.getAll();
            setDBAssetsOptions(items)
            debugLog("result", items)
        }
        const getTriggerCommandOptions = async () => {
            let items = await triggerCommandGroupApi.getAll();
            setTriggerCommandOptions(items)
            debugLog("result", items)
        }

        const getItem = async () => {
            let data;
            if (worker === true) {
                data = await workGitManagerApi.getById(id);
            } else {
                data = await api.getById(id);
                data.tables = data.tables.split(',')
                data.gitRules = data.gitRules.split(',')

                await assetApi.tables({ id: data.assetId, database: data.database }).then((tables) => {
                    debugLog(" tables ", tables)
                    setTableData(tables)
                    setFilteredData(tables)
                    setSelectedRowKeys(data.tables)

                })
            }
            if (data) {
                form.setFieldsValue(data);
            }
        }

        if (visible) {
            getDBAsset();
            getTriggerCommandOptions();
            if (id) {
                getItem();
            } else {
                form.setFieldsValue({});
            }
        } else {
            form.resetFields();
        }
    }, [visible]);

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
    const handleGitTriggerRulesChange = (checkedValues) => {

    }
    //根据资产id获取数据库

    // 资产Id变化触发事件
    const handleAssetIdChange = async (assetId) => {
        const checkItem = dbAssetsOptions.find(item => item.id === assetId);
        debugLog(" checkItem ", checkItem)
        if (checkItem.active === false) {
            message.error('未激活资产')
        } else {
            debugLog(" result handleAssetIdChange ", assetId)
            setDatabasesOptions([]);
            let items = await assetApi.databases({ id: assetId });
            setDatabasesOptions(items)
            debugLog("result", items)
        }
    }
    // 数据库变化触发事件
    const handleDatabasesChange = async (database) => {
        debugLog(" result handleDatabasesChange ", database)
        // 获取表单指定字段值
        const assetId = form.getFieldValue('assetId');
        await assetApi.tables({ id: assetId, database: database }).then((tables) => {
            debugLog(" tables ", tables)
            setTableData(tables)
            setFilteredData(tables)
        })
    }
    const formLayout = {
        labelCol: { span: 6 },
        wrapperCol: { span: 16 },
    };
    const gitRulesOptions = [
        {
            label: i18next.t('git.modal.option.gitRule.insert'),
            value: 'autoStructs',
        },
        // {
        //     label: i18next.t('git.modal.option.gitRule.delete'), 
        //     value: 'delete',
        // },
        // {
        //     label: i18next.t('git.modal.option.gitRule.update'),
        //     value: 'update',
        // },
    ];
    const onChangeUpdate = (checkedValues) => {
        console.log('checked = ', checkedValues);
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
            title: i18next.t('git.modal.table.column.tableName'),
            dataIndex: 'name',
            render: (text) => <a>{text}</a>,
        },
        {
            title: i18next.t('git.modal.table.column.comment'),
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



    const basicView = <div className='basic' >
        <Form.Item name="disTables" hidden={true}>
            <Input />
        </Form.Item>
        <Form.Item label={i18next.t('git.modal.label.name')} name='name' rules={[{ required: true, message: i18next.t('git.modal.validation.required.name') }]}>
            <Input placeholder={i18next.t('git.modal.placeholder.name')} />
        </Form.Item>

        <Form.Item label={i18next.t('git.modal.label.content')} name='content' rules={[{ required: true, message: i18next.t('git.modal.validation.required.content') }]}>
            <TextArea autoSize={{ minRows: 5, maxRows: 10 }} placeholder={i18next.t('git.modal.placeholder.content')} />
        </Form.Item>
        <Form.Item label={i18next.t('git.modal.label.dbAsset')} name='assetId' rules={[{ required: true, message: i18next.t('git.modal.validation.required.dbAsset') }]}>
            <Select onChange={handleAssetIdChange}
                showSearch
                placeholder={i18next.t('git.modal.placeholder.dbAsset')}
                optionFilterProp="children"
                onSearch={onSearch}
                filterOption={(input, option) =>
                    (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                }
            >
                {dbAssetsOptions.map(item => {
                    return (
                        <Option key={item.id} value={item.id}>{item.name} {item.active ? i18next.t('git.modal.status.active') : i18next.t('git.modal.status.inactive')}</Option>)
                })}
            </Select>
        </Form.Item>
        <Form.Item label={i18next.t('git.modal.label.database')} name='database' rules={[{ required: true, message: i18next.t('git.modal.validation.required.database') }]} help={i18next.t('git.modal.help.dbAsset')}>
            <Select onChange={handleDatabasesChange}
                showSearch
                placeholder={i18next.t('git.modal.placeholder.database')}
                optionFilterProp="children"
                onSearch={onSearch}
                filterOption={(input, option) =>
                    (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                }
            >
                {databasesOptions.map(item => {
                    return (<Option key={item} value={item}>{item}</Option>)
                })}
            </Select>
        </Form.Item>
        <Form.Item label={i18next.t('git.modal.label.tables')} name='tables' help={i18next.t('git.modal.help.tables')}>
            <Space direction="vertical" style={{ width: '100%', }}>
                <Search
                    placeholder={i18next.t('git.modal.placeholder.searchTables')}
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
                    scroll={{
                        y: 240,
                    }}
                    pagination={false}
                />
            </Space>
        </Form.Item>
        <Form.Item label={i18next.t('git.modal.label.sqls')} name='sqls' help={i18next.t('git.modal.help.sqls')}>
            <TextArea autoSize={{ minRows: 5, maxRows: 10 }} placeholder={i18next.t('git.modal.help.sqls')} />
            {/* <EditableTable></EditableTable> */}
        </Form.Item>
        <Form.Item label={i18next.t('git.modal.label.gitRules')} name='gitRules' help={i18next.t('git.modal.help.gitRules')}>
            <Checkbox.Group options={gitRulesOptions} defaultValue={[]} onChange={onChangeUpdate} />
        </Form.Item>
        <Form.Item label={i18next.t('git.modal.label.gitTriggerRules')} name='gitTriggerRules' rules={[{ required: true, message: i18next.t('git.modal.validation.required.gitTriggerRules') }]} help={i18next.t('git.modal.help.gitTriggerRules')}>
            <Select onChange={handleGitTriggerRulesChange}
                showSearch
                placeholder={i18next.t('git.modal.validation.required.gitTriggerRules')}
                optionFilterProp="children"
                onSearch={onSearch}
                filterOption={(input, option) =>
                    (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                }
            >
                {triggerCommandOptions.map(item => {
                    return (
                        <Option key={item.id} value={item.id}>{item.name} {item.protocol}</Option>)
                })}
            </Select>
        </Form.Item>
    </div>;
    const advancedView = <div className='advanced'>
        <Form.Item label={i18next.t('git.modal.label.gitUrl')} name='gitUrl'  >
            <Input placeholder={i18next.t('git.modal.placeholder.gitUrl')} />
        </Form.Item>

        <Form.Item label={i18next.t('git.modal.label.accountType')} name='accountType'>
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
                    <Form.Item label={i18next.t('git.modal.label.credential')} name='credentialId'
                        rules={[{ required: true, message: i18next.t('git.modal.validation.required.credential') }]}>
                        <Select onChange={() => null}>
                            {credentials.map(item => {
                                return (
                                    <Option key={item.id} value={item.id}>
                                        <Tooltip placement="topLeft" title={i18next.t('git.modal.label.credential')}>
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
                    <Form.Item label={i18next.t('git.modal.label.username')} name='username'>
                        <Input autoComplete="off" placeholder={i18next.t('git.modal.placeholder.username')} />
                    </Form.Item>

                    <Form.Item label={i18next.t('git.modal.label.password')} name='password'>
                        <Input.Password autoComplete="off" placeholder={i18next.t('git.modal.placeholder.password')} />
                    </Form.Item>
                </>
                : null
        }

        {
            accountType === 'private-key' ?
                <>
                    <Form.Item label={i18next.t('git.modal.label.username')} name='username'>
                        <Input placeholder={i18next.t('git.modal.placeholder.username')} />
                    </Form.Item>

                    <Form.Item label={i18next.t('git.modal.label.privateKey')} name='privateKey'
                        rules={[{ required: true, message: i18next.t('git.modal.validation.required.privateKey') }]}>
                        <TextArea rows={4} />
                    </Form.Item>
                    <Form.Item label={i18next.t('git.modal.label.passphrase')} name='passphrase'>
                        <TextArea rows={1} />
                    </Form.Item>
                </>
                : null
        }
    </div>
    return (

        <Modal
            className='dbm-modal'
            width="800px"
            title={id ? i18next.t('git.modal.title.edit') : i18next.t('git.modal.title.create')}
            visible={visible}
            maskClosable={false}
            destroyOnClose={true}
            onOk={() => {
                form.setFieldValue('tables', selectedRowKeys.join(','));
                const unselectedRows = tableData
                    .filter(item => !selectedRowKeys.includes(item.key))
                    .map(item => item.key);
                console.log(' unselectedRows ', unselectedRows);
                form.setFieldValue('disTables', unselectedRows.join(','));
                let gitRules = form.getFieldValue('gitRules')
                if (gitRules) {
                    debugLog(' gitRules ', gitRules);
                    form.setFieldValue('gitRules', gitRules.join(','));
                }
                form
                    .validateFields()
                    .then(async values => {
                        let ok = await handleOk(values);
                        if (ok) {
                            form.resetFields();
                        }
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

            <Form form={form} {...formItemLayout}>
                <Form.Item name='id' noStyle>
                    <Input hidden={true} />
                </Form.Item>

                <Tabs
                    defaultActiveKey="basic"
                    items={[
                        {
                            label: <span><DesktopOutlined />{i18next.t('git.modal.tab.basic')}</span>,
                            key: 'basic',
                            children: basicView,
                        },
                        // {
                        //     label: <span><ControlOutlined />{i18next.t('git.modal.tab.advanced')}</span>,
                        //     key: 'advanced',
                        //     children: advancedView,
                        // },
                    ]}
                />

            </Form>
        </Modal>
    )
};

export default GitManagerModal;
