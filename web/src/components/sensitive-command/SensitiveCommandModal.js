import { Form, Input, Modal } from "antd";
import i18next from 'i18next';
import React, { useEffect } from 'react';
import sensitiveCommandApi from "../../api/sensitive-command";
import workSensitiveCommandApi from "../../api/worker/command";
const api = sensitiveCommandApi;
const {TextArea} = Input;

const SensitiveCommandModal = ({
                          visible,
                          handleOk,
                          handleCancel,
                          confirmLoading,
                          id,
                          worker
                      }) => {
    const [form] = Form.useForm();

    const formItemLayout = {
        labelCol: {span: 6},
        wrapperCol: {span: 14},
    };

    useEffect(() => {

        const getItem = async () => {
            let data;
            if (worker === true) {
                data = await workSensitiveCommandApi.getById(id);
            } else {
                data = await api.getById(id);
            }
            if (data) {
                form.setFieldsValue(data);
            }
        }


        if (visible) {
            if (id) {
                getItem();
            } else {
                form.setFieldsValue({});
            }
        } else {
            form.resetFields();
        }
    }, [visible]);

    return (

        <Modal
            title={id ? i18next.t('sensitiveCommand.modal.title.update') : i18next.t('sensitiveCommand.modal.title.create')}
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
            okText={i18next.t('sensitiveCommand.modal.okText')}
            cancelText={i18next.t('sensitiveCommand.modal.cancelText')}
        >

            <Form form={form} {...formItemLayout}>
                <Form.Item name='id' noStyle>
                    <Input hidden={true}/>
                </Form.Item>

                <Form.Item label={i18next.t('sensitiveCommand.modal.form.name.label')} name='name' rules={[{required: true, message: i18next.t('sensitiveCommand.modal.form.name.rules.required')}]}>
                    <Input placeholder={i18next.t('sensitiveCommand.modal.form.name.placeholder')}/>
                </Form.Item>

                <Form.Item label={i18next.t('sensitiveCommand.modal.form.content.label')} name='content' rules={[{required: true, message: i18next.t('sensitiveCommand.modal.form.content.rules.required')}]}>
                    <TextArea autoSize={{minRows: 5, maxRows: 10}} placeholder={i18next.t('sensitiveCommand.modal.form.content.placeholder')}/>
                </Form.Item>
            </Form>
        </Modal>
    )
};

export default SensitiveCommandModal;
