import { Descriptions } from "antd";
import i18next from 'i18next';
import React, { useEffect, useState } from 'react';
import assetApi from "../../api/asset";

const api = assetApi;

const AssetInfo = ({active, id}) => {

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
                <Descriptions.Item label={i18next.t('asset.name')}>{item['name']}</Descriptions.Item>
                <Descriptions.Item label={i18next.t('asset.protocol')}>{item['protocol']}</Descriptions.Item>
                <Descriptions.Item label="IP">{item['ip']}</Descriptions.Item>
                <Descriptions.Item label={i18next.t('asset.port')}>{item['port']}</Descriptions.Item>
                <Descriptions.Item label={i18next.t('asset.tags')}>{item['tags']}</Descriptions.Item>
                {/*<Descriptions.Item label="类型">{item['type'] === 'regexp' ? '正则表达式' : '命令'}</Descriptions.Item>*/}
                <Descriptions.Item label={i18next.t('asset.create-time')}>{item['created']}</Descriptions.Item>
            </Descriptions>
        </div>
    );
};

export default AssetInfo;