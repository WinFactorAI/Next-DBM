import { Descriptions } from "antd";
import i18next from 'i18next';
import React, { useEffect, useState } from 'react';
import loginPolicyApi from "../../api/login-policy";
import { hasText } from "../../utils/utils";
import { renderWeekDay } from "../../utils/week";
const LoginPolicyInfo = ({active, id}) => {

    let [item, setItem] = useState({});

    useEffect(() => {
        const getItem = async (id) => {
            let item = await loginPolicyApi.getById(id);
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
                <Descriptions.Item label={i18next.t('loginPolicy.Info.name')}>{item['name']}</Descriptions.Item>
                <Descriptions.Item label={i18next.t('loginPolicy.Info.priority')}>{item['priority']}</Descriptions.Item>
                <Descriptions.Item label={i18next.t('loginPolicy.Info.ipGroup')}>{item['ipGroup']}</Descriptions.Item>
                <Descriptions.Item label={i18next.t('loginPolicy.Info.timePeriod')}>
                    {
                        item['timePeriod']?.map(t => {
                            if (!hasText(t.value)) {
                                return;
                            }
                            return <>{`${renderWeekDay(t.key)} ：${t.value}`}<br/></>;
                        })
                    }
                </Descriptions.Item>
                <Descriptions.Item label={i18next.t('loginPolicy.Info.rule')}>{item['rule'] === 'allow' ? i18next.t('loginPolicy.Info.allow') : i18next.t('loginPolicy.Info.deny')}</Descriptions.Item>
                <Descriptions.Item label={i18next.t('loginPolicy.Info.enabled')}>{item['enabled'] ? '✅' : '❌'}</Descriptions.Item>
            </Descriptions>
        </div>
    );
};

export default LoginPolicyInfo;
