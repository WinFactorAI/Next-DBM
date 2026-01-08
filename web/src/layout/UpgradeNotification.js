import { Button, message, notification, Space } from 'antd';
import i18next from 'i18next';
import React, { useEffect, useRef } from 'react';
import brandingApi from "../api/branding";
import { debugLog } from "../common/logger";
import request from "../common/request";
import { ND_PACKAGE } from "../utils/utils";
let _package = ND_PACKAGE();
const UpgradeNotification = () => {

    const [visible, setVisible] = React.useState(false);
    const [brandingVersion, setBrandingVersion] = React.useState('');
    const [newVersion, setNewVersion] = React.useState('');
    const [isProcessing, setIsProcessing] = React.useState(false);
    const [notificationKey, setNotificationKey] = React.useState(null);
    const upgradeTimerRef = useRef(null);
    let notificationRef = null;
    const handleUpgrade = async (isProces) => {
        setIsProcessing(isProces)
        if (notificationRef) {
            notification.close(notificationRef.key);
            notificationRef = null;
        }

        // 定时器{i18next.t('settings.base.updateButton')}进度
        await request.get('/properties/app/upgrade');
        var upgradeMsg = message.info(i18next.t('upgradeNotification.message.info'), 0);
        upgradeTimerRef.current = setInterval(() => {
            debugLog('  newVersion  ', newVersion);
            if (newVersion === brandingVersion) {
                clearInterval(upgradeTimerRef.current);
                setIsProcessing(false)
                message.success(i18next.t('upgradeNotification.message.upgrade.success'), 3);
                upgradeMsg.close();
                window.location.reload();
            }
            checkVersion();
        }, 5000);
    };
    const checkVersion = async () => {
        let branding = await brandingApi.getVersion();
        setBrandingVersion(branding['version'])
        debugLog(' brandingVersion ', branding['version'])
        let result = await request.get('/properties/app/checkVersion');
        if (result['code'] === 1) {
            setNewVersion(result['data'].version)
        }
    }
    const close = () => {
        debugLog(
            'Notification was closed. Either the close button was clicked or duration time elapsed.',
        );
    };
    const openNotification = () => {
        const key = `open${Date.now()}`;
        const btn = (
            <Space>
                <Button type="primary" size="small" loading={isProcessing} onClick={() => { handleUpgrade(true) }}>
                    {i18next.t('upgradeNotification.upgrade.btn')}
                </Button>
                <Button type="primary" size="small" onClick={() => {
                    notification.close(key)
                    setVisible(false)
                }}>
                    {i18next.t('upgradeNotification.alter.btn')}
                </Button>
            </Space>
        );
        notificationRef = notification.open({
            message: i18next.t('upgradeNotification.message.title'),
            description: `${newVersion} ${i18next.t('upgradeNotification.description.title')} `,
            btn,
            key,
            onClose: close,
        });

    };

    useEffect(() => {
        debugLog(' newversion ', newVersion)
        debugLog(' brandingVersion', brandingVersion)
        debugLog(' isProcessing ', isProcessing)
        if (newVersion === brandingVersion && newVersion !== "" && isProcessing) {
            message.success("升级成功,页面将自动刷新")
            clearInterval(upgradeTimerRef.current);
            setTimeout(() => {
                window.location.reload()
            }, 5000)
        }

    }, [newVersion, brandingVersion, isProcessing]);

    useEffect(() => {
        debugLog(" visible ", visible)
        debugLog(" newVersion ", newVersion)
        debugLog(" brandingVersion ", brandingVersion)
        if (newVersion !== brandingVersion && !isProcessing) {
            openNotification();
        }
    }, [newVersion, isProcessing]);

    useEffect(() => {
        checkVersion();
    }, []);
    return (
        <></>
    );
}

export default UpgradeNotification;