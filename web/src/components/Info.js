import { Button, Descriptions, Form, Input, Layout, message, Tabs, Typography } from "antd";
import i18next from 'i18next';
import React, { useEffect, useState } from 'react';
import accountApi from "../api/account";
import localeConfig from '../common/localeConfig';
import Totp from "./Totp";
const {Content} = Layout;
const {Title} = Typography;
const Info = () => {

    let [newPassword1, setNewPassword1] = useState('');
    let [newPassword2, setNewPassword2] = useState('');
    let [newPasswordStatus, setNewPasswordStatus] = useState({});

    const onNewPasswordChange = (value) => {
        setNewPassword1(value.target.value);
        setNewPasswordStatus(validateNewPassword(value.target.value, newPassword2));
    }

    const onNewPassword2Change = (value) => {
        setNewPassword2(value.target.value);
        setNewPasswordStatus(validateNewPassword(newPassword1, value.target.value));
    }

    const validateNewPassword = (newPassword1, newPassword2) => {
        if (newPassword2 === newPassword1) {
            return {
                validateStatus: 'success',
                errorMsg: null,
            };
        }
        return {
            validateStatus: 'error',
            errorMsg: i18next.t('info.from.passwordMismatch'),
        };
    }

    const changePassword = async (values) => {
        let success = await accountApi.changePassword(values);
        if (success) {
            message.success(i18next.t('info.from.passwordChanged'));
            window.location.href = '/#';
        }
    }
    const changeProxyAuth = async (values) => {
        values['newProxyAuth'] = values['newPassword'];
        let success = await accountApi.changeProxyAuth(values);
        if (success) {
            message.success(i18next.t('info.from.proxyPasswordChanged'));
            // window.location.href = '/#';
        }
    }

    const [i18nVersion, setI18nVersion] = useState(0);
    const [locale, setLocale] = useState(localStorage['zh-CN']); // 默认英文
    // 强制更新监听
    useEffect(() => {
        const initDefault = () =>{
            setLocale(localeConfig[localStorage.getItem('language')]);
        }
        initDefault();
        const handleLanguageChange = () => {
            setI18nVersion(v => v + 1);
            initDefault();
        };
        i18next.on('languageChanged', handleLanguageChange);
        return () => i18next.off('languageChanged', handleLanguageChange);
    }, []);

    return (
        <>
            <Content className={'page-container-white'}>
                <Tabs className={'info-tab'} tabPosition={'top'} key={`tabls-${i18next.language}-${i18nVersion}`}>
                    <Tabs.TabPane tab={i18next.t('info.from.changePassword')} key="change-password">
                        <Title level={4}>{i18next.t('info.from.changePasswordTitle')}</Title>
                        <div style={{margin: 16}}></div>
                        <Form name="password" onFinish={changePassword}>
                            <input type='password' hidden={true} autoComplete='new-password'/>
                            <Form.Item
                                name="oldPassword"
                                label={i18next.t('info.from.oldPassword')}
                                rules={[
                                    {
                                        required: true,
                                        message: i18next.t('info.from.oldPassword'),
                                    },
                                ]}
                            >
                                <Input type='password' placeholder={i18next.t('info.from.enterOldPassword')} style={{width: 240}}/>
                            </Form.Item>
                            <Form.Item
                                name="newPassword"
                                label={i18next.t('info.from.newPassword')}
                                rules={[
                                    {
                                        required: true,
                                        message: i18next.t('info.from.enterNewPassword'),
                                    },
                                ]}
                            >
                                <Input type='password' placeholder={i18next.t('info.from.confirmNewPassword')}
                                       onChange={(value) => onNewPasswordChange(value)} style={{width: 240}}/>
                            </Form.Item>
                            <Form.Item
                                name="newPassword2"
                                label={i18next.t('info.from.confirmPassword')}
                                rules={[
                                    {
                                        required: true,
                                        message: i18next.t('info.from.confirmPasswordMismatch'),
                                    },
                                ]}
                                validateStatus={newPasswordStatus.validateStatus}
                                help={newPasswordStatus.errorMsg || ' '}
                            >
                                <Input type='password' placeholder={i18next.t('info.from.confirmPasswordMismatch-placeholder')}
                                       onChange={(value) => onNewPassword2Change(value)} style={{width: 240}}/>
                            </Form.Item>
                            <Form.Item>
                                <Button disabled={newPasswordStatus.errorMsg || !newPasswordStatus.validateStatus}
                                        type="primary"
                                        htmlType="submit">
                                    {i18next.t('info.from.submitButton')}
                                </Button>
                            </Form.Item>
                        </Form>
                    </Tabs.TabPane>

                    <Tabs.TabPane tab={i18next.t('info.from.changeProxyPassword')} key="change-proxy-auth">
                        <Title level={4}>{i18next.t('info.from.proxyPasswordTitle')}</Title>
                        <Descriptions title=""  column={1}>
                            <Descriptions.Item label={i18next.t('info.from.proxyPasswordHint')}>{i18next.t('info.from.proxyPasswordHintMessage')}</Descriptions.Item>
                        </Descriptions>
                        <div style={{margin: 16}}></div>
                        <Form name="password" onFinish={changeProxyAuth}>
                            <Form.Item
                                name="newPassword"
                                label={i18next.t('info.from.newPassword')}
                                rules={[
                                    {
                                        required: true,
                                        message: i18next.t('info.from.enterNewPassword'),
                                    },
                                ]}
                            >
                                <Input type='password' placeholder={i18next.t('info.from.newPassword')}
                                       onChange={(value) => onNewPasswordChange(value)} style={{width: 240}}/>
                            </Form.Item>
                            <Form.Item
                                name="newPassword2"
                                label={i18next.t('info.from.confirmPassword')}
                                rules={[
                                    {
                                        required: true,
                                        message: i18next.t('info.from.confirmPasswordMismatch'),
                                    },
                                ]}
                                validateStatus={newPasswordStatus.validateStatus}
                                help={newPasswordStatus.errorMsg || ' '}
                            >
                                <Input type='password' placeholder={i18next.t('info.from.confirmPasswordMismatch')}
                                       onChange={(value) => onNewPassword2Change(value)} style={{width: 240}}/>
                            </Form.Item>
                            <Form.Item>
                                <Button disabled={newPasswordStatus.errorMsg || !newPasswordStatus.validateStatus}
                                        type="primary"
                                        htmlType="submit">
                                    {i18next.t('info.from.submitButton')}
                                </Button>
                            </Form.Item>
                        </Form>
                    </Tabs.TabPane>
                    {/*<Tabs.TabPane tab="授权令牌" key="token">*/}
                    {/*    <AccessToken/>*/}
                    {/*</Tabs.TabPane>*/}

                    <Tabs.TabPane tab={i18next.t('info.from.twoFactorAuth')} key="totp">
                        <Totp/>
                    </Tabs.TabPane>
                </Tabs>
            </Content>
        </>
    );
}

export default Info;
