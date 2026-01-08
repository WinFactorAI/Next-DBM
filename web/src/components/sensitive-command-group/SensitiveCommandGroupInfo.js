import { useEffect, useState } from 'react';

import { Descriptions } from "antd";
import i18next from 'i18next';
import sensitiveCommandGroupApi from "../../api/sensitive-command-group";
const api = sensitiveCommandGroupApi;
const SensitiveCommandGroupInfo = ({active, id}) => {

    let [item, setItem] = useState({});

    useEffect(() => {
        const getItem = async (id) => {
            let item = await api.getById(id);
            if (item) {
                setItem(item);
                // const webhook = await webhookApi.getById(item.webhookId);
                // setItem(prev => ({ ...prev, webhookName: webhook.name }));
            }
        };
        if (active && id) {
            getItem(id);
        }
    }, [active]);

    return (
        <div className={'page-detail-info'}>
            <Descriptions column={1}>
                <Descriptions.Item label={i18next.t('sensitiveCommandGroupInfo.column.name')}>{item['name']}</Descriptions.Item>
                <Descriptions.Item label={i18next.t('sensitiveCommandGroupInfo.column.content')}>{item['content']}</Descriptions.Item>
                <Descriptions.Item label={i18next.t('sensitiveCommandGroupInfo.column.created')}>{item['created']}</Descriptions.Item>
                <Descriptions.Item label={i18next.t('build.modal.tabs.webhook.label')}>{item['webhookName']}</Descriptions.Item>
            </Descriptions>
        </div>
    );
};

export default SensitiveCommandGroupInfo;