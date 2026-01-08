import { Form, Input, InputNumber, Modal, Select, Switch } from "antd";
import i18next from 'i18next';
import React, { useState } from 'react';
import { useQuery } from "react-query";
import storageApi from "../../api/storage";
import strings from "../../utils/strings";
import { renderSize } from "../../utils/utils";

const formItemLayout = {
    labelCol: {span: 6},
    wrapperCol: {span: 14},
};

const StorageModal = ({
                          visible,
                          handleOk,
                          handleCancel,
                          confirmLoading,
                          id,
                      }) => {

    const [form] = Form.useForm();

    useQuery('getStorageById', () => storageApi.getById(id), {
        enabled: visible && strings.hasText(id),
        onSuccess: data => {
            if (data['limitSize'] > 0) {
                let limitSize = renderSize(data['limitSize']);
                let ss = limitSize.split(' ');
                data['limitSize'] = parseInt(ss[0]);
                setUnit(ss[1]);
            } else {
                data['limitSize'] = -1;
            }
            form.setFieldsValue(data);
        },
    });

    let [unit, setUnit] = useState('MB');

    const selectAfter = (
        <Select value={unit} style={{width: 65}} onChange={(value) => {
            setUnit(value);
        }}>
            <Select.Option value="B">B</Select.Option>
            <Select.Option value="KB">KB</Select.Option>
            <Select.Option value="MB">MB</Select.Option>
            <Select.Option value="GB">GB</Select.Option>
            <Select.Option value="TB">TB</Select.Option>
            <Select.Option value="PB">PB</Select.Option>
            <Select.Option value="EB">EB</Select.Option>
            <Select.Option value="ZB">ZB</Select.Option>
            <Select.Option value="YB">YB</Select.Option>
        </Select>
    );

    return (
        <Modal
            title={id ? i18next.t('storage.modal.title.update') : i18next.t('storage.modal.title.create')}
            visible={visible}
            maskClosable={false}
            destroyOnClose={true}
            onOk={() => {
                form
                    .validateFields()
                    .then(async values => {
                        let limitSize = values['limitSize'];
                        switch (unit) {
                            case 'B':
                                break;
                            case 'KB':
                                limitSize = limitSize * 1024;
                                break;
                            case 'MB':
                                limitSize = limitSize * 1024 * 1024;
                                break;
                            case 'GB':
                                limitSize = limitSize * 1024 * 1024 * 1024;
                                break;
                            case 'TB':
                                limitSize = limitSize * 1024 * 1024 * 1024 * 1024 * 1024;
                                break;
                            case 'EB':
                                limitSize = limitSize * 1024 * 1024 * 1024 * 1024 * 1024 * 1024;
                                break;
                            case 'ZB':
                                limitSize = limitSize * 1024 * 1024 * 1024 * 1024 * 1024 * 1024 * 1024;
                                break;
                            case 'YB':
                                limitSize = limitSize * 1024 * 1024 * 1024 * 1024 * 1024 * 1024 * 1024 * 1024;
                                break;
                            default:
                                break;
                        }
                        values['limitSize'] = limitSize;
                        let ok = await handleOk(values);
                        if (ok) {
                            form.resetFields();
                        }
                    });
            }}
            onCancel={() => {
                form.resetFields();
                setUnit('MB');
                handleCancel();
            }}
            confirmLoading={confirmLoading}
            okText={i18next.t('storage.modal.okText')}
            cancelText={i18next.t('storage.modal.cancelText')}
        >

            <Form form={form} {...formItemLayout}>
                <Form.Item name='id' noStyle>
                    <Input hidden={true}/>
                </Form.Item>

                <Form.Item label={i18next.t('storage.modal.name.label')} name='name' rules={[{required: true, message: i18next.t('storage.modal.name.requiredMessage')}]}>
                    <Input autoComplete="off" placeholder={i18next.t('storage.modal.name.placeholder')}/>
                </Form.Item>

                <Form.Item label={i18next.t('storage.modal.isShare.label')} name='isShare' rules={[{required: true, message: i18next.t('storage.modal.isShare.requiredMessage')}]}
                           valuePropName="checked">
                    <Switch checkedChildren={i18next.t('storage.modal.isShare.checkedChildren')} unCheckedChildren={i18next.t('storage.modal.isShare.unCheckedChildren')}/>
                </Form.Item>

                <Form.Item label={i18next.t('storage.modal.limitSize.label')} name='limitSize' rules={[{required: true, message: i18next.t('storage.modal.limitSize.requiredMessage')}]}
                           tooltip={i18next.t('storage.modal.limitSize.tooltip')}>
                    <InputNumber min={-1} addonAfter={selectAfter} style={{width: 275}}/>
                </Form.Item>

            </Form>
        </Modal>
    )
};

export default StorageModal;
