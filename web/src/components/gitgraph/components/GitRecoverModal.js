import { Form, Input, message, Modal, Select } from "antd";
import React, { useEffect, useState } from 'react';
import assetApi from "../../../api/asset";
import gitApi from "../../../api/git";
import triggerCommandGroupApi from "../../../api/trigger-command-group";
import { debugLog } from "../../../common/logger";

const api = gitApi;
const GitRecoverModal = ({id,itemDetail,visible, open, handleOk, handleCancel}) => {

    let [confirmLoading, setConfirmLoading] = useState(false);
 
  
    const [form] = Form.useForm();
    const [triggerCommandOptions, setTriggerCommandOptions] = useState([]); // 搜索框的值
    let [dbAssetsOptions, setDBAssetsOptions] = useState([]);
    let [databasesOptions, setDatabasesOptions] = useState([]);
    const [assetInfo ,setAssetInfo] =  useState({});
    const formItemLayout = {
        labelCol: { span: 6 },
        wrapperCol: { span: 16 },
    };

    useEffect(() => {

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
            // if (worker === true) {
            //     data = await workGitManagerApi.getById(id);
            // } else
             {
                data = await api.getById(id);
                data.tables = data.tables.split(',')
                data.gitRules = data.gitRules.split(',')

                await assetApi.tables({ id: data.assetId, database: data.database }).then((tables) => {
                    debugLog(" tables ", tables)
                    // setSelectedRowKeys(data.tables)

                })
            }
            if (data) {
                form.setFieldsValue(data);
                setAssetInfo(data)
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
    const onSearch = (value) => {
        debugLog('search:', value);
    };
    // 资产Id变化触发事件
    const handleAssetIdChange = async (assetId) => {
        const checkItem = dbAssetsOptions.find(item => item.id === assetId);
        debugLog(" checkItem ", checkItem)
        if (checkItem.active == false) {
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
        })
    }

    return (<div>
        <Modal title="恢复"
               confirmLoading={confirmLoading}
               visible={visible}
               onOk={async () => {
                   setConfirmLoading(true);
                    form
                    .validateFields()
                    .then(async values => {
                        form.resetFields();
                        debugLog(" itemDetail ",itemDetail)
                        values.branch= itemDetail?.branch
                        values.shortId = itemDetail?.short_id
                        await gitApi.recover(values).then(res =>{
                            // console.log(" res ",res)
                            if(res.code === 1){
                                message.success(res.message)
                            } else {
                                message.error(res.message)
                            }
                        })
                        await handleOk(values);
                    });
                   setConfirmLoading(false);
               }}
               onCancel={handleCancel}
               destroyOnClose={true}
        >
            <Form form={form} {...formItemLayout}>
                <Form.Item name='id' noStyle>
                    <Input hidden={true} />
                </Form.Item>
                <Form.Item label="分支" name="branch" >
                    {itemDetail?.branch}
                </Form.Item>
                <Form.Item label="提交信息" name="message" >
                    {itemDetail?.message}
                </Form.Item>
                <Form.Item label="作者" name="author_email" >
                    {itemDetail?.author_email}
                </Form.Item>
                <Form.Item label="源资产" name="name" >
                    {assetInfo?.name}
                </Form.Item>
                <Form.Item label="源内容" name="content" >
                    {assetInfo?.content}
                </Form.Item>
                

                <Form.Item label="目标资产" name='assetId' rules={[{ required: true, message: '请选择DB资产' }]}>
                    <Select onChange={handleAssetIdChange}
                        showSearch
                        placeholder="请选择DB资产"
                        optionFilterProp="children"
                        onSearch={onSearch}
                        filterOption={(input, option) =>
                            (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                        }
                    >
                        {dbAssetsOptions.map(item => {
                            return (
                                <Select.Option key={item.id} value={item.id}>{item.name} {item.active ? '已激活' : '未激活'}</Select.Option>)
                        })}
                    </Select>
                </Form.Item>
                <Form.Item label="目标数据库" name='database' rules={[{ required: true, message: '请选择DB资产' }]} help="DB资产的数据库">
                    <Select onChange={handleDatabasesChange}
                        showSearch
                        placeholder="请选择DB资产"
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
            </Form>
        </Modal>
    </div>);
};

export default GitRecoverModal;