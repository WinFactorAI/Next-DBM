import { Tabs } from "antd";
import i18next from 'i18next';
import React, { useEffect, useState } from 'react';
import { useParams, useSearchParams } from "react-router-dom";
import localeConfig from '../../common/localeConfig';
import { hasMenu } from "../../service/permission";
import AssetInfo from "./AssetInfo";
import AssetUser from "./AssetUser";
import AssetUserGroup from "./AssetUserGroup";
const {TabPane} = Tabs;

const AssetDetail = () => {
    let params = useParams();
    const id = params['assetId'];
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
        <div className="page-detail-warp">
            <Tabs 
                key={`tabs-${i18next.language}-${i18nVersion}`}
                activeKey={activeKey} onChange={handleTagChange}>
                {
                    hasMenu('asset-detail') &&
                    <TabPane tab={i18next.t('assetDetail.basic-info')} key="info">
                        <AssetInfo active={activeKey === 'info'} id={id}/>
                    </TabPane>
                }

                {
                    hasMenu('asset-authorised-user') &&
                    <TabPane tab={i18next.t('assetDetail.authorized-users')} key="bind-user">
                        <AssetUser active={activeKey === 'bind-user'} id={id}/>
                    </TabPane>
                }
                {
                    hasMenu('asset-authorised-user-group') &&
                    <TabPane tab={i18next.t('assetDetail.authorized-user-group')} key="bind-user-group">
                        <AssetUserGroup active={activeKey === 'bind-user-group'} id={id}/>
                    </TabPane>
                }
            </Tabs>
        </div>
    );
};

export default AssetDetail;