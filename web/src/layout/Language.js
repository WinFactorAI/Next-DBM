import { GlobalOutlined } from "@ant-design/icons";
import { Dropdown, Menu } from "antd";
import i18n from 'i18next';
import { useEffect, useState } from 'react';
import translationsApi from "../api/translations";
import workerTranslationsApi from "../api/worker/translations";
import { isAdmin } from "../service/permission";
const Language = () => {
    const [isShow, setIsShow] = useState(false);
    const [langs, setLangs] = useState([]);
    const fetchLangs = async () => {
        try {
            if (isAdmin()) {
                let langsTmp = await translationsApi.getLangs();
                if (langsTmp.code !== -1) {
                    setIsShow(true)
                    setLangs(langsTmp.data);
                }
            } else {
                let langsTmp = await workerTranslationsApi.getLangs();
                if (langsTmp.code !== -1) {
                    setIsShow(true)
                    setLangs(langsTmp.data);
                }
            }

        } catch (error) {
            console.error("Error fetching languages:", error);
        }
    };
    useEffect(() => {

        try {
            fetchLangs();
            //设置默认语言
            const savedLanguage = localStorage.getItem('language');
            if (savedLanguage) {
                i18n.changeLanguage(savedLanguage);
            } else {
                i18n.changeLanguage('zh-CN');
            }
        } catch (error) {
            console.error("Error defalut languages:", error);
        }
    }, [])

    const languageMenu = (
        <Menu
            onClick={(e) => {
                try {
                    i18n.changeLanguage(e.key); // 切换语言
                    localStorage.setItem('language', e.key);
                } catch (error) {
                    console.error("Error defalut languages:", error);
                }
            }}
        >
            {langs.map(lang => (
                <Menu.Item key={lang.key} >{lang.name}</Menu.Item>
            ))}
        </Menu>
    );
    return (
        <>
            {isShow &&
                <Dropdown overlay={languageMenu} placement="bottomCenter">
                    <GlobalOutlined style={{ padding: '4px' }} />
                </Dropdown>
            }
        </>
    )
}
export default Language;