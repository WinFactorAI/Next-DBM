import { Button, Checkbox, Form, Input, message, Modal, Select, Space, } from "antd";
import i18next from 'i18next';
import { useEffect, useState } from 'react';
import webhookApi from "../../api/webhook";
import workWebhookApi from "../../api/worker/command";
import { debugLog } from "../../common/logger";
const api = webhookApi;
const { TextArea } = Input;
const WebhookModal = ({
    visible,
    handleOk,
    handleCancel,
    confirmLoading,
    id,
    worker,
    serviceTypeOptions,
    actionsOptionsMap
}) => {
    const [form] = Form.useForm();
    const [actionsOptions, setActionsOptions] = useState([]);

    const onChangeUpdate = (checkedValues) => {
        debugLog('checked = ', checkedValues);
    };

    const handleChange = (value) => {
        if (value === 'build') {
            setActionsOptions(actionsOptionsMap['build']);
        } else if (value === 'asset') {
            setActionsOptions(actionsOptionsMap['asset']);
        } else if (value === 'sensitive') {
            setActionsOptions(actionsOptionsMap['sensitive']);
        } else if (value === 'trigger') {
            setActionsOptions(actionsOptionsMap['trigger']);
        } else {
            setActionsOptions([]);
        }
    };

    const formItemLayout = {
        labelCol: { span: 6 },
        wrapperCol: { span: 14 },
    };

    useEffect(() => {

        const getItem = async () => {
            let data;
            if (worker === true) {
                data = await workWebhookApi.getById(id);
            } else {
                data = await api.getById(id);
            }
            if (data) {
                handleChange(data.serviceType);
                form.setFieldsValue(data);
                form.setFieldValue('actions', data.actions.split(','));
            }
        }


        if (visible) {
            if (id) {
                getItem();
            } else {
                form.setFieldsValue({});
                form.setFieldValue('serviceType', 'build');
                handleChange('build');
            }
        } else {
            form.resetFields();
        }
    }, [visible]);

    return (

        <Modal
            title={id ? i18next.t('webhook.modal.title.update') : i18next.t('webhook.modal.title.create')}
            visible={visible}
            maskClosable={false}
            destroyOnClose={true}
            onCancel={() => {
                form.resetFields();
                handleCancel();
            }}
            confirmLoading={confirmLoading}
            okText={i18next.t('webhook.modal.okText')}
            cancelText={i18next.t('webhook.modal.closeText')}
            footer={
                <Space>
                    <Button onClick={handleCancel}>
                        {i18next.t('webhook.modal.closeText')}
                    </Button>
                    <Button
                        onClick={async () => {
                            try {
                                const values = await form.validateFields();
                                values.actions = values.actions.join(',');
                                await api.sendTest(values); // 自定义测试请求
                                message.success(i18next.t('webhook.modal.testSuccess', '测试发送成功'));
                            } catch (err) {
                                message.error(i18next.t('webhook.modal.testFail', '测试发送失败'));
                            }
                        }}
                    >
                        {i18next.t('webhook.modal.testText', '发送测试')}
                    </Button>
                    <Button
                        type="primary"
                        loading={confirmLoading}
                        onClick={() => {
                            form.setFieldValue('actions', form.getFieldValue("actions").join(','));
                            form.validateFields().then(async values => {
                                let ok = await handleOk(values);
                                if (ok) form.resetFields();
                            });
                        }}
                    >
                        {i18next.t('webhook.modal.okText')}
                    </Button>
                </Space>
            }
        >

            <Form form={form} {...formItemLayout}>
                <Form.Item name='id' noStyle>
                    <Input hidden={true} />
                </Form.Item>

                <Form.Item label={i18next.t('webhook.form.label.name')} name='name' rules={[{ required: true, message: i18next.t('webhook.form.placeholder.name') }]}>
                    <Input placeholder={i18next.t('webhook.form.placeholder.name')} />
                </Form.Item>

                <Form.Item label={i18next.t('webhook.form.label.webhook')} name='webhook' rules={[{ required: true, message: i18next.t('webhook.form.placeholder.webhook') }]}>
                    <Input placeholder={i18next.t('webhook.form.placeholder.webhook')} />
                </Form.Item>

                <Form.Item label={i18next.t('webhook.form.label.keyWord')} name='keyWord' rules={[{ required: false, message: i18next.t('webhook.form.placeholder.keyWord') }]}>
                    <Input placeholder={i18next.t('webhook.form.placeholder.keyWord')} />
                </Form.Item>

                <Form.Item label={i18next.t('webhook.form.label.encryption')} name='encryption' rules={[{ required: false, message: i18next.t('webhook.form.placeholder.encryption') }]}>
                    <Input placeholder={i18next.t('webhook.form.placeholder.encryption')} />
                </Form.Item>

                <Form.Item label={i18next.t('webhook.form.label.serviceType')} name='serviceType' rules={[{ required: true, message: i18next.t('webhook.form.placeholder.serviceType') }]}>
                    <Select
                        placeholder={i18next.t('webhook.form.placeholder.actions')}
                        defaultValue="build"
                        onChange={handleChange}
                        options={serviceTypeOptions}
                        disabled={id ? true : false}
                    />
                </Form.Item>

                <Form.Item label={i18next.t('webhook.form.label.actions')} name='actions' rules={[{ required: true, message: i18next.t('webhook.form.placeholder.actions') }]}>
                    <Checkbox.Group options={actionsOptions} onChange={onChangeUpdate} placeholder={i18next.t('webhook.form.placeholder.actions')} />
                </Form.Item>

                <Form.Item label={i18next.t('webhook.form.label.atUsers')} name='atUsers' rules={[{ required: false, message: i18next.t('webhook.form.placeholder.atUsers') }]}>
                    <Input placeholder={i18next.t('webhook.form.placeholder.atUsers')} />
                </Form.Item>

                <Form.Item label={i18next.t('webhook.form.label.content')} name='content' rules={[{ required: false, message: i18next.t('webhook.form.rules.content') }]}>
                    <TextArea autoSize={{ minRows: 5, maxRows: 10 }} placeholder={i18next.t('webhook.form.placeholder.content')} />
                </Form.Item>
            </Form>
        </Modal>
    )
};

export default WebhookModal;