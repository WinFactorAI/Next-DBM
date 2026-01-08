import { ExclamationCircleOutlined, ReloadOutlined } from "@ant-design/icons";
import { Button, Form, Image, Input, message, Modal, Result, Space, Typography } from "antd";
import i18next from 'i18next';
import React, { useState } from 'react';
import { useQuery } from "react-query";
import accountApi from "../api/account";
import { debugLog } from "../common/logger";
const {Title} = Typography;

const Totp = () => {

    let infoQuery = useQuery('infoQuery', accountApi.getUserInfo);
    let [totp, setTotp] = useState({});

    const resetTOTP = async () => {
        let totp = await accountApi.reloadTotp();
        setTotp(totp);
    }

    const confirmTOTP = async (values) => {
        values['secret'] = totp['secret'];
        let success = await accountApi.confirmTotp(values);
        if (success) {
            message.success('TOTP启用成功');
            await infoQuery.refetch();
            setTotp({});
        }
    }

    const renderBindingTotpPage = (qr) => {
        if (!qr) {
            return undefined;
        }
        return <Form hidden={!totp.qr} onFinish={confirmTOTP}>
            <Form.Item label={i18next.t('totp.from.qrLabel')}
                       extra={i18next.t('totp.from.qrDescription')}>
                <Space size={12} direction='vertical' align="center" style={{marginBottom: '30px'}}>
                    <Image
                        style={{padding: 20}}
                        width={280}
                        src={"data:image/png;base64, " + totp.qr}
                    />
                    <Button
                        type="primary"
                        icon={<ReloadOutlined/>}
                        onClick={resetTOTP}
                    >
                        {i18next.t('totp.from.reload')}
                    </Button>
                </Space>
            </Form.Item>
            <Form.Item
                name="totp"
                label="TOTP"
                rules={[
                    {
                        required: true,
                        message: i18next.t('totp.from.enterCode'),
                    },
                ]}
            >
                <Input placeholder={i18next.t('totp.from.enterCodePlaceholder')} width={200}/>
            </Form.Item>
            <Form.Item>
                <Button type="primary" htmlType="submit">
                    {i18next.t('totp.from.confirm')}
                </Button>
            </Form.Item>
        </Form>
    }

    return (
        <div>
            <Title level={4}>{i18next.t('totp.from.title')}</Title>
            <Form hidden={totp.qr}>
                <Form.Item>
                    {
                        infoQuery.data?.enableTotp ?
                            <Result
                                status="success"
                                title={i18next.t('totp.from.successTitle')}
                                subTitle={i18next.t('totp.from.successSubTitle')}
                                extra={[
                                    <Button type="primary" key="console" danger onClick={() => {
                                        Modal.confirm({
                                            title: i18next.t('totp.from.modalTitle'),
                                            icon: <ExclamationCircleOutlined/>,
                                            content: i18next.t('totp.from.modalContent'),
                                            okText: i18next.t('totp.from.confirmBtn'),
                                            okType: 'danger',
                                            cancelText: i18next.t('totp.from.cancelBtn'),
                                            onOk: async () => {
                                                let success = await accountApi.resetTotp();
                                                if (success) {
                                                    message.success(i18next.t('totp.from.resetSuccess'));
                                                    await infoQuery.refetch();
                                                }
                                            },
                                            onCancel() {
                                                debugLog('Cancel');
                                            },
                                        })
                                    }}>
                                        {i18next.t('totp.from.unbind')}
                                    </Button>,
                                    <Button key="re-bind" onClick={resetTOTP}>{i18next.t('totp.from.rebind')}</Button>,
                                ]}
                            /> :
                            <Result
                                status="warning"
                                title={i18next.t('totp.from.notEnabled')}
                                subTitle={i18next.t('totp.from.riskMessage')}
                                extra={
                                    <Button type="primary" key="bind" onClick={resetTOTP}>
                                        {i18next.t('totp.from.enable')}
                                    </Button>
                                }
                            />
                    }

                </Form.Item>
            </Form>

            {
                renderBindingTotpPage(totp.qr)
            }

        </div>
    );
};

export default Totp;