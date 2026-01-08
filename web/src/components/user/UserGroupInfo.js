import { Descriptions, Tag } from "antd";
import i18next from 'i18next';
import React, { useEffect, useState } from 'react';
import userGroupApi from "../../api/user-group";

const api = userGroupApi;

const UserGroupInfo = ({active, id}) => {
    let [item, setItem] = useState({});

    useEffect(() => {
        const getItem = async (id) => {
            let item = await api.getById(id);
            if (item) {
                setItem(item);
            }
        };
        if (active && id) {
            getItem(id);
        }
    }, [active]);

    return (
        <div className={'page-detail-info'}>
            <Descriptions column={1}>
                <Descriptions.Item label={i18next.t('userGroupInfo.name')}>{item['name']}</Descriptions.Item>
                <Descriptions.Item label={i18next.t('userGroupInfo.members')}>{item['members']?.map(item => <Tag>{item.name}</Tag>)}</Descriptions.Item>
                <Descriptions.Item label={i18next.t('userGroupInfo.created')}>{item['created']}</Descriptions.Item>
            </Descriptions>
        </div>
    );
};

export default UserGroupInfo;