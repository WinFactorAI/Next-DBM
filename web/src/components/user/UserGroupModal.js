import { Form, Input, Modal, Select } from "antd";
import i18next from 'i18next';
import { useQuery } from "react-query";
import userApi from "../../api/user";
import userGroupApi from "../../api/user-group";
import strings from "../../utils/strings";
const api = userGroupApi;

const formItemLayout = {
    labelCol: {span: 6},
    wrapperCol: {span: 14},
};

const UserGroupModal = ({
                            visible,
                            handleOk,
                            handleCancel,
                            confirmLoading,
                            id,
                        }) => {

    const [form] = Form.useForm();

    useQuery('userGroupQuery', () => api.getById(id), {
        enabled: visible && strings.hasText(id),
        onSuccess: (data) => {
            data.members = data.members.map(item => item.id);
            form.setFieldsValue(data);
        }
    });

    let usersQuery = useQuery('usersQuery', userApi.getAll, {
        enabled: visible,
    });

    let users = usersQuery.data || [];

    return (
        <Modal
            title={id ? i18next.t('userGroup.modal.title.update') : i18next.t('userGroup.modal.title.create')}
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
            okText={i18next.t('userGroup.modal.button.ok')}
            cancelText={i18next.t('userGroup.modal.button.cancel')}
        >

            <Form form={form} {...formItemLayout}>
                <Form.Item name='id' noStyle>
                    <Input hidden={true}/>
                </Form.Item>

                <Form.Item label={i18next.t('userGroup.modal.label.name')} name='name' rules={[{required: true, message: i18next.t('userGroup.modal.message.name.required')}]}>
                    <Input autoComplete="off" placeholder={i18next.t('userGroup.modal.placeholder.name')}/>
                </Form.Item>

                <Form.Item label={i18next.t('userGroup.modal.label.members')} name='members'>
                    <Select
                        showSearch
                        mode="multiple"
                        allowClear
                        placeholder={i18next.t('userGroup.modal.label.members')}
                        filterOption={false}
                    >
                        {users.map(d => <Select.Option key={d.id}
                                                       value={d.id}>{d['nickname']}</Select.Option>)}
                    </Select>
                </Form.Item>
            </Form>
        </Modal>
    )
};

export default UserGroupModal;
