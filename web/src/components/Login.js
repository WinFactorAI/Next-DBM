import { LockOutlined, UserOutlined } from '@ant-design/icons';
import { Button, Card, Checkbox, Form, Input, message, Modal, Typography } from "antd";
import i18next from 'i18next';
import { useEffect, useState } from 'react';
import { useNavigate } from "react-router-dom";
import brandingApi from "../api/branding";
import localeConfig from '../common/localeConfig';
import request from "../common/request";
import PromptModal from "../dd/prompt-modal/prompt-modal";
import bgImage from '../images/login/bg.png';
import l1 from '../images/login/l1.png';
import l2 from '../images/login/l2.png';
import FooterComponent from "../layout/FooterComponent";
import { setCurrentUser } from "../service/permission";
import strings from "../utils/strings";
import { setToken } from "../utils/utils";
import './Login.css';
const { Title, Text } = Typography;
const LoginForm = () => {

    const navigate = useNavigate();

    let [inLogin, setInLogin] = useState(false);
    let [branding, setBranding] = useState({});
    let [prompt, setPrompt] = useState(false);
    let [account, setAccount] = useState({});

    useEffect(() => {
        const x = async () => {
            let branding = await brandingApi.getBranding();
            document.title = branding['name'];
            setBranding(branding);
        }
        x();
    }, []);


    const [i18nVersion, setI18nVersion] = useState(0);
    const [locale, setLocale] = useState(localeConfig['zh-CN']); // 默认英文
    // 强制更新监听
    useEffect(() => {
        const initDefault = () => {
            const savedLanguage = localStorage.getItem('language');
            if (savedLanguage) {
                i18next.changeLanguage(savedLanguage);
            } else {
                i18next.changeLanguage('zh-CN');
            }
            setLocale(localeConfig[localStorage.getItem('language')]);
        }
        initDefault();
        const handleLanguageChange = () => {
            setI18nVersion(v => v + 1);
        };
        i18next.on('languageChanged', handleLanguageChange);
        return () => i18next.off('languageChanged', handleLanguageChange);
    }, []);


    const afterLoginSuccess = async (data) => {
        // 跳转登录
        sessionStorage.removeItem('current');
        sessionStorage.removeItem('openKeys');
        setToken(data['token']);

        let user = data['info'];
        setCurrentUser(user);
        if (user) {
            if (user['type'] === 'user') {
                navigate('/my-asset');
            } else {
                navigate('/');
            }
        }
    }

    const login = async (values) => {
        let result = await request.post('/login', values);
        if (result['code'] === 1) {
            Modal.destroyAll();
            await afterLoginSuccess(result['data']);
        }
    }

    const handleOk = (loginAccount, totp) => {
        if (!strings.hasText(totp)) {
            message.warn(i18next.t('twoFactor.validation.required'));
            return false;
        }
        loginAccount['totp'] = totp;
        login(loginAccount);
        return false;
    }

    const handleSubmit = async params => {
        setInLogin(true);

        try {
            let result = await request.post('/login', params);
            if (result.code === 100) {
                // 进行双因素认证
                setPrompt(true);
                setAccount(params);
                return;
            }
            if (result.code !== 1) {
                return;
            }

            afterLoginSuccess(result['data']);
        } catch (e) {
            message.error(e.message);
        } finally {
            setInLogin(false);
        }
    };

    useEffect(() => {
        let theme = localStorage.getItem('theme');
        const root = document.documentElement; // 获取根元素
        root.setAttribute('data-theme', theme);
        const themeColorMeta = document.querySelector('meta[name="theme-color"]');
        if (themeColorMeta) {
            if (theme === 'default') {
                themeColorMeta.setAttribute('content', '#433bbb');
            } else if (theme === 'light') {
                themeColorMeta.setAttribute('content', '#ffffff');
            } else {
                themeColorMeta.setAttribute('content', '#000000');
            }
        }
    }, []);
    return (
        <div className='login-box' style={{ backgroundImage: `url(${bgImage})` }} >
            <div className="w-100">
                 <img src={l1} alt="l1" className='login-l1'/>
                 <img src={l2} alt="l2" className='login-l2'/>
            </div>
            <Card className='login-card' title={null}>
                <div className='login-card-header'>
                    <Title level={1}>{branding['name']}</Title>
                    {/* <img src={LogoBlueName} alt={branding['name']} width={'60%'}/>     */}
                    <Text>{branding['description']}</Text>
                </div>
                <Form onFinish={handleSubmit} className="login-form">
                    <Form.Item name='username' rules={[{ required: true, message: i18next.t('login.username.required') }]}>
                        <Input prefix={<UserOutlined />} placeholder={i18next.t('login.username.placeholder')} />
                    </Form.Item>
                    <Form.Item name='password' rules={[{ required: true, message: i18next.t('login.password.required') }]}>
                        <Input.Password prefix={<LockOutlined />} placeholder={i18next.t('login.password.placeholder')} />
                    </Form.Item>
                    <Form.Item name='remember' valuePropName='checked' initialValue={false}>
                        <Checkbox>{i18next.t('login.remember.label')}</Checkbox>
                    </Form.Item>
                    <Form.Item>
                        <Button type="primary" htmlType="submit" className="login-form-button"
                            loading={inLogin}>
                            {i18next.t('login.submit.button')}
                        </Button>
                    </Form.Item>
                </Form>
            </Card>

            <PromptModal
                title={i18next.t('twoFactor.title')}
                open={prompt}
                onOk={(value) => {
                    handleOk(account, value)
                }}
                onCancel={() => setPrompt(false)}
                placeholder={i18next.t('twoFactor.code.placeholder')}
            >

            </PromptModal>
            <div className="login-footer">
                <FooterComponent />
            </div>
        </div>

    );
}

export default LoginForm;
