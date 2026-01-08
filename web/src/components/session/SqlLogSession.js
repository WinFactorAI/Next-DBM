import React, { useEffect, useState } from 'react';

import { ProTable } from "@ant-design/pro-components";
import { Layout, Select, Table, Tag, Tooltip, message } from "antd";
import i18next from 'i18next';
import { useQuery } from "react-query";
import assetApi from "../../api/asset";
import sqlLogApi from "../../api/sql-log";
import userApi from "../../api/user";
import ColumnState, { useColumnState } from "../../hook/column-state";
import SimpleCopy from "../../utils/copy";
import { formatDate } from "../../utils/utils";
const api = sqlLogApi;
const {Content} = Layout;
const actionRef = React.createRef();

const SqlLogSession = ({ selectRow, open }) => {

    let [total, setTotal] = useState(0);
    let [selectedRowKeys, setSelectedRowKeys] = useState([]);

    const [columnsStateMap, setColumnsStateMap] = useColumnState(ColumnState.LOGIN_LOG);
    let userQuery = useQuery('userQuery', userApi.getAll);
    let assetQuery = useQuery('assetQuery', assetApi.getAll);

    useEffect(() => {
        if (open && actionRef.current) {
            actionRef.current.reload();
        }
    }, [open]);

    const userOptions = userQuery.data?.map(item=>{
        return {
            label: item.nickname,
            value: item.id
        }
    })

    const assetOptions = assetQuery.data?.map(item=>{
        return {
            label: item.name,
            value: item.id
        }
    })
    const handleCopy = (text) => {
        navigator.clipboard.writeText(text).then(() => {
            message.success(i18next.t('sqlLogSession.message.copy.success'));
        }).catch(() => {
            message.error(i18next.t('sqlLogSession.message.copy.error'));
        });
    };
    const columns = [
        {
            dataIndex: 'index',
            valueType: 'indexBorder',
            width: 48,
        },
        {
            title: i18next.t('sqlLogSession.column.state.title'),
            dataIndex: 'state',
            key: 'state',
            render: text => {
                if (text === '0') {
                    return <Tag color="error">{i18next.t('sqlLogSession.column.state.failure')}</Tag>
                } else {
                    return <Tag color="success">{i18next.t('sqlLogSession.column.state.success')}</Tag>
                }
            },
            renderFormItem: (item, {type, defaultRender, ...rest}, form) => {
                if (type === 'form') {
                    return null;
                }

                return (
                    <Select showSearch
                            filterOption={(input, option) =>
                                (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                            }
                            allowClear
                            options={[
                                { label: i18next.t('sqlLogSession.column.state.failure'), value: '0' },
                                { label: i18next.t('sqlLogSession.column.state.success'), value: '1' },
                            ]}
                    >

                    </Select>
                );
            },
        },{
            title: i18next.t('sqlLogSession.column.sqlCommand.title'),
            dataIndex: 'sqlCommand',
            key: 'sqlCommand',
            width: 400,
            render: (text) => (
                <Tooltip title={
                <div className='tooltipBox'>
                    <div className='tooltipBox-text'>{text}</div>
                    <SimpleCopy text={text} isShow={false} className="tooltipBox-btn-box"></SimpleCopy>
                </div>}>
                <div style={{ 
                  whiteSpace: 'nowrap', 
                  overflow: 'hidden', 
                  textOverflow: 'ellipsis', 
                  width: 400 // 确保每个单元格有足够的宽度
                }}>
                  {text}
                </div>
                </Tooltip>
              ),
        }, {
            title: i18next.t('sqlLogSession.column.reason.title'),
            dataIndex: 'reason',
            key: 'reason',
            hideInSearch: true,
        }, {
            title: i18next.t('sqlLogSession.column.created.title'),
            dataIndex: 'created',
            key: 'created',
            hideInSearch: true,
            render: (text, record) => {
                return formatDate(text, 'yyyy-MM-dd hh:mm:ss');
            }
        },
        // {
        //     title: '操作',
        //     valueType: 'option',
        //     key: 'option',
        //     render: (text, record, _, action) => [
        //         <Show menu={'sql-log-del'} key={'sql-log-del'}>
        //             <Popconfirm
        //                 key={'confirm-delete'}
        //                 title="您确认要删除此行吗?"
        //                 onConfirm={async () => {
        //                     await api.deleteById(record.id);
        //                     actionRef.current.reload();
        //                 }}
        //                 okText="确认"
        //                 cancelText="取消"
        //             >
        //                 <a key='delete' className='danger'>删除</a>
        //             </Popconfirm>
        //         </Show>,
        //     ],
        // },
    ];

    return (
        <div>
            <Content className="page-container">
                <ProTable
                    scroll={{ x: 'max-content' }}
                    columns={columns}
                    actionRef={actionRef}
                    columnsState={{
                        value: columnsStateMap,
                        onChange: setColumnsStateMap
                    }}
                    rowSelection={{
                        selections: [Table.SELECTION_ALL, Table.SELECTION_INVERT],
                        selectedRowKeys: selectedRowKeys,
                        onChange: (keys) => {
                            setSelectedRowKeys(keys);
                        }
                    }}
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
                            owner: selectRow.creator,
                            assetId: selectRow.assetId,
                            sessionId: selectRow.connectionId,
                            reason: params.reason,
                            sqlCommand:params.sqlCommand,
                            state: params.state,
                            field: field,
                            order: order
                        }
                        let result = await api.getPaging(queryParams);
                        setTotal(result['total']);
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
                        pageSize: 10,
                    }}
                    dateFormatter="string"
                    headerTitle={i18next.t('sqlLogSession.table.headerTitle')}
                    // toolBarRender={() => [
                    //     <Show menu={'sql-log-del'}>
                    //         <Button key="delete"
                    //                 danger
                    //                 disabled={selectedRowKeys.length === 0}
                    //                 onClick={async () => {
                    //                     Modal.confirm({
                    //                         title: '您确定要删除选中的执行日志吗?',
                    //                         content: '删除之后无法进行恢复，请慎重考虑。',
                    //                         okText: '确定',
                    //                         okType: 'danger',
                    //                         cancelText: '取消',
                    //                         onOk: async () => {
                    //                             await api.deleteById(selectedRowKeys.join(","));
                    //                             actionRef.current.reload();
                    //                             setSelectedRowKeys([]);
                    //                         }
                    //                     });
                    //                 }}>
                    //             删除
                    //         </Button>
                    //     </Show>,
                    //     <Show menu={'sql-log-clear'}>
                    //         <Button key="clear"
                    //                 type="primary"
                    //                 danger
                    //                 disabled={total === 0}
                    //                 onClick={async () => {
                    //                     Modal.confirm({
                    //                         title: '您确定要清空全部的文件执行日志吗?',
                    //                         content: '清空之后无法进行恢复，请慎重考虑。',
                    //                         okText: '确定',
                    //                         okType: 'danger',
                    //                         cancelText: '取消',
                    //                         onOk: async () => {
                    //                             await api.Clear();
                    //                             actionRef.current.reload();
                    //                         }
                    //                     });
                    //                 }}>
                    //             清空
                    //         </Button>
                    //     </Show>,
                    // ]}
                />
            </Content>
        </div>
    );
}

export default SqlLogSession;
