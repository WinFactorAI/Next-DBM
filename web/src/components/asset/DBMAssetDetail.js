import { Tabs } from "antd";
import i18next from 'i18next';
import React, { useState } from 'react';
import { useParams, useSearchParams } from "react-router-dom";
import { hasMenu } from "../../service/permission";
import AssetInfo from "./AssetInfo";
import AssetUser from "./AssetUser";
import AssetUserGroup from "./AssetUserGroup";
const {TabPane} = Tabs;

const DBMAssetDetail = () => {
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

    
    return (
        <div className="page-detail-warp">
            <Tabs activeKey={activeKey} onChange={handleTagChange}>
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

export default DBMAssetDetail;