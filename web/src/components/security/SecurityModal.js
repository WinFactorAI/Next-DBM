import { Form, Input, InputNumber, Modal, Radio } from "antd";
import i18next from 'i18next';
import React, { useEffect } from 'react';
import securityApi from "../../api/security";
const formItemLayout = {
    labelCol: {span: 6},
    wrapperCol: {span: 14},
};

const SecurityModal = ({
                           visible,
                           handleOk,
                           handleCancel,
                           confirmLoading,
                           id,
                       }) => {

    const [form] = Form.useForm();

    useEffect(() => {

        const getItem = async () => {
            let data = await securityApi.getById(id);
            if (data) {
                form.setFieldsValue(data);
            }
        }
        if (visible && id) {
            getItem();
        } else {
            form.setFieldsValue({
                priority: 50,
            });
        }
    }, [visible])

    return (
        <Modal
            title={id ? i18next.t('security.modal.title.update') : i18next.t('security.modal.title.create')}
            visible={visible}
            maskClosable={false}
            destroyOnClose={true}
            onOk={() => {
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
            okText={i18next.t('security.modal.button.ok')}
            cancelText={i18next.t('security.modal.button.cancel')}
        >

            <Form form={form} {...formItemLayout}>
                <Form.Item name='id' noStyle>
                    <Input hidden={true}/>
                </Form.Item>

                <Form.Item label={i18next.t('security.modal.label.ip')} name='ip' rules={[{required: true, message: i18next.t('security.modal.message.ip')}]} extra={i18next.t('security.modal.extra.ip')}>
                    <Input autoComplete="off" placeholder="请输入"/>
                </Form.Item>

                <Form.Item label={i18next.t('security.modal.label.rule')} name='rule' rules={[{required: true, message: i18next.t('security.modal.message.rule')}]}>
                    <Radio.Group onChange={async (e) => {

                    }}>
                        <Radio value={'allow'}>{i18next.t('security.modal.radio.allow')}</Radio>
                        <Radio value={'reject'}>{i18next.t('security.modal.radio.reject')}</Radio>
                    </Radio.Group>
                </Form.Item>

                <Form.Item label={i18next.t('security.modal.label.priority')} name='priority' rules={[{required: true, message: i18next.t('security.modal.message.priority')}]} extra={i18next.t('security.modal.extra.priority')}>
                    <InputNumber min={1} max={100}/>
                </Form.Item>

            </Form>
        </Modal>
    )
};

export default SecurityModal;
