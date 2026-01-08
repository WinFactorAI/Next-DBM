import { Layout, Tabs } from "antd";
import i18next from 'i18next';
import React, { useState } from 'react';
import { useParams, useSearchParams } from "react-router-dom";
import SensitiveCommandGroupInfo from "./SensitiveCommandGroupInfo";
import SensitiveCommandGroupList from "./SensitiveCommandGroupList";
const SensitiveCommandGroupDetail = () => {
    let params = useParams();
    const id = params['sensitiveCommandGroupId'];
    const [searchParams, setSearchParams] = useSearchParams();
    let key = searchParams.get('activeKey');
    key = key ? key : 'info';

    let [activeKey, setActiveKey] = useState(key);

    const handleTagChange = (key) => {
        setActiveKey(key);
        setSearchParams({'activeKey': key});
    }

    return (
        <div>
            <Layout.Content className="page-detail-warp">
                <Tabs activeKey={activeKey} onChange={handleTagChange}>
                    <Tabs.TabPane tab={i18next.t('sensitiveCommandGroupDetail.tab.info')} key="info">
                        <SensitiveCommandGroupInfo active={activeKey === 'info'} id={id}/>
                    </Tabs.TabPane>
                    <Tabs.TabPane tab={i18next.t('sensitiveCommandGroupDetail.tab.list')} key="list">
                        <SensitiveCommandGroupList active={activeKey === 'list'} id={id}/>
                    </Tabs.TabPane>
                </Tabs>
            </Layout.Content>
        </div>
    );
};

export default SensitiveCommandGroupDetail;