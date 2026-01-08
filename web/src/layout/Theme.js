import { BgColorsOutlined } from "@ant-design/icons";
import { Dropdown, Menu } from "antd";
import i18next from 'i18next';
import React, { useEffect } from 'react';
const Theme = () => {
    const themeMenu = (
        <Menu
        onClick={(e) => {
            const root = document.documentElement; // 获取根元素
            root.setAttribute('data-theme', e.key);
            
            const themeColorMeta = document.querySelector('meta[name="theme-color"]');
            if (themeColorMeta) {
                if (e.key === 'default') {
                  themeColorMeta.setAttribute('content', '#433bbb');
                } else if(e.key === 'light') {
                  themeColorMeta.setAttribute('content', '#ffffff');
                } else {
                  themeColorMeta.setAttribute('content', '#000000');
                }
            }
            localStorage.setItem('theme', e.key);
        }}
        >
            <Menu.Item key="default">{i18next.t('theme.light')}</Menu.Item>
            {/* <Menu.Item key="light">亮色</Menu.Item> */}
            <Menu.Item key="dark">{i18next.t('theme.dark')}</Menu.Item>
        </Menu>
    ); 
    useEffect(() => {
        let theme=localStorage.getItem('theme');
        const root = document.documentElement; // 获取根元素
        root.setAttribute('data-theme', theme);
        const themeColorMeta = document.querySelector('meta[name="theme-color"]');
        if (themeColorMeta) {
            if (theme === 'default') {
              themeColorMeta.setAttribute('content', '#433bbb');
            } else if(theme === 'light') {
              themeColorMeta.setAttribute('content', '#ffffff');
            } else {
              themeColorMeta.setAttribute('content', '#000000');
            }
        }
    }, []);
    return (
        <Dropdown overlay={themeMenu} placement="bottomCenter">
            <BgColorsOutlined style={{padding: '4px'}}/>
        </Dropdown>
    )
}
export default Theme;