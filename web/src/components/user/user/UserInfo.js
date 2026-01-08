import { Descriptions, Skeleton } from "antd";
import i18next from 'i18next';
import { useQuery } from "react-query";
import userApi from "../../../api/user";
import strings from "../../../utils/strings";
const UserInfo = ({active, userId}) => {

    let userQuery = useQuery('getUserById', () => userApi.getById(userId), {
        enabled: active && strings.hasText(userId),
    });

    let user = userQuery.data || {};

    if (userQuery.isLoading) {
        return (<div className={'page-detail-info'}>
            <Skeleton/>
        </div>)
    }

    return (
        <div className={'page-detail-info'}>
            <Descriptions title={i18next.t('userInfo.title')} column={1}>
                <Descriptions.Item label={i18next.t('userInfo.label.username')}>{user['username']}</Descriptions.Item>
                <Descriptions.Item label={i18next.t('userInfo.label.nickname')}>{user['nickname']}</Descriptions.Item>
                <Descriptions.Item label={i18next.t('userInfo.label.mail')}>{user['mail']}</Descriptions.Item>
                <Descriptions.Item label={i18next.t('userInfo.label.status')}>{user['status'] === 'enabled' ? i18next.t('userInfo.status.enabled') : i18next.t('userInfo.status.disabled')}</Descriptions.Item>
                <Descriptions.Item label={i18next.t('userInfo.label.totpSecret')}>{user['totpSecret']}</Descriptions.Item>
                <Descriptions.Item label={i18next.t('userInfo.label.source')}>{user['source'] === 'ldap' ? i18next.t('userInfo.source.ldap') : i18next.t('userInfo.source.database')}</Descriptions.Item>
                <Descriptions.Item label={i18next.t('userInfo.label.created')}>{user['created']}</Descriptions.Item>
            </Descriptions>
        </div>
    );
};

export default UserInfo;
