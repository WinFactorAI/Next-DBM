import { Tabs } from "antd";
import i18next from 'i18next';
import React, { useState } from 'react';
import { useParams, useSearchParams } from "react-router-dom";
import LoginPolicyInfo from "./LoginPolicyInfo";
import LoginPolicyUser from "./LoginPolicyUser";
const {TabPane} = Tabs;

const LoginPolicyDetail = () => {
    let params = useParams();
    const loginPolicyId = params['loginPolicyId'];
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
                <TabPane tab={i18next.t('loginPolicy.detail.tab.info')} key="info">
                    <LoginPolicyInfo active={activeKey === 'info'} id={loginPolicyId}/>
                </TabPane>
                <TabPane tab={i18next.t('loginPolicy.detail.tab.bindUser')} key="bind-user">
                    <LoginPolicyUser active={activeKey === 'bind-user'} loginPolicyId={loginPolicyId}/>
                </TabPane>
                {/* <TabPane tab={i18next.t('loginPolicy.detail.tab.bindUserGroup')} key="bind-user-group">
                    {i18next.t('loginPolicy.detail.notImplemented')}
                </TabPane> */}
            </Tabs>
        </div>
    );
};

export default LoginPolicyDetail;