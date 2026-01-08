import { Descriptions, Tag } from "antd";
import i18next from 'i18next';
import React, { useEffect, useState } from 'react';
import strategyApi from "../../api/strategy";
const api = strategyApi;



const StrategyInfo = ({active, id}) => {
    const renderStatus = (text) => {
        if (text === true) {
            return <Tag color={'green'}>{i18next.t('strategyInfo.status.enabled')}</Tag>
        } else {
            return <Tag color={'red'}>{i18next.t('strategyInfo.status.disabled')}</Tag>
        }
    }
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
                <Descriptions.Item label={i18next.t('strategyInfo.label.name')}>{item['name']}</Descriptions.Item>
                <Descriptions.Item label={i18next.t('strategyInfo.label.upload')}>{renderStatus(item['upload'])}</Descriptions.Item>
                <Descriptions.Item label={i18next.t('strategyInfo.label.download')}>{renderStatus(item['download'])}</Descriptions.Item>
                <Descriptions.Item label={i18next.t('strategyInfo.label.edit')}>{renderStatus(item['edit'])}</Descriptions.Item>
                <Descriptions.Item label={i18next.t('strategyInfo.label.delete')}>{renderStatus(item['delete'])}</Descriptions.Item>
                <Descriptions.Item label={i18next.t('strategyInfo.label.rename')}>{renderStatus(item['rename'])}</Descriptions.Item>
                <Descriptions.Item label={i18next.t('strategyInfo.label.copy')}>{renderStatus(item['copy'])}</Descriptions.Item>
                <Descriptions.Item label={i18next.t('strategyInfo.label.paste')}>{renderStatus(item['paste'])}</Descriptions.Item>
                <Descriptions.Item label={i18next.t('strategyInfo.label.created')}>{item['created']}</Descriptions.Item>
            </Descriptions>
        </div>
    );
};

export default StrategyInfo;
