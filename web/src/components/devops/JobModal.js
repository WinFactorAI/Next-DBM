import { Form, Input, Modal, Radio, Select, Spin } from "antd";
import i18next from 'i18next';
import { useState } from 'react';
import { useQuery } from "react-query";
import assetApi from "../../api/asset";
import jobApi from "../../api/job";
import { debugLog } from '../../common/logger';
import strings from "../../utils/strings";

const {TextArea} = Input;

const JobModal = ({
                      visible,
                      handleOk,
                      handleCancel,
                      confirmLoading,
                      id,
                  }) => {

    const [form] = Form.useForm();

    let [func, setFunc] = useState('build-job');
    let [mode, setMode] = useState('all');

    useQuery('getJobById', () => jobApi.getById(id), {
        enabled: visible && strings.hasText(id),
        onSuccess: data => {
            if (data['func'] === 'shell-job') {
                try {
                    data['shell'] = JSON.parse(data['metadata'])['shell'];
                } catch (e) {
                    data['shell'] = '';
                }
            }

            if (data.resourceIds) {
                data.resourceIds = data.resourceIds.split(',');
            }
            form.setFieldsValue(data);
            setMode(data['mode']);
            setFunc(data['func']);
        },
    });

    let resQuery = useQuery(`resQuery`, () => assetApi.GetAll('ssh'));

    let resOptions = resQuery.data?.map(item => {
        return {
            label: item.name,
            value: item.id
        }
    });

    const formItemLayout = {
        labelCol: {span: 6},
        wrapperCol: {span: 14},
    };

    return (
        <Modal
            title={id ? i18next.t('job.modal.update.title') : i18next.t('job.modal.create.title')}
            visible={visible}
            maskClosable={false}
            destroyOnClose={true}
            onOk={() => {
                form
                    .validateFields()
                    .then(async values => {
                        debugLog(values)
                        if (values['resourceIds']) {
                            values['resourceIds'] = values['resourceIds'].join(',');
                        }
                        form.resetFields();
                        handleOk(values);
                    });
            }}
            onCancel={() => {
                form.resetFields();
                handleCancel();
            }}
            confirmLoading={confirmLoading}
            okText='确定'
            cancelText='取消'
        >

            <Form form={form} {...formItemLayout}
                  initialValues={
                      {
                          func: 'build-job',
                          mode: 'all',
                      }
                  }>
                <Form.Item name='id' noStyle>
                    <Input hidden={true}/>
                </Form.Item>

                <Form.Item label={i18next.t('job.modal.func.label')} name='func' rules={[{required: true, message: i18next.t('job.modal.func.required')}]}>
                    <Select onChange={(value) => {
                        setFunc(value);
                        if(value !== 'check-asset-status-job'){
                            setMode('all')
                        }
                    }}>
                        {/* <Select.Option value="shell-job">Shell脚本</Select.Option> */}
                        <Select.Option value="git-job">{i18next.t('job.modal.type.git-job')}</Select.Option>
                        <Select.Option value="build-job">{i18next.t('job.modal.type.build-job')}</Select.Option>
                        <Select.Option value="check-asset-status-job">{i18next.t('job.modal.type.check-asset-status-job')}</Select.Option>
                    </Select>
                </Form.Item>

                <Form.Item label={i18next.t('job.modal.name.label')} name='name' rules={[{required: true, message: i18next.t('job.modal.name.required')}]}>
                    <Input autoComplete="off" placeholder={i18next.t('job.modal.name.required')}/>
                </Form.Item>

                {
                    func === 'shell-job' ?
                        <Form.Item label={i18next.t('job.modal.shell.label')} name='shell'
                                   rules={[{required: true, message: i18next.t('job.modal.shell.required')}]}>
                            <TextArea autoSize={{minRows: 5, maxRows: 10}} placeholder={i18next.t('job.modal.shell.required')}/>
                        </Form.Item> : undefined
                }

                <Form.Item label={i18next.t('job.modal.cron.label')} name='cron' rules={[{required: true, message: i18next.t('job.modal.cron.required')}]}>
                    <Input placeholder={i18next.t('job.modal.cron.required')}/>
                </Form.Item>
                
                {
                    func === 'check-asset-status-job' ?
                    <Form.Item label={i18next.t('job.modal.mode.label')} name='mode' rules={[{required: true, message: i18next.t('job.modal.mode.required')}]}>
                        <Radio.Group onChange={async (e) => {
                            setMode(e.target.value);
                        }}>
                            <Radio value={'all'}>{i18next.t('job.modal.mode.all')}</Radio>
                            <Radio value={'custom'}>{i18next.t('job.modal.mode.custom')}</Radio>
                            <Radio value={'self'}>{i18next.t('job.modal.mode.self')}</Radio>
                        </Radio.Group>
                    </Form.Item> : undefined
                }

                {
                    mode === 'custom' &&
                    <Spin tip={i18next.t('job.modal.spin.loading')} spinning={resQuery.isLoading}>
                        <Form.Item label={i18next.t('job.modal.resourceIds.label')} name='resourceIds' rules={[{required: true}]}>
                            <Select
                                mode="multiple"
                                allowClear
                                placeholder={i18next.t('job.modal.resourceIds.required')}
                                options={resOptions}
                            >
                            </Select>
                        </Form.Item>
                    </Spin>
                }
            </Form>
        </Modal>
    )
};

export default JobModal;
