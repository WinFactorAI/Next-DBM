import { Form, Input, Modal } from "antd";
import i18next from 'i18next';
import React, { useEffect } from 'react';
import commandApi from "../../api/command";
import workCommandApi from "../../api/worker/command";
const api = commandApi;
const {TextArea} = Input;

const CommandModal = ({
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
                data = await workCommandApi.getById(id);
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
            title={id ? i18next.t('commandModal.modal.title.update') : i18next.t('commandModal.modal.title.create')}
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
            okText={i18next.t('commandModal.button.ok')}
            cancelText={i18next.t('commandModal.button.cancel')}
        >

            <Form form={form} {...formItemLayout}>
                <Form.Item name='id' noStyle>
                    <Input hidden={true}/>
                </Form.Item>

                <Form.Item label={i18next.t('commandModal.form.label.name')} name='name' rules={[{required: true, message: i18next.t('commandModal.form.placeholder.name')}]}>
                    <Input placeholder={i18next.t('commandModal.form.placeholder.name')}/>
                </Form.Item>

                <Form.Item label={i18next.t('commandModal.form.label.content')} name='content' rules={[{required: true, message: i18next.t('commandModal.form.rules.content')}]}>
                    <TextArea autoSize={{minRows: 5, maxRows: 10}} placeholder={i18next.t('commandModal.form.placeholder.content')}/>
                </Form.Item>
            </Form>
        </Modal>
    )
};

export default CommandModal;