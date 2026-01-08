import { Descriptions, Tree } from "antd";
import i18next from 'i18next';
import { useQuery } from "react-query";
import permissionApi from "../../api/permission";
import roleApi from "../../api/role";
import strings from "../../utils/strings";
const api = roleApi;

const RoleInfo = ({active, id}) => {
    let roleQuery = useQuery('roleQuery', () => api.getById(id), {
        enabled: active && strings.hasText(id),
    });
    let menuQuery = useQuery('menuQuery', permissionApi.getMenus, {
        enabled: active && strings.hasText(id),
    });

    let checkedMenuIds = roleQuery.data?.menus
        .filter(item => {
            return item['checked'] === true;
        })
        .map(item => {
            return item['menuId'];
        });

    return (
        <div className={'page-detail-info'}>
            <Descriptions column={1}>
                <Descriptions.Item label={i18next.t("roleInfo.label.name")}>{roleQuery.data?.name}</Descriptions.Item>
                <Descriptions.Item
                    label={i18next.t("roleInfo.label.type")}>{(roleQuery.data?.type === 'default') ? i18next.t("roleInfo.type.default") : i18next.t("roleInfo.type.custom")}</Descriptions.Item>
                <Descriptions.Item label={i18next.t("roleInfo.label.type")}>
                    <Tree
                        checkable
                        disabled={true}
                        checkedKeys={checkedMenuIds}
                        treeData={menuQuery.data}
                    />
                </Descriptions.Item>
                <Descriptions.Item label={i18next.t('roleInfo.label.createTime')}>{roleQuery.data?.created}</Descriptions.Item>
            </Descriptions>
        </div>
    );
}

export default RoleInfo;