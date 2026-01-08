import { Form, Input, Modal, Select } from "antd";
import i18next from 'i18next';
import React, { useEffect, useState } from 'react';
import credentialApi from "../../api/credential";
const {TextArea} = Input;
const api = credentialApi;


const CredentialModal = ({
                             visible,
                             handleOk,
                             handleCancel,
                             confirmLoading,
                             id,
                         }) => {
    const accountTypes = [
        {text: i18next.t('credential.modal.label.accountType.password'), value: 'custom'},
        {text: i18next.t('credential.modal.label.accountType.privateKey'), value: 'private-key'},
    ];
                            
    const [form] = Form.useForm();

    const formItemLayout = {
        labelCol: {span: 6},
        wrapperCol: {span: 14},
    };

    let [type, setType] = useState('');

    const handleAccountTypeChange = v => {
        setType(v);
    }

    useEffect(() => {

        const getItem = async () => {
            let data = await api.getById(id);
            if (data) {
                form.setFieldsValue(data);
                setType(data['type']);
            }
        }


        if (visible) {
            if (id) {
                getItem();
            }else {
                form.setFieldsValue({
                    type: 'custom',
                });
            }
        } else {
            form.resetFields();
        }
    }, [visible]);

    return (

        <Modal
            title={id ? i18next.t('credential.modal.title.update') : i18next.t('credential.modal.title.create')}
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
            okText={i18next.t('credential.modal.button.ok')}
            cancelText={i18next.t('credential.modal.button.cancel')}
        >

            <Form form={form} {...formItemLayout}>
                <Form.Item name='id' noStyle>
                    <Input hidden={true}/>
                </Form.Item>

                <Form.Item label={i18next.t('credential.modal.label.credentialName')} name='name' rules={[{required: true, message: i18next.t('credential.modal.placeholder.credentialName')}]}>
                    <Input placeholder={i18next.t('credential.modal.placeholder.credentialName')}/>
                </Form.Item>

                <Form.Item label={i18next.t('credential.modal.label.accountType')} name='type' rules={[{required: true, message: i18next.t('credential.modal.placeholder.accountType')}]}>
                    <Select onChange={handleAccountTypeChange}>
                        {accountTypes.map(item => {
                            return (<Select.Option key={item.value} value={item.value}>{item.text}</Select.Option>)
                        })}
                    </Select>
                </Form.Item>

                {
                    type === 'private-key' ?
                        <>
                            <Form.Item label={i18next.t('credential.modal.label.authorizedAccount')} name='username'>
                                <Input placeholder={i18next.t('credential.modal.placeholder.authorizedAccount')}/>
                            </Form.Item>

                            <Form.Item label={i18next.t('credential.modal.label.privateKey')} name='privateKey' rules={[{required: true, message: i18next.t('credential.modal.placeholder.privateKey')}]}>
                                <TextArea rows={4}/>
                            </Form.Item>
                            <Form.Item label={i18next.t('credential.modal.label.passphrase')} name='passphrase'>
                                <TextArea rows={1}/>
                            </Form.Item>
                        </>
                        :
                        <>
                            <input type='password' hidden={true} autoComplete='new-password'/>
                            <Form.Item label={i18next.t('credential.modal.label.authorizedAccount')} name='username'>
                                <Input placeholder={i18next.t('credential.modal.placeholder.authorizedAccount')}/>
                            </Form.Item>

                            <Form.Item label={i18next.t('credential.modal.label.authorizedPassword')} name='password'>
                                <Input.Password placeholder={i18next.t('credential.modal.placeholder.authorizedPassword')}/>
                            </Form.Item>
                        </>

                }

            </Form>
        </Modal>
    )
};

export default CredentialModal;
