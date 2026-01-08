import { Form, Input, message, Modal } from "antd";
import React, { useEffect, useState } from 'react';
import assetApi from "../../../api/asset";
import gitApi from "../../../api/git";
import { debugLog } from "../../../common/logger";

const api = gitApi;
const GitTagModal = ({id,shortId,visible, open, handleOk, handleCancel}) => {

    let [confirmLoading, setConfirmLoading] = useState(false);
    const [form] = Form.useForm();
    const formItemLayout = {
        labelCol: { span: 6 },
        wrapperCol: { span: 16 },
    };

    useEffect(() => {
        const getItem = async () => {
            let data;
            data.id =id
            data.shortId = shortId
            if (data) {
                form.setFieldsValue(data);
                setAssetInfo(data)
            }
        }

        if (visible) {
            debugLog("  ID ",id)
            debugLog("  shortId ",shortId)
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
        <Modal title="创建Tag"
               confirmLoading={confirmLoading}
               visible={visible}
               onOk={async () => {
                   setConfirmLoading(true);
                   form
                    .validateFields()
                    .then(async values => {
                        form.resetFields();
                        values.id = id
                        values.shortId = shortId
                        await gitApi.makeTag(values)
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
                <Form.Item name='shortId' noStyle>
                    <Input hidden={true} />
                </Form.Item>
                {/* <Form.Item label="分支" name="username" >
                    {itemDetail?.branch}
                </Form.Item>
                <Form.Item label="提交信息" name="username" >
                    {itemDetail?.message}
                </Form.Item>
                <Form.Item label="作者" name="username" >
                    {itemDetail?.author_email}
                </Form.Item>
                <Form.Item label="源资产" name="name" >
                    {assetInfo?.name}
                </Form.Item>
                <Form.Item label="源内容" name="content" >
                    {assetInfo?.content}
                </Form.Item> */}
                <Form.Item label="Tag名称" name='name' rules={[{ required: true, message: '请填写名称' }]}>
                     <Input />
                </Form.Item>
                <Form.Item label="信息" name='msg' rules={[{ required: true, message: '请填写信息' }]}>
                     <Input.TextArea showCount maxLength={100} />
                </Form.Item>
            </Form>
        </Modal>
    </div>);
};

export default GitTagModal;