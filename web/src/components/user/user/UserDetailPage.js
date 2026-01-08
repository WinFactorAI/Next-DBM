import { Tabs } from "antd";
import i18next from 'i18next';
import React, { useState } from 'react';
import { useParams, useSearchParams } from "react-router-dom";
import { hasMenu } from "../../../service/permission";
import UserAsset from "./UserAsset";
import UserInfo from "./UserInfo";
import UserLoginPolicy from "./UserLoginPolicy";
const UserDetail = () => {

    let params = useParams();
    const id = params['userId'];
    const [searchParams, setSearchParams] = useSearchParams();
    let key = searchParams.get('activeKey');
    key = key ? key : 'info';

    let [activeKey, setActiveKey] = useState(key);

    const handleTagChange = (key) => {
        setActiveKey(key);
        setSearchParams({'activeKey': key});
    }

    return (
        <div className="page-detail-warp">
            <Tabs activeKey={activeKey} onChange={handleTagChange}>
                {
                    hasMenu('user-detail') &&
                    <Tabs.TabPane tab={i18next.t('userDetailPage.tabs.basicInfo')} key="info">
                        <UserInfo active={activeKey === 'info'} userId={id}/>
                    </Tabs.TabPane>
                }
                {
                    hasMenu('user-authorised-asset') &&
                    <Tabs.TabPane tab={i18next.t('userDetailPage.tabs.authorizedAssets')} key="asset">
                        <UserAsset active={activeKey === 'asset'} id={id} type={'userId'}/>
                    </Tabs.TabPane>
                }
                {
                    hasMenu('user-login-policy') &&
                    <Tabs.TabPane tab={i18next.t('userDetailPage.tabs.loginPolicy')} key="login-policy">
                        <UserLoginPolicy active={activeKey === 'login-policy'} userId={id}/>
                    </Tabs.TabPane>
                }
            </Tabs>
        </div>
    );
}

export default UserDetail;