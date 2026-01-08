import { EyeInvisibleOutlined, EyeOutlined } from "@ant-design/icons";
import { Alert, Button, Descriptions, message, Modal, Space } from "antd";
import i18next from 'i18next';
import { useEffect, useRef, useState } from "react";
import assetApi from "../../api/asset";
import workAssetApi from "../../api/worker/asset";
import SimpleCopy from "../../utils/copy";
const ProxyInfo = ({ id, visible, handleOk, userId, type }) => {

    const [isVisiblePassWord, setIsVisiblePassWord] = useState(false); // 控制密码显示
    const [proxyData, setProxyData] = useState(null); // 存储代理数据
    const [loading, setLoading] = useState(false); // 加载状态

    const toggleVisibility = () => {
        setIsVisiblePassWord((prev) => !prev);
    };
    useEffect(() => {
        let isMounted = true;

        if (id && visible) {
            setLoading(true);
            proxyInfo(id, userId, type).finally(() => {
                if (isMounted) {
                    setLoading(false);
                }
            });
        }

        return () => {
            isMounted = false;
        };
    }, [visible, id, userId, type]);
    const proxyInfo = async (id, userId, type) => {
        try {
            // 请求数据
            setProxyData(null); // 只在开始请求时重置数据

            if (type === 'manager') {
                const res = await assetApi.gatewayByUserId({ id: id, userId: userId });
                if (res && res.proxyIpGateway && res.proxyPortGateway && res.username && res.proxyAuth) {
                    setProxyData(res); // 保存数据到状态
                }
            }

            if (type === 'worker') {
                const res = await workAssetApi.gateway({ id: id });
                if (res && res.proxyIpGateway && res.proxyPortGateway && res.username && res.proxyAuth) {
                    setProxyData(res); // 保存数据到状态
                }
            }
            // else {
            //     const res = await assetApi.gateway({ id: id});
            //     if (res && res.proxyIpGateway && res.proxyPortGateway && res.username && res.proxyAuth) {
            //         setProxyData(res); // 保存数据到状态
            //     } 
            // }

        } catch (error) {
            // 错误处理
            message.error(i18next.t('proxyInfo.modal.errorMessage'));
        }
    };
    const copyRef = useRef(null);
    const handleCopy = async () => {
        try {
            // 防御性检查
            if (!proxyData) {
                message.warning(i18next.t('sqlLog.action.copy.empty'));
                return;
            }

            // 格式化数据（根据需求调整）
            const textToCopy = typeof proxyData === 'string'
                ? proxyData.replace(/\s+/g, ' ') // 合并空白字符
                : JSON.stringify(proxyData, null, 2); // 对象转为格式化 JSON

            // 现代剪贴板 API（优先）
            if (navigator.clipboard?.writeText) {
                await navigator.clipboard.writeText(textToCopy);
            } else {
                // 兼容旧版浏览器的降级方案
                const input = copyRef.current;
                input.value = textToCopy;
                input.select();

                // 执行复制
                document.execCommand('copy');
                message.success(i18next.t('sqlLog.action.copy.success'));
            }

            // 成功反馈（可添加复制内容预览）
            message.success(i18next.t('sqlLog.action.copy.success'), 1.5, () => {
                console.log('Copied content:', textToCopy);
            });

        } catch (err) {
            // 错误分类处理
            const errorMessage = err?.name === 'NotAllowedError'
                ? i18next.t('sqlLog.action.copy.permissionDenied')
                : i18next.t('sqlLog.action.copy.failure');

            message.error(errorMessage);
            console.error('Copy failed:', err);
        }
    };
    return (
        <>

            <Modal
                title={i18next.t('proxyInfo.modal.title')}
                visible={visible}
                footer={[
                    <Button key="copy" type="primary" onClick={handleCopy}>
                        {i18next.t('sqlLog.action.copy')}
                    </Button>,
                    <Button key="ok" type="primary" onClick={handleOk}>
                        {i18next.t('proxyInfo.modal.okButton.text')}
                    </Button>,
                ]}
                onOk={handleOk}
                onCancel={handleOk}

            >
                {loading ? (
                    <div>{i18next.t('proxyInfo.modal.loadingText')}</div>
                ) : proxyData ? (
                    <Space direction="vertical">
                        <Alert message={i18next.t('proxyInfo.modal.description')} type="info" showIcon />
                        <input type="text" ref={copyRef} style={{ position: 'absolute', left: '-9999px' }} readOnly />
                        <Descriptions title={i18next.t('proxyInfo.modal.title')} column={1}>
                            <Descriptions.Item label={i18next.t('proxyInfo.modal.serverAddress.label')}>
                                <SimpleCopy text={proxyData.proxyIpGateway}></SimpleCopy>
                            </Descriptions.Item>
                            <Descriptions.Item label={i18next.t('proxyInfo.modal.serverPort.label')}>
                                <SimpleCopy text={proxyData.proxyPortGateway}></SimpleCopy>
                            </Descriptions.Item>
                            <Descriptions.Item label={i18next.t('proxyInfo.modal.user.label')}>
                                <SimpleCopy text={proxyData.username}></SimpleCopy>
                            </Descriptions.Item>
                            <Descriptions.Item label={i18next.t('proxyInfo.modal.password.label')}>
                                <Space wrap={false} style={{ display: 'inline-flex', alignItems: 'center' }}>
                                    {isVisiblePassWord ? <SimpleCopy text={proxyData.proxyAuth}> </SimpleCopy> : "********"}
                                    <Button
                                        icon={isVisiblePassWord ? <EyeInvisibleOutlined /> : <EyeOutlined />}
                                        size="small"
                                        type="link"
                                        onClick={toggleVisibility}
                                    />
                                </Space>
                            </Descriptions.Item>
                        </Descriptions>
                    </Space>
                ) : (
                    <div>{i18next.t('proxyInfo.modal.noDataText')}</div>
                )}
            </Modal>
        </>
    );
};

export default ProxyInfo;
