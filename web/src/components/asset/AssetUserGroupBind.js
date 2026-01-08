import { Form, Modal, Select } from "antd";
import i18next from "i18next";
import React, { useEffect, useState } from 'react';
import authorisedApi from "../../api/authorised";
import sensitiveCommandGroupApi from "../../api/sensitive-command-group";
import strategyApi from "../../api/strategy";
import userGroupApi from "../../api/user-group";
const formItemLayout = {
    labelCol: {span: 6},
    wrapperCol: {span: 14},
};


const AssetUserGroupBind = ({id, visible, handleOk, handleCancel, confirmLoading}) => {
    const [form] = Form.useForm();

    let [selectedUserGroupIds, setSelectedUserGroupIds] = useState([]);
    let [userGroups, setUserGroups] = useState([]);
    let [strategies, setStrategies] = useState([]);
    let [sensitiveCommandGroups, setSensitiveCommandGroups] = useState([]);

    useEffect(() => {
        async function fetchData() {

            let queryParam = {'key': 'userGroupId', 'assetId': id};

            let items = await authorisedApi.GetSelected(queryParam);
            setSelectedUserGroupIds(items);

            let userGroups = await userGroupApi.getAll();
            setUserGroups(userGroups);

            let strategies = await strategyApi.getAll();
            setStrategies(strategies);

            let sensitiveCommandGroups = await sensitiveCommandGroupApi.GetAll();
            setSensitiveCommandGroups(sensitiveCommandGroups);
        }

        if (visible) {
            fetchData();
        } else {
            form.resetFields();
        }
    }, [visible])

    let strategyOptions = strategies.map(item => {
        return {
            value: item.id,
            label: item.name
        }
    });

    let userGroupOptions = userGroups.map(item => {
        return {
            value: item.id,
            label: item.name,
            disabled: selectedUserGroupIds.includes(item.id)
        }
    });

    let sensitiveCommandGroupOptions = sensitiveCommandGroups.map(item=>{
        return {
            value: item.id,
            label: item.name
        }
    });

    return (
        <Modal
            title={i18next.t('assetUserGroupBind.title')}
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
            okText={i18next.t('action.delete.ok')}
            cancelText={i18next.t('action.delete.cancel')}
        >

            <Form form={form} {...formItemLayout} >

                <Form.Item label={i18next.t('assetUserGroupBind.from.userGroup-label')} name='userGroupIds' rules={[{required: true, message: i18next.t('assetUserGroupBind.from.userGroup-rules')}]}>
                    <Select
                        mode="multiple"
                        allowClear
                        style={{width: '100%'}}
                        placeholder={i18next.t('assetUserGroupBind.from.userGroup-placeholder')}
                        showSearch
                        filterOption={(input, option) =>
                            (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                        }
                        options={userGroupOptions}
                    >

                    </Select>
                </Form.Item>

                <Form.Item label={i18next.t('assetUserGroupBind.from.strategyId-label')} name='strategyId' extra={i18next.t('assetUserGroupBind.from.strategyId-extra')}>
                    <Select
                        allowClear
                        style={{width: '100%'}}
                        placeholder={i18next.t('assetUserGroupBind.from.strategyId-placeholder')}
                        showSearch
                        filterOption={(input, option) =>
                            (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                        }
                        options={strategyOptions}
                    >

                    </Select>
                </Form.Item>

                <Form.Item label={i18next.t('assetUserGroupBind.from.sensitiveCommandGroupId-label')} name='sensitiveCommandGroupId' extra={i18next.t('assetUserGroupBind.from.sensitiveCommandGroupId-extra')}>
                    <Select
                        allowClear
                        style={{width: '100%'}}
                        placeholder={i18next.t('assetUserGroupBind.from.sensitiveCommandGroupId-placeholder')}
                        showSearch
                        filterOption={(input, option) =>
                            (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                        }
                        options={sensitiveCommandGroupOptions}
                    >

                    </Select>
                </Form.Item>
            </Form>
        </Modal>
    )
};

export default AssetUserGroupBind;