import { Form, Input, Modal, Radio, Select, TreeSelect } from "antd";
import i18next from 'i18next';
import React, { useState } from 'react';
import { useQuery } from "react-query";
import roleApi from "../../../api/role";
import userApi from "../../../api/user";
import userGroupApi from "../../../api/user-group";
import { debugLog } from "../../../common/logger";
import strings from "../../../utils/strings";
const formItemLayout = {
    labelCol: {span: 6},
    wrapperCol: {span: 14},
};

const UserModal = ({visible, handleOk, handleCancel, confirmLoading, id}) => {

    const [form] = Form.useForm();

    let [userType, setUserType] = useState('user');

    let rolesQuery = useQuery('rolesQuery', roleApi.GetAll);

    useQuery('userQuery', () => userApi.getById(id), {
        enabled: visible && strings.hasText(id),
        onSuccess: (data) => {
            if (data.roles === null) {
                data.roles = undefined;
            }
            form.setFieldsValue(data);
            setUserType(data?.type);
        }
    });
    const [treeData, setTreeData] = useState([]);
    useQuery('treeData', () => userGroupApi.getAll(), {
        enabled: visible,
        onSuccess: (data) => {
            const convertTreeData = (data) => {
                return data.map(item => ({
                    title: item.name,  // 将原始字段映射到 name
                    value: item.id,      // 映射到 id
                    children: item.subItems ? convertTreeData(item.subItems) : undefined
                }));
            };

            setTreeData(convertTreeData(data))
        }
    });

    const onChange = (newValue) => {
        // setValue(newValue);
        // console.log(" newValue ",newValue)
    };
    return (
        <Modal
            title={id ? i18next.t('user.modal.title.update') : i18next.t('user.modal.title.create')}
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
            okText={i18next.t('user.modal.okText')}
            cancelText={i18next.t('user.modal.cancelText')}
        >

            <Form form={form} {...formItemLayout} >
                <Form.Item name='id' noStyle>
                    <Input hidden={true}/>
                </Form.Item>
                <Form.Item label={i18next.t('user.modal.label.userGroup')} name='userGroupId'>
                    <TreeSelect
                        showSearch
                        treeData={treeData}
                        style={{
                            width: '100%',
                        }}
                        dropdownStyle={{
                            maxHeight: 400,
                            overflow: 'auto',
                        }}
                        placeholder={i18next.t('user.modal.placeholder.userGroup')}
                        allowClear
                        treeDefaultExpandAll
                        onChange={onChange}

                    />
                </Form.Item>
                <Form.Item label={i18next.t('user.modal.label.username')} name='username' rules={[{required: true, message: i18next.t('user.modal.placeholder.username')}]}>
                    <Input autoComplete="off" placeholder={i18next.t('user.modal.placeholder.username')}/>
                </Form.Item>

                <Form.Item label={i18next.t('user.modal.label.nickname')} name='nickname' rules={[{required: true, message: i18next.t('user.modal.placeholder.nickname')}]}>
                    <Input placeholder={i18next.t('user.modal.placeholder.nickname')}/>
                </Form.Item>

                <Form.Item label={i18next.t('user.modal.label.type')} name='type' rules={[{required: true, message: i18next.t('user.modal.placeholder.roles')}]}>
                    <Radio.Group onChange={(e) => {
                        debugLog(e.target.value);
                        setUserType(e.target.value);
                    }}>
                        <Radio value={'user'}>{i18next.t('user.modal.radio.user')}</Radio>
                        <Radio value={'admin'}>{i18next.t('user.modal.radio.admin')}</Radio>
                    </Radio.Group>
                </Form.Item>

                {
                    userType === 'admin' &&
                    <Form.Item label={i18next.t('user.modal.label.roles')} name='roles' rules={[{required: true, message: i18next.t('user.modal.placeholder.roles')}]}>
                        <Select
                            mode="multiple"
                            allowClear
                            style={{width: '100%'}}
                            placeholder={i18next.t('user.modal.placeholder.roles')}
                        >
                            {rolesQuery.data?.map(role => {
                                return <Select.Option key={role.id}>{role.name}</Select.Option>
                            })}
                        </Select>
                    </Form.Item>
                }


                <Form.Item label={i18next.t('user.modal.label.mail')} name="mail"
                           rules={[{required: false, type: "email", message: i18next.t('user.modal.placeholder.mail')}]}>
                    <Input type='email' placeholder={i18next.t('user.modal.placeholder.mail')}/>
                </Form.Item>

                {
                    !id ?
                        (<Form.Item label={i18next.t('user.modal.label.password')} name='password'
                                    rules={[{required: true, message: i18next.t('user.modal.placeholder.password')}]}>
                            <Input type="password" autoComplete="new-password" placeholder={i18next.t('user.modal.placeholder.password')}/>
                        </Form.Item>) : null
                }
            </Form>
        </Modal>
    )
};

export default UserModal;
