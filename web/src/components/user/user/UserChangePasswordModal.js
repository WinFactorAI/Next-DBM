import { LockOutlined } from "@ant-design/icons";
import { Form, Input, Modal } from "antd";
import i18next from 'i18next';
import React from 'react';
const UserChangePasswordModal = ({visible, handleOk, handleCancel, confirmLoading}) => {

    const [form] = Form.useForm();

    return (
        <div>
            <Modal
                title={i18next.t('userChangePassword.modal.title')}
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
                okText={i18next.t('userChangePassword.modal.okText')}
                cancelText={i18next.t('userChangePassword.modal.cancelText')}
            >

                <Form form={form}>
                    <Form.Item name='password' rules={[{required: true, message: i18next.t('userChangePassword.modal.password.required')}]}>
                        <Input prefix={<LockOutlined/>} placeholder={i18next.t('userChangePassword.modal.password.placeholder')}/>
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};

export default UserChangePasswordModal;
