// MenuPanel.js
import { CopyOutlined, FileAddOutlined, GoldOutlined, InfoCircleOutlined, ScissorOutlined, SnippetsOutlined } from '@ant-design/icons';
import multiavatar from '@multiavatar/multiavatar/esm';
import i18next from 'i18next';
import { useContext, useEffect, useState } from 'react';
import { getCurrentUser } from "../../../../service/permission";
import CreateDatabase from '../DBM/Database';
import ExportSQLFile from '../DBM/ExportSQLFile';
import ImportSQLFile from '../DBM/ImportSQLFile';
import RenameModal from '../DBM/Rename';
import TableRename from '../DBM/Table/TableRename';
import KeyBoard from '../KeyBoard';
import { VisibilityContext } from '../Utils/visibilityProvider';
import MenuItem from './MenuItem';
const MenuPanel = () => {
    const {
        isTableTreePanelVisible, setTableTreePaneVisible,
        isPropertiesPanelVisible, setIsPropertiesPanelVisible,
        isCmdPaneVisible, setIsCmdPaneVisible,
        isHistoryPaneVisible, setIsHistoryPaneVisible,
        isDDLPaneVisible, setIsDDLPaneVisible,
        isAboutModal, setShowAboutModal,
        isKeyBoardModalVisible, setIsKeyBoardModalVisible,
        isCreateDatabaseModalVisible, setShowCreateDatabaseModalVisible,

        confirmModal, confirmModalContextHolder, showConfirmModal,
        resetLayout,
        language
    } = useContext(VisibilityContext);

    const [menuState, setMenuState] = useState([]);

    // 菜单选项
    const menuItems = [
        {
            title: i18next.t('dbmEditor.menuPanel.file'),
            subMenuItems: [
                { title: i18next.t('dbmEditor.menuPanel.new'), icon: <FileAddOutlined />, keyboard: 'CTR+N', onClick: () => handleSubMenuClick('new') },
                { title: i18next.t('dbmEditor.menuPanel.newDatabase'), icon: <FileAddOutlined />, onClick: () => handleSubMenuClick('CreateDatabase') },

            ]
        },
        {
            title: i18next.t('dbmEditor.menuPanel.edit'),
            subMenuItems: [
                { title: i18next.t('dbmEditor.menuPanel.copy'), icon: <CopyOutlined />, keyboard: 'CTR+C', onClick: () => handleSubMenuClick('Copy') },
                { title: i18next.t('dbmEditor.menuPanel.cut'), icon: <ScissorOutlined />, keyboard: 'CTR+X', onClick: () => handleSubMenuClick('Cut') },
                { title: i18next.t('dbmEditor.menuPanel.paste'), icon: <SnippetsOutlined />, keyboard: 'CTR+V', onClick: () => handleSubMenuClick('Paste') }
            ]
        },
        {
            title: i18next.t('dbmEditor.menuPanel.view'),
            subMenuItems: [
                { title: i18next.t('dbmEditor.menuPanel.dataPanel'), checked: true, onClick: () => handleSubMenuClick('isLeftPaneVisible') },
                {
                    title: i18next.t('dbmEditor.menuPanel.rightPanel'),
                    level: 1,
                    checked: true,
                    onClick: () => handleSubMenuClick('isRightPaneVisible'),
                    // subMenuItems:[
                    //     { title: '信息面板',level:2, checked:true, onClick: () => handleSubMenuClick('isDDLPaneVisible') },
                    //     { title: '指令面板',level:2, checked:true, onClick: () => handleSubMenuClick('isCmdPaneVisible') },
                    //     { title: '历史面板',level:2, checked:true, onClick: () => handleSubMenuClick('isHistoryPaneVisible') },
                    // ]
                },
                {
                    title: i18next.t('dbmEditor.menuPanel.resetLayout'),
                    onClick: () => handleSubMenuClick('resetLayout'),
                },
                // { title: '数据折叠', 
                //     checked:true,
                //     onClick: () => handleSubMenuClick('Cut'),
                // },
            ]
        },
        {
            title: i18next.t('dbmEditor.menuPanel.help'),
            subMenuItems: [
                { title: i18next.t('dbmEditor.menuPanel.shortcut'), icon: <GoldOutlined />, keyboard: 'CTR+K', width: 150, onClick: () => handleSubMenuClick('showKeyBoardModel') },
                { title: i18next.t('dbmEditor.menuPanel.about'), icon: <InfoCircleOutlined />, width: 150, onClick: () => handleSubMenuClick('showAboutModel') }
            ]
        }
    ];

    const handleSubMenuClick = (itemTitle) => {
        if (itemTitle === 'isLeftPaneVisible') {
            setTableTreePaneVisible(isTableTreePanelVisible => !isTableTreePanelVisible)
            setSubMenuClick('数据面板');
        }
        else if (itemTitle === 'isRightPaneVisible') {
            setIsPropertiesPanelVisible(isPropertiesPanelVisible => !isPropertiesPanelVisible)
            setSubMenuClick('右侧面板');
        }
        else if (itemTitle === 'isCmdPaneVisible') {
            setIsCmdPaneVisible(isCmdPaneVisible => !isCmdPaneVisible);
            setSubMenuClick('指令面板');
        }
        else if (itemTitle === 'isHistoryPaneVisible') {
            setIsHistoryPaneVisible(isHistoryPaneVisible => !isHistoryPaneVisible);
            setSubMenuClick('历史面板');
        }
        else if (itemTitle === 'isDDLPaneVisible') {
            setIsDDLPaneVisible(isDDLPaneVisible => !isDDLPaneVisible);
            setSubMenuClick('信息面板');
        }
        else if (itemTitle === 'new') {
            window.location.reload();
        }
        else if (itemTitle === 'showAboutModel') {
            setShowAboutModal(true)
        }
        else if (itemTitle === 'showKeyBoardModel') {
            setIsKeyBoardModalVisible(true)
        }

        else if (itemTitle === 'CreateDatabase') {
            setShowCreateDatabaseModalVisible(true)
        }
        else if (itemTitle === 'resetLayout') {
            resetLayout();
        }
        else {
            alert(`Clicked on sub-menu item: ${itemTitle}`);
        }

    };

    // 菜单控制
    const setSubMenuClick = (menuItemTitle) => {
        setMenuState(prevMenuState => {
            return prevMenuState.map(menu => {
                return {
                    ...menu,
                    subMenuItems: menu.subMenuItems.map(subMenuItem => {
                        if (subMenuItem.title === menuItemTitle) {
                            return {
                                ...subMenuItem,
                                checked: !subMenuItem.checked
                            };
                        }
                        return subMenuItem;
                    })
                };
            });
        });
    }
    useEffect(() => {
        setMenuState(menuItems)
        if (!isTableTreePanelVisible) {
            setSubMenuClick(i18next.t('dbmEditor.menuPanel.dataPanel'));
        }
        if (!isPropertiesPanelVisible) {
            setSubMenuClick(i18next.t('dbmEditor.menuPanel.rightPanel'));
        }
    }, [isTableTreePanelVisible, isPropertiesPanelVisible, language]);
    return (
        <div className="toolbar" key={`dbeditor-menu-${language}`}>

            {menuState.map((item, index) => (
                <MenuItem key={index} title={item.title} subMenuItems={item.subMenuItems} />
            ))}
            <div className='menu-right-box'>
                {/* <DownOutlined/> */}
                <span>{getCurrentUser()['nickname']} &nbsp;</span>
                <span className='avatar' dangerouslySetInnerHTML={{ __html: multiavatar(getCurrentUser()['nickname']) }} />
            </div>
            <KeyBoard />
            <CreateDatabase />
            <RenameModal />
            <TableRename />
            <ImportSQLFile />
            <ExportSQLFile />
            {confirmModalContextHolder}

        </div>
    );
};

export default MenuPanel;
