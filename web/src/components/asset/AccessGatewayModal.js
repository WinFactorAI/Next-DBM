import { Form, Input, InputNumber, Modal, Select } from "antd";
import i18next from 'i18next';
import { useEffect, useState } from 'react';
import accessGatewayApi from "../../api/access-gateway";
const formItemLayout = {
    labelCol: {span: 6},
    wrapperCol: {span: 14},
};

const {TextArea} = Input;
const api = accessGatewayApi;

const AccessGatewayModal = ({
                                visible,
                                handleOk,
                                handleCancel,
                                confirmLoading,
                                id,
                            }) => {

    const [form] = Form.useForm();
    let [gatewayType, setGatewayType] = useState('ssh');
    let [accountType, setAccountType] = useState('password');

    const handleGatewayTypeChange = v => {
        setGatewayType(v);
        form.setFieldValue('port', v === 'ssh' ? 22 : 443)
    }

    const handleAccountTypeChange = v => {
        setAccountType(v);
    }

    useEffect(() => {

        const getItem = async () => {
            let data = await api.getById(id);
            if (data) {
                form.setFieldsValue(data);
                setGatewayType(data['gatewayType']);
                setAccountType(data['accountType']);
            }
        }

        if (visible) {
            if(id){
                getItem();
            }else {
                form.setFieldsValue({
                    gatewayType: 'ssh',
                    accountType: 'password',
                    port: 22,
                });
                // TODO: resolve this issue in guacd
                setGatewayType('ssh');
                setAccountType('password');
            }
        } else {
            form.resetFields();
        }
    }, [visible]);

    return (
        <Modal
            title={id ? i18next.t('accessGateway.modal.title.update') : i18next.t('accessGateway.modal.title.create')}
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
            okText={i18next.t('accessGateway.modal.okText')}
            cancelText={i18next.t('accessGateway.modal.cancelText')}
        >
            <Form form={form} {...formItemLayout}>
                <Form.Item name='id' noStyle>
                    <Input hidden={true}/>
                </Form.Item>
                <Form.Item label={i18next.t('accessGateway.modal.gatewayType.label')} name='gatewayType'
                        rules={[{required: true, message: i18next.t('accessGateway.modal.gatewayType.placeholder')}]}>
                    <Select onChange={handleGatewayTypeChange}>
                        <Select.Option key='ssh' value='ssh'>{i18next.t('accessGateway.modal.gatewayType.ssh')}</Select.Option>
                        {/* <Select.Option key='rdp' value='rdp'>{i18next.t('accessGateway.modal.gatewayType.rdp')}</Select.Option> */}
                    </Select>
                </Form.Item>
                <Form.Item label={i18next.t('accessGateway.modal.name.label')} name='name' rules={[{required: true, message: i18next.t('accessGateway.modal.name.placeholder')}]}>
                    <Input placeholder={i18next.t('accessGateway.modal.name.placeholder')}/>
                </Form.Item>

                <Form.Item label={i18next.t('accessGateway.modal.ip.label')} name='ip' rules={[{required: true, message: i18next.t('accessGateway.modal.ip.placeholder')}]}>
                    <Input placeholder={i18next.t('accessGateway.modal.ip.placeholder')}/>
                </Form.Item>

                <Form.Item label={i18next.t('accessGateway.modal.port.label')} name='port' rules={[{required: true, message: i18next.t('accessGateway.modal.port.placeholder')}]}>
                    <InputNumber min={1} max={65535} placeholder={i18next.t('accessGateway.modal.port.placeholder')}/>
                </Form.Item>
                {gatewayType === 'ssh' &&
                <>
                    <Form.Item label={i18next.t('accessGateway.modal.accountType.label')} name='accountType'
                            rules={[{required: true, message: i18next.t('accessGateway.modal.accountType.placeholder')}]}>
                        <Select onChange={handleAccountTypeChange}>
                            <Select.Option key='password' value='password'>{i18next.t('accessGateway.modal.accountType.password')}</Select.Option>
                            <Select.Option key='private-key' value='private-key'>{i18next.t('accessGateway.modal.accountType.privateKey')}</Select.Option>
                        </Select>
                    </Form.Item>

                    {
                        accountType === 'password' ?
                            <>
                                <input type='password' hidden={true} autoComplete='new-password'/>
                                <Form.Item label={i18next.t('accessGateway.modal.username.label')} name='username'
                                        rules={[{required: true}]}>
                                    <Input placeholder={i18next.t('accessGateway.modal.username.placeholder')}/>
                                </Form.Item>

                                <Form.Item label={i18next.t('accessGateway.modal.password.label')} name='password'
                                        rules={[{required: true}]}>
                                    <Input.Password placeholder={i18next.t('accessGateway.modal.password.placeholder')}/>
                                </Form.Item>
                            </>
                            :
                            <>
                                <Form.Item label={i18next.t('accessGateway.modal.username.label')} name='username' rules={[{required: true}]}>
                                    <Input placeholder={i18next.t('accessGateway.modal.username.placeholder')}/>
                                </Form.Item>

                                <Form.Item label={i18next.t('accessGateway.modal.privateKey.label')} name='privateKey'
                                        rules={[{required: true, message: i18next.t('accessGateway.modal.privateKey.placeholder')}]}>
                                    <TextArea rows={4}/>
                                </Form.Item>
                                <Form.Item label={i18next.t('accessGateway.modal.passphrase.label')} name='passphrase'>
                                    <TextArea rows={1}/>
                                </Form.Item>
                            </>
                    }
                </>
            }
            </Form>
        </Modal>
    )
};

export default AccessGatewayModal;
