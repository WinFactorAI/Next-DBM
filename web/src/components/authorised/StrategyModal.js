import { Form, Input, Modal, Switch } from "antd";
import i18next from 'i18next';
import React, { useEffect } from 'react';
import strategyApi from "../../api/strategy";
const api = strategyApi;

const formItemLayout = {
    labelCol: {span: 6},
    wrapperCol: {span: 14},
};

const StrategyModal = ({visible, handleOk, handleCancel, confirmLoading, id}) => {

    const [form] = Form.useForm();

    useEffect(() => {

        const getItem = async () => {
            let data = await api.getById(id);
            if (data) {
                form.setFieldsValue(data);
            }
        }
        if (visible && id) {
            getItem();
        } else {
            form.setFieldsValue({
                upload: false,
                download: false,
                edit: false,
                delete: false,
                rename: false,
                copy: false,
                paste: false,
            });
        }
    }, [visible]);

    return (
        <Modal
            title={id ? i18next.t('strategy.modal.updateStrategy') : i18next.t('strategy.modal.createStrategy')}
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
            okText={i18next.t('strategy.modal.confirm')}
            cancelText={i18next.t('strategy.modal.cancel')}
        >

            <Form form={form} {...formItemLayout}>
                <Form.Item name='id' noStyle>
                    <Input hidden={true}/>
                </Form.Item>

                <Form.Item label={i18next.t('strategy.modal.name.label')} name='name' rules={[{required: true, message: i18next.t('strategy.modal.name.required')}]}>
                    <Input autoComplete="off" placeholder={i18next.t('strategy.modal.name.placeholder')}/>
                </Form.Item>

                <Form.Item label={i18next.t('strategy.modal.upload.label')} name='upload' rules={[{required: true, message: i18next.t('strategy.modal.upload.required')}]} valuePropName="checked">
                    <Switch checkedChildren={i18next.t('strategy.modal.upload.checkedChildren')} unCheckedChildren={i18next.t('strategy.modal.upload.unCheckedChildren')}/>
                </Form.Item>

                <Form.Item label={i18next.t('strategy.modal.download.label')} name='download' rules={[{required: true, message: i18next.t('strategy.modal.download.required')}]} valuePropName="checked">
                    <Switch checkedChildren={i18next.t('strategy.modal.download.checkedChildren')} unCheckedChildren={i18next.t('strategy.modal.download.unCheckedChildren')}/>
                </Form.Item>

                <Form.Item label={i18next.t('strategy.modal.edit.label')} name='edit' rules={[{required: true, message: i18next.t('strategy.modal.edit.required')}]} valuePropName="checked"
                           tooltip={i18next.t('strategy.modal.edit.tooltip')}>
                    <Switch checkedChildren={i18next.t('strategy.modal.edit.checkedChildren')} unCheckedChildren={i18next.t('strategy.modal.edit.unCheckedChildren')}/>
                </Form.Item>

                <Form.Item label={i18next.t('strategy.modal.delete.label')} name='delete' rules={[{required: true, message: i18next.t('strategy.modal.delete.required')}]} valuePropName="checked">
                    <Switch checkedChildren={i18next.t('strategy.modal.delete.checkedChildren')} unCheckedChildren={i18next.t('strategy.modal.delete.unCheckedChildren')}/>
                </Form.Item>

                <Form.Item label={i18next.t('strategy.modal.rename.label')} name='rename' rules={[{required: true, message: i18next.t('strategy.modal.rename.required')}]} valuePropName="checked">
                    <Switch checkedChildren={i18next.t('strategy.modal.rename.checkedChildren')} unCheckedChildren={i18next.t('strategy.modal.rename.unCheckedChildren')}/>
                </Form.Item>

                <Form.Item label={i18next.t('strategy.modal.copy.label')} name='copy' rules={[{required: true, message: i18next.t('strategy.modal.copy.required')}]} valuePropName="checked">
                    <Switch checkedChildren={i18next.t('strategy.modal.copy.checkedChildren')} unCheckedChildren={i18next.t('strategy.modal.copy.unCheckedChildren')}/>
                </Form.Item>

                <Form.Item label={i18next.t('strategy.modal.paste.label')} name='paste' rules={[{required: true, message: i18next.t('strategy.modal.paste.required')}]} valuePropName="checked">
                    <Switch checkedChildren={i18next.t('strategy.modal.paste.checkedChildren')} unCheckedChildren={i18next.t('strategy.modal.paste.unCheckedChildren')}/>
                </Form.Item>
            </Form>
        </Modal>
    )
};

export default StrategyModal;
