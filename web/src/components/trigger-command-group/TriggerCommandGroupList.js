import { ProTable } from "@ant-design/pro-components";
import { ConfigProvider, Popconfirm } from "antd";
import i18next from 'i18next';
import React, { useEffect, useState } from 'react';
import { Link } from "react-router-dom";
import triggerCommandGroupMembersApi from "../../api/trigger-command-group-members";
import localeConfig from '../../common/localeConfig';
import Show from "../../dd/fi/show";
const actionRef = React.createRef();
const TriggerCommandGroupList = ({active, id}) => {

    let [visible, setVisible] = useState(false);
    let [confirmLoading, setConfirmLoading] = useState(false);

    useEffect(() => {
        if (active) {
            actionRef.current.reload();
        }
    }, [active]);

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

    const columns = [
        {
            dataIndex: 'index',
            valueType: 'indexBorder',
            width: 48,
        },
        {
            title: i18next.t('triggerCommandGroupList.column.name'),
            dataIndex: 'name',
            render: ((text, record) => {
                return <Link to={`/user/${record['userId']}`}>{text}</Link>
            })
        },
        // {
        //     title: 'Tag',
        //     dataIndex: 'tag',
        //     hideInSearch: true,
        //     render: (tag) => <Tag>{tag}</Tag>,
        // },
        {	
            title: i18next.t('triggerCommandGroupList.column.content'),
            dataIndex: 'content',
        },
        // {
        //     title: '授权日期',
        //     key: 'created',
        //     dataIndex: 'created',
        //     hideInSearch: true,
        // },
        {
            title: i18next.t('triggerCommandGroupList.column.operation'),
            valueType: 'option',
            key: 'option',
            render: (text, record, _, action) => [
                <Show menu={'trigger-command-group-del'} key={'unbind-acc'}>
                     <Popconfirm
                        key="unbind"
                        title={i18next.t('triggerCommandGroup.popconfirm.deleteTitle')}
                        onConfirm={async () => {
                            await triggerCommandGroupMembersApi.deleteById(record['id']);
                            actionRef.current.reload();
                        }}
                        okText={i18next.t('triggerCommandGroup.popconfirm.okText')}
                        cancelText={i18next.t('triggerCommandGroup.popconfirm.cancelText')}
                    >
                    <a key="unbind" >
                       {i18next.t('triggerCommandGroupList.operation.remove')}
                    </a>  
                    </Popconfirm>
                </Show>,
            ],
        },
    ];

    return (
        <ConfigProvider locale={locale}>
            <ProTable
                scroll={{ x: 'max-content' }}
                columns={columns}
                actionRef={actionRef}
                request={async (params = {}, sort, filter) => {

                    let field = '';
                    let order = '';
                    if (Object.keys(sort).length > 0) {
                        field = Object.keys(sort)[0];
                        order = Object.values(sort)[0];
                    }

                    let queryParams = {
                        pageIndex: params.current,
                        pageSize: params.pageSize,
                        commandName: params.name,
                        commandContent: params.content,
                        commandGroupId: id,
                        field: field,
                        order: order
                    }
                    let result = await triggerCommandGroupMembersApi.getPaging(queryParams);
                    return {
                        data: result['items'],
                        success: true,
                        total: result['total']
                    };
                }}
                rowKey="id"
                search={{
                    labelWidth: 'auto',
                }}
                pagination={{
                        defaultPageSize: 10,
                    }}
                dateFormatter="string"
                headerTitle={i18next.t('triggerCommandGroupList.table.title')}
                toolBarRender={() => [
                    // <Show menu={'asset-authorised-user-add'} key={'bind-acc'}>
                    //     <Button key="button" type="primary" onClick={() => {
                    //         setVisible(true);
                    //     }}>
                    //         授权
                    //     </Button>
                    // </Show>
                    // ,
                ]}
            />

 
        </ConfigProvider>
    );
};

export default TriggerCommandGroupList;