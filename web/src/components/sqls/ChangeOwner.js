import { Modal, Select, Spin } from "antd";
import i18next from 'i18next';
import React, { useState } from 'react';
import { useQuery } from "react-query";
import userApi from "../../api/user";
const ChangeOwner = ({lastOwner, open, handleOk, handleCancel}) => {

    let [confirmLoading, setConfirmLoading] = useState(false);
    let [owner, setOwner] = useState(lastOwner);
    let usersQuery = useQuery('usersQuery', userApi.getAll, {
        enabled: open
    });

    return (<div>
        <Modal title={i18next.t('changeOwner.modal-title')}
               confirmLoading={confirmLoading}
               open={open}
               onOk={async () => {
                   setConfirmLoading(true);
                   await handleOk(owner);
                   setConfirmLoading(false);
               }}
               onCancel={handleCancel}
               destroyOnClose={true}
        >
            {/*<Alert style={{marginBottom: `8px`}} message="Informational Notes" type="info" showIcon />*/}

            <Spin spinning={usersQuery.isLoading}>
                <Select defaultValue={lastOwner}
                        style={{width: `100%`}}
                        onChange={(value) => {
                            setOwner(value);
                        }}>
                    {usersQuery.data?.map(item => {
                        return <Select.Option key={item.id} value={item.id}>{item.nickname}</Select.Option>
                    })}
                </Select>
            </Spin>
        </Modal>
    </div>);
};

export default ChangeOwner;