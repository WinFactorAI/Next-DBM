import { Checkbox, Form, Input, InputNumber, Modal, Radio } from "antd";
import i18next from 'i18next';
import React, { useEffect } from 'react';
import loginPolicyApi from "../../api/login-policy";
import DragWeekTime from "../../dd/drag-weektime/DragWeekTime";
const formItemLayout = {
    labelCol: {span: 4},
    wrapperCol: {span: 18},
};

let wkRef = React.createRef();

const LoginPolicyModal = ({
                              visible,
                              handleOk,
                              handleCancel,
                              confirmLoading,
                              id,
                              userId
                          }) => {

    const [form] = Form.useForm();

    useEffect(() => {

        const getItem = async () => {
            let data = await loginPolicyApi.getById(id);
            if (data) {
                form.setFieldsValue(data);
                wkRef.current.renderWeekTime(data.timePeriod);
            }
        }
        if (visible && id) {
            getItem();
        } else {
            form.setFieldsValue({
                ipGroup: '0.0.0.0/0',
                priority: 50,
                rule: 'reject',
                enabled: true
            });
        }
    }, [visible])

    return (
        <Modal
            title={id ? i18next.t('loginPolicy.modal.updateTitle') : i18next.t('loginPolicy.modal.createTitle')}
            visible={visible}
            maskClosable={false}
            destroyOnClose={true}
            width={900}
            onOk={() => {
                form
                    .validateFields()
                    .then(async values => {
                        values['userId'] = userId;
                        let ok = await handleOk(values);
                        if (ok) {
                            form.resetFields();
                        }
                    });
            }}
            onCancel={() => {
                form.resetFields();
                wkRef.current.reset();
                handleCancel();
            }}
            confirmLoading={confirmLoading}
            okText='确定'
            cancelText='取消'
        >

            <Form form={form} {...formItemLayout}>
                <Form.Item name='id' noStyle>
                    <Input hidden={true}/>
                </Form.Item>

                <Form.Item label={i18next.t('loginPolicy.modal.nameLabel')} name='name' rules={[{required: true}]}>
                    <Input autoComplete="off" placeholder={i18next.t('loginPolicy.modal.namePlaceholder')}/>
                </Form.Item>

                <Form.Item label={i18next.t('loginPolicy.modal.priorityLabel')} name='priority' rules={[{required: true}]} extra={i18next.t('loginPolicy.modal.priorityExtra')}>
                    <InputNumber autoComplete="off" min={1} max={100}/>
                </Form.Item>

                <Form.Item label={i18next.t('loginPolicy.modal.ipGroupLabel')} name='ipGroup' rules={[{required: true}]}
                           extra={i18next.t('loginPolicy.modal.ipGroupExtra')}>
                    <Input autoComplete="off"/>
                </Form.Item>

                <Form.Item label={i18next.t('loginPolicy.modal.timePeriodLabel')} name='timePeriod'>
                    <DragWeekTime onRef={wkRef}/>
                </Form.Item>

                <Form.Item label={i18next.t('loginPolicy.modal.ruleLabel')} name='rule' rules={[{required: true, message: '请选择规则'}]}>
                    <Radio.Group>
                        <Radio value={'allow'}>{i18next.t('loginPolicy.modal.ruleAllow')}</Radio>
                        <Radio value={'reject'}>{i18next.t('loginPolicy.modal.ruleReject')}</Radio>
                    </Radio.Group>
                </Form.Item>

                <Form.Item label={i18next.t('loginPolicy.modal.enabledLabel')} name='enabled' valuePropName="checked" rules={[{required: true}]}>
                    <Checkbox/>
                </Form.Item>
            </Form>
        </Modal>
    )
};

export default LoginPolicyModal;
