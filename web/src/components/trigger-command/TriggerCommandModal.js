import { Form, Input, Modal } from "antd";
import i18next from 'i18next';
import React, { useEffect } from 'react';
import triggerCommandApi from "../../api/trigger-command";
import workTriggerCommandApi from "../../api/worker/command";
const api = triggerCommandApi;
const {TextArea} = Input;

const TriggerCommandModal = ({
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
                data = await workTriggerCommandApi.getById(id);
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
            title={id ? i18next.t('triggerCommand.modal.updateTitle') : i18next.t('triggerCommand.modal.newTitle')}
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
            okText={i18next.t('triggerCommand.modal.okText')}
            cancelText={i18next.t('triggerCommand.modal.closeText')}
        >

            <Form form={form} {...formItemLayout}>
                <Form.Item name='id' noStyle>
                    <Input hidden={true}/>
                </Form.Item>

                <Form.Item label={i18next.t('triggerCommand.modal.name.label')} name='name' rules={[{required: true, message: i18next.t('triggerCommand.modal.nameEmpty')}]}>
                    <Input placeholder={i18next.t('triggerCommand.modal.nameEmpty')}/>
                </Form.Item>

                <Form.Item label={i18next.t('triggerCommand.modal.content.label')} name='content' rules={[{required: true, message: i18next.t('triggerCommand.modal.contentEmpty')}]}>
                    <TextArea autoSize={{minRows: 5, maxRows: 10}} placeholder={i18next.t('triggerCommand.modal.content.placeholder')}/>
                </Form.Item>
            </Form>
        </Modal>
    )
};

export default TriggerCommandModal;
