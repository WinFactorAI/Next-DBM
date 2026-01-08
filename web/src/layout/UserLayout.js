import {
    ApartmentOutlined,
    AppstoreOutlined,
    CodeOutlined,
    DashboardOutlined,
    DesktopOutlined,
    DownOutlined,
    LogoutOutlined,
    UserOutlined
} from "@ant-design/icons";
import multiavatar from '@multiavatar/multiavatar/esm';
import { Breadcrumb, Button, Dropdown, Layout, Menu, Popconfirm, Space, Tooltip } from "antd";
import React, { Suspense, useEffect, useMemo, useState } from 'react';
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import accountApi from "../api/account";
import { getCurrentUser, isAdmin } from "../service/permission";
import FooterComponent from "./FooterComponent";
// import LogoWithName from "../images/logo-with-name.png";
import i18next from 'i18next';
import Landing from "../components/Landing";
import { setTitle } from "../hook/title";
import Language from "./Language";
import Theme from "./Theme";
const {Header, Content} = Layout;

const breadcrumbNameMap = {
    '/my-asset': 'breadcrumb.my-asset',
    '/my-command': 'breadcrumb.my-commands',
    '/my-info': 'breadcrumb.user-center',
};

const UserLayout = () => {

    const location = useLocation();
    const navigate = useNavigate();

    let _current = location.pathname.split('/')[1];

    useEffect(() => {
        setTitle(i18next.t(breadcrumbNameMap['/' + _current]));
    }, [_current]);
    let [logoText, setLogoText] = useState("Next-DBM");
    const pathSnippets = location.pathname.split('/').filter(i => i);

    const extraBreadcrumbItems = pathSnippets.map((_, index) => {
        const url = `/${pathSnippets.slice(0, index + 1).join('/')}`;
        return (
            <Breadcrumb.Item key={url}>
                <Link to={url}>{i18next.t(breadcrumbNameMap[url])}</Link>
            </Breadcrumb.Item>
        );
    });

    const breadcrumbItems = useMemo(() => {
        return [
            <Breadcrumb.Item key="home">
                <Link to="/my-asset">{i18next.t('breadcrumb.home')}</Link>
            </Breadcrumb.Item>,
        ].concat(extraBreadcrumbItems);
    },[extraBreadcrumbItems,i18next.language])

    const logout = async ()=>{
        try {
            await accountApi.logout()
        } catch (error) {
            console.error("退出登录失败:", error);
        } finally {
           setTimeout(() => {
                navigate('/login');
            }, 500);
        }
    }

    const [i18nVersion, setI18nVersion] = useState(0);
    // 强制更新监听
    useEffect(() => {
        const handleLanguageChange = () => {
            setI18nVersion(v => v + 1);
            setTitle(i18next.t(breadcrumbNameMap['/' + _current]));
        };
        i18next.on('languageChanged', handleLanguageChange);
        return () => i18next.off('languageChanged', handleLanguageChange);
    }, []);

    const menu = (
        <Menu>
            {
                isAdmin() &&
                <Menu.Item>
                    <Link to={'/dashboard'}><DashboardOutlined/> {i18next.t('breadcrumb.management')}</Link>
                </Menu.Item>
            }

            <Menu.Item>
                <Popconfirm
                    key='login-btn-pop'
                    title={i18next.t('popconfirm.logout-confirm')}
                    onConfirm={logout}
                    okText={i18next.t('popconfirm.ok-text')}
                    cancelText={i18next.t('popconfirm.cancel-text')}
                    placement="left"
                >
                    <LogoutOutlined/> {i18next.t('breadcrumb.logout')}
                </Popconfirm>
            </Menu.Item>

        </Menu>
    );

    const miniMenu = (
        <Menu>
            <Menu.Item>
                <Link to={'/my-asset'}> <DesktopOutlined/> {i18next.t('breadcrumb.my-asset')} </Link>
            </Menu.Item>
            <Menu.Item>
                <Link to={'/my-command'}> <CodeOutlined/>  {i18next.t('breadcrumb.my-commands')} </Link>
            </Menu.Item>
            <Menu.Item>
                <Link to={'/my-info'}> <UserOutlined/>  {i18next.t('breadcrumb.user-center')} </Link>
            </Menu.Item>
        </Menu>
    );
    const openAssetEditor = () => {
        return `#/ndbm`
    }

    const [isMini, setIsMini] = useState(true);

    // 动态更新宽度
    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth <= 768) { // 判断屏幕宽度
                setIsMini(true);
            } else {
                setIsMini(false);
            }
        };
    
        window.addEventListener('resize', handleResize);
        handleResize(); // 初始时执行一次
    
        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, []);

 
    
    return (
        <Layout className="layout" style={{minHeight: '100vh'}}>
            <Header style={{padding: 0}}>
                <div className={`km-header ${isMini ? 'is-mini' : ''}`}>
                    <div style={{flex: '1 1 0%', marginLeft: isMini ? '24px' : 'default',}} className="km-header-left">
                        {isMini ? (<Space>
                                        <Dropdown overlay={miniMenu}>
                                            <Button type="text" style={{color: 'white',padding:' 0px'}} icon={<AppstoreOutlined style={{ fontSize: '24px' }} />}> </Button> 
                                        </Dropdown>
                                    </Space>
                         ) : ( <Space>
                                <Link to={'/my-asset'}>
                                    {/* <img src={LogoWithName} alt='logo' width={120}/> */}
                                    <div className="logo-text">{logoText}</div>
                                </Link>

                                <Link to={'/my-asset'}>
                                    <Button type="text" style={{color: 'white'}}
                                            icon={<DesktopOutlined/>}>
                                        {i18next.t('breadcrumb.my-asset')}
                                    </Button>
                                </Link>

                                <Link to={'/my-command'}>
                                    <Button type="text" style={{color: 'white'}}
                                            icon={<CodeOutlined/>}>
                                        {i18next.t('breadcrumb.my-commands')}
                                    </Button>
                                </Link>

                                <Link to={'/my-info'}>
                                    <Button type="text" style={{color: 'white'}}
                                            icon={<UserOutlined/>}>
                                        {i18next.t('breadcrumb.user-center')}
                                    </Button>
                                </Link>
                              </Space>)
                        }
                        
                    </div>
                    <div style={{ marginRight: isMini ? '24px' : 'default',}} className='km-header-right'>
                        <Space size="middle">
                            <a href={openAssetEditor()} target="_blank" rel="noreferrer"   > 
                                <Tooltip title="接入DB资产">
                                    <ApartmentOutlined style={{padding: '8px'}}/>
                                </Tooltip>
                            </a>
                            <Theme />
                            <Language />
                            <Dropdown overlay={menu}>
                                <div className={'nickname layout-header-right-item'}>
                                    {/* <span >{getCurrentUser()['nickname']} &nbsp;<DownOutlined/></span> */}
                                    <Button
                                        type="text"
                                        style={{ color: 'white', padding: '4px', display: 'flex', alignItems: 'center' }}
                                        >
                                        {getCurrentUser()['nickname']}
                                        <DownOutlined style={{ marginLeft: '8px' }} />
                                    </Button>
                                    <span className='avatar' dangerouslySetInnerHTML={{ __html: multiavatar(getCurrentUser()['nickname']) }} />
                                </div>
                            </Dropdown>
                        </Space>
                    </div>
                </div>
            </Header>

            <Content className='nd-container'>
                <div style={{marginBottom: 16}}>
                    <Breadcrumb key={`breadcrumb-${i18next.language}-${i18nVersion}`}>{breadcrumbItems}</Breadcrumb>
                </div>
                <Suspense fallback={<Landing/>} >
                    <Outlet/>
                </Suspense>
            </Content>
            <FooterComponent/>
        </Layout>
    );
}

export default UserLayout;