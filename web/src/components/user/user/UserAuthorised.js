import { Form, Modal, Select } from "antd";
import i18next from 'i18next';
import React, { useEffect, useState } from 'react';
import assetApi from "../../../api/asset";
import authorisedApi from "../../../api/authorised";
import sensitiveCommandGroupApi from "../../../api/sensitive-command-group";
import strategyApi from "../../../api/strategy";
const formItemLayout = {
    labelCol: {span: 6},
    wrapperCol: {span: 14},
};

const UserAuthorised = ({type, id, visible, handleOk, handleCancel, confirmLoading}) => {
    const [form] = Form.useForm();

    let [selectedAssetIds, setSelectedAssetIds] = useState([]);
    let [assets, setAssets] = useState([]);
    let [strategies, setStrategies] = useState([]);
    let [sensitiveCommandGroups, setSensitiveCommandGroups] = useState([]);
 

    useEffect(() => {
        async function fetchData() {

            let queryParam = {'key': 'assetId'};

            if (type === 'userId') {
                queryParam['userId'] = id;
            } else {
                queryParam['userGroupId'] = id;
            }

            let selectedAssetIds = await authorisedApi.GetSelected(queryParam);
            setSelectedAssetIds(selectedAssetIds);

            let assets = await assetApi.GetAll();
            setAssets(assets);

            let strategies = await strategyApi.GetAll();
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

    let strategyOptions = strategies.map(item=>{
        return {
            value: item.id,
            label: item.name
        }
    });

    let assetOptions = assets.map(item=>{
        return {
            value: item.id,
            label: item.name,
            disabled: selectedAssetIds.includes(item.id)
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
            title={i18next.t('userAuthorised.modal.title')}
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
            okText={i18next.t('userAuthorised.modal.okText')}
            cancelText={i18next.t('userAuthorised.modal.cancelText')}
        >

            <Form form={form} {...formItemLayout} >

                <Form.Item label={i18next.t('userAuthorised.form.asset.label')} name='assetIds' rules={[{required: true, message: i18next.t('userAuthorised.form.asset.rules.required')}]}>
                    <Select
                        mode="multiple"
                        allowClear
                        style={{width: '100%'}}
                        placeholder={i18next.t('userAuthorised.form.asset.placeholder')}
                        showSearch
                        filterOption={(input, option) =>
                            (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                        }
                        options={assetOptions}
                    >

                    </Select>
                </Form.Item>

                <Form.Item label={i18next.t('userAuthorised.form.strategy.label')} name='strategyId' extra={i18next.t('userAuthorised.form.strategy.extra')}>
                    <Select
                        allowClear
                        style={{width: '100%'}}
                        placeholder={i18next.t('userAuthorised.form.strategy.placeholder')}
                        showSearch
                        filterOption={(input, option) =>
                            (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                        }
                        options={strategyOptions}
                    >

                    </Select>
                </Form.Item>
                
                <Form.Item label={i18next.t('userAuthorised.form.sensitiveCommandGroup.label')} name='sensitiveCommandGroupId' extra={i18next.t('userAuthorised.form.sensitiveCommandGroup.extra')}>
                    <Select
                        allowClear
                        style={{width: '100%'}}
                        placeholder={i18next.t('userAuthorised.form.sensitiveCommandGroup.placeholder')}
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

export default UserAuthorised;