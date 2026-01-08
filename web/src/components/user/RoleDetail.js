import { Tabs } from "antd";
import i18next from "i18next";
import { useState } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import RoleInfo from "./RoleInfo";

const RoleDetail = () => {
    let params = useParams();
    const id = params['roleId'];
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
            <div className="page-detail-warp">
                <Tabs activeKey={activeKey} onChange={handleTagChange}>
                    <Tabs.TabPane tab={i18next.t('role.detail.basicInfo')} key="info">
                        <RoleInfo active={activeKey === 'info'} id={id}/>
                    </Tabs.TabPane>
                </Tabs>
            </div>
        </div>
    );
}

export default RoleDetail;