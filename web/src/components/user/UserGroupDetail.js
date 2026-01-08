import { Tabs } from "antd";
import i18next from 'i18next';
import React, { useEffect, useState } from 'react';
import { useParams, useSearchParams } from "react-router-dom";
import localeConfig from '../../common/localeConfig';
import { hasMenu } from "../../service/permission";
import UserGroupInfo from "./UserGroupInfo";
import UserAsset from "./user/UserAsset";
const UserGroupDetail = () => {
    let params = useParams();
    const id = params['userGroupId'];
    const [searchParams, setSearchParams] = useSearchParams();
    let key = searchParams.get('activeKey');
    key = key ? key : 'info';

    let [activeKey, setActiveKey] = useState(key);

    const handleTagChange = (key) => {
        setActiveKey(key);
        setSearchParams({'activeKey': key});
    }

    const [i18nVersion, setI18nVersion] = useState(0);
    const [locale, setLocale] = useState(localStorage['zh-CN']); // 默认英文
    // 强制更新监听
    useEffect(() => {
        const initDefault = () =>{
            setLocale(localeConfig[localStorage.getItem('language')]);
        }
        initDefault();
        const handleLanguageChange = () => {
            setI18nVersion(v => v + 1);
            initDefault();
        };
        i18next.on('languageChanged', handleLanguageChange);
        return () => i18next.off('languageChanged', handleLanguageChange);
    }, []);


    return (
        <div>
            <div className="page-detail-warp">
                <Tabs activeKey={activeKey} onChange={handleTagChange} key={`tabs-${i18next.language}-${i18nVersion}`}>
                    {
                        hasMenu('user-group-detail') &&
                        <Tabs.TabPane tab={i18next.t('userGroupDetail.tab.info')} key="info">
                            <UserGroupInfo active={activeKey === 'info'} id={id}/>
                        </Tabs.TabPane>
                    }
                    {
                        hasMenu('user-group-detail') &&
                        <Tabs.TabPane tab={i18next.t('userGroupDetail.tab.asset')} key="asset">
                            <UserAsset active={activeKey === 'asset'} id={id} type={'userGroupId'}/>
                        </Tabs.TabPane>
                    }
                </Tabs>
            </div>
        </div>
    );
};

export default UserGroupDetail;