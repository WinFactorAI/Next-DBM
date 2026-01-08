import { ApartmentOutlined, AppstoreOutlined, DesktopOutlined, DownOutlined, LogoutOutlined } from "@ant-design/icons";
import multiavatar from '@multiavatar/multiavatar/esm';
import { Breadcrumb, Button, Dropdown, Layout, Menu, Popconfirm, Space, Tooltip } from "antd";
import i18next from 'i18next';
import { Suspense, useEffect, useMemo, useState } from 'react';
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import accountApi from "../api/account";
import Landing from "../components/Landing";
import { setTitle } from "../hook/title";
import Logo from "../images/logo-n.svg";
import LogoWithName from "../images/logo.svg";
import { getCurrentUser } from "../service/permission";
import FooterComponent from "./FooterComponent";
import Language from "./Language";
import { routers } from "./router";
import Theme from "./Theme";
import UpgradeNotification from "./UpgradeNotification";
const { Sider, Header } = Layout;
const breadcrumbMatchMap = {
    '/sqls/': 'SQL列表',
    '/git/': 'route.version-management',
    '/dbm-asset/': 'route.db-asset-detail',
    '/asset/': 'route.asset-detail',
    '/user/': 'route.user-detail',
    '/role/': 'route.role-detail',
    '/user-group/': 'route.user-group-detail',
    '/login-policy/': 'route.login-policy-detail',
    '/command-filter/': 'route.command-filter-detail',
    '/strategy/': 'route.strategy-detail',
};
const breadcrumbNameMap = {};

routers.forEach(r => {
    if (r.children) {
        r.children.forEach(c => {
            breadcrumbNameMap['/' + c.key] = c.i18nKey;
        })
    } else {
        breadcrumbNameMap['/' + r.key] = r.i18nKey;
    }
});

const ManagerLayout = () => {

    const location = useLocation();
    const navigate = useNavigate();

    let currentUser = getCurrentUser();
    // 动态生成菜单项，依赖语言变化
    const menus = useMemo(() => {
        const userMenus = currentUser?.menus || [];
        return routers
            .filter(router => userMenus.includes(router.key))
            .map(router => ({
                ...router,
                // 动态翻译标签
                label: i18next.t(router.i18nKey),
                icon: router.icon,
                children: router.children
                    ?.filter(child => userMenus.includes(child.key))
                    .map(child => ({
                        ...child,
                        label: i18next.t(child.i18nKey) // 子菜单翻译
                    }))
            }));
    }, [currentUser, i18next.language]);

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


    let [collapsed, setCollapsed] = useState(false);

    let _current = location.pathname.split('/')[1];


    let [current, setCurrent] = useState(_current);
    let [logoText, setLogoText] = useState("Next-DBM");
    let [logo, setLogo] = useState(LogoWithName);
    let [logoWidth, setLogoWidth] = useState(140);
    let [openKeys, setOpenKeys] = useState(JSON.parse(sessionStorage.getItem('openKeys')));

    useEffect(() => {
        setCurrent(_current);
        setTitle(i18next.t(breadcrumbNameMap['/' + _current]));
    }, [_current]);

    const pathSnippets = location.pathname.split('/').filter(i => i);

    const extraBreadcrumbItems = pathSnippets.map((_, index) => {
        const url = `/${pathSnippets.slice(0, index + 1).join('/')}`;
        // console.log(" url" ,url)
        let label = breadcrumbNameMap[url];
        if (!label) {
            if (url == '/asset') {
                label = 'menu.resource.dbm-asset';  // 映射为资产详情
            } else {
                for (let k in breadcrumbMatchMap) {
                    if (url.includes(k)) {
                        label = breadcrumbMatchMap[k];
                        break;
                    }
                }
            }
        }
        return (
            <Breadcrumb.Item key={url}>
                <Link to={url}>{i18next.t(label)}</Link>
            </Breadcrumb.Item>
        );
    });

    const breadcrumbItems = useMemo(() => {
        return [
            <Breadcrumb.Item key="home">
                <Link to="/">{i18next.t('breadcrumb.home')}</Link>
            </Breadcrumb.Item>,
        ].concat(extraBreadcrumbItems);
    }, [extraBreadcrumbItems, i18next.language])

    const onCollapse = () => {
        let _collapsed = !collapsed;
        if (_collapsed) {
            setLogoText("ND")
            setLogo(Logo);
            setLogoWidth(46);
            setCollapsed(_collapsed);
        } else {
            setLogoText("Next-DBM")
            setLogo(LogoWithName);
            setLogoWidth(140);
            setCollapsed(false);
        }
        if (isMini) {
            // document.body.style.overflow = _collapsed ? 'auto':'hidden';
        }

    };

    const subMenuChange = (openKeys) => {
        setOpenKeys(openKeys);
        sessionStorage.setItem('openKeys', JSON.stringify(openKeys));
    }
    const logout = async () => {
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
    const menu = (
        <Menu>
            <Menu.Item>
                <Link to={'/my-asset'}><DesktopOutlined /> {i18next.t('breadcrumb.my-asset')}</Link>
            </Menu.Item>
            {/* <Menu.Item>
                <Link to={'/debug/pprof'}><BugTwoTone/> DEBUG</Link>
                <a target='_blank' href={`/debug/pprof/`}></a>
            </Menu.Item> */}
            <Menu.Item>
                <Popconfirm
                    key='login-btn-pop'
                    title={i18next.t('popconfirm.logout-confirm')}
                    onConfirm={logout}
                    okText={i18next.t('popconfirm.ok-text')}
                    cancelText={i18next.t('popconfirm.cancel-text')}
                    placement="left"
                >
                    <LogoutOutlined /> {i18next.t('breadcrumb.logout')}
                </Popconfirm>
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
                // document.body.style.overflow = 'hidden';
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


    // 语言切换菜单


    return (
        <Layout className="layout" style={{ minHeight: '100vh' }}>
            {(isMini && !collapsed) || !isMini ? (<Sider
                collapsible
                collapsed={collapsed}
                onCollapse={onCollapse}
                style={{
                    overflow: 'auto',
                    height: '100vh',
                    position: 'fixed',
                    left: 0,
                    top: 0,
                    bottom: 0,
                    zIndex: 1001,
                }}
            >
                <div className="logo">
                    {/* <img src={logo} alt='logo' width={logoWidth}/> */}
                    <div className="logo-text">{logoText}</div>
                </div>

                <Menu
                    key={`menu-${i18next.language}-${i18nVersion}`}
                    onClick={(e) => {
                        navigate(e.key);
                        setCurrent(e.key);
                        if (isMini) {
                            setCollapsed(true);
                            document.body.style.overflow = 'auto';
                        }
                    }}
                    selectedKeys={[current]}
                    onOpenChange={subMenuChange}
                    defaultOpenKeys={openKeys}
                    theme="dark"
                    mode="inline"
                    defaultSelectedKeys={['']}
                    items={menus}
                >
                </Menu>
            </Sider>) : null}

            <Layout className="site-layout" style={{ marginLeft: isMini ? 0 : (collapsed ? 80 : 200) }}>
                <Header style={{ padding: 0, height: 60, zIndex: 20 }}>
                    <div className='layout-header'>
                        <div className='layout-header-left'>
                            <div>
                                {isMini && <Button style={{ padding: '0px' }} onClick={onCollapse} type="text" icon={<AppstoreOutlined style={{ fontSize: '24px' }} />}> </Button>}
                                <Breadcrumb className="responsive-breadcrumb" key={`breadcrumb-${i18next.language}-${i18nVersion}`}>{breadcrumbItems}</Breadcrumb>
                            </div>
                        </div>

                        <div className='layout-header-right'>
                            <Space size="middle">
                                <a href={openAssetEditor()} target="_blank" rel="noreferrer" >
                                    <Tooltip title="接入DB资产">
                                        <ApartmentOutlined style={{ padding: '4px' }} />
                                    </Tooltip>
                                </a>
                                <Theme />
                                <Language />
                                <Dropdown overlay={menu}>
                                    <div className='nickname layout-header-right-item'>
                                        <Button
                                            type="text"
                                            style={{ padding: '4px', display: 'flex', alignItems: 'center' }}
                                        >
                                            {getCurrentUser()['nickname']}
                                            <DownOutlined style={{ marginLeft: '4px' }} />
                                        </Button>
                                        <span className='avatar ' dangerouslySetInnerHTML={{ __html: multiavatar(getCurrentUser()['nickname']) }} />
                                    </div>
                                </Dropdown>
                            </Space>
                        </div>
                    </div>
                </Header>

                <Suspense fallback={<div className={'page-container'}><Landing /></div>}>
                    <Outlet />
                </Suspense>

                <FooterComponent />
            </Layout>
            {isMini && !collapsed && (
                <div
                    className="overlay"
                    onClick={() => {
                        setCollapsed(true);
                        document.body.style.overflow = 'auto';
                    }} // 点击遮蔽层关闭 Sider
                />
            )}
            <UpgradeNotification />
        </Layout>
    );
}

export default ManagerLayout;