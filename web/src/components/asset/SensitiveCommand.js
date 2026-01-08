import { ProTable } from "@ant-design/pro-components";
import { Button, Layout, message, Popconfirm, Popover, Upload } from "antd";
import React, { useState } from 'react';
import sensitiveCommandApi from "../../api/sensitive-command";
import Show from "../../dd/fi/show";
import ColumnState, { useColumnState } from "../../hook/column-state";
import ChangeOwner from "./ChangeOwner";
import SelectingAsset from "./SelectingAsset";
import SensitiveCommandModal from "./SensitiveCommandModal";

const {Content} = Layout;
const api = sensitiveCommandApi;
const actionRef = React.createRef();
function downloadImportExampleCsv() {
    let csvString = 'name,content';
    //前置的"\uFEFF"为“零宽不换行空格”，可处理中文乱码问题
    const blob = new Blob(["\uFEFF" + csvString], {type: 'text/csv;charset=gb2312;'});
    let a = document.createElement('a');
    a.download = 'sample.csv';
    a.href = URL.createObjectURL(blob);
    a.click();
}

const importExampleContent = <>
    <a onClick={downloadImportExampleCsv}>下载示例</a>
    <div>导入敏感指令</div>
</>
const SensitiveCommand = () => {
    let [assetVisible, setAssetVisible] = useState(false);

    let [visible, setVisible] = useState(false);
    let [confirmLoading, setConfirmLoading] = useState(false);
    let [selectedRowKey, setSelectedRowKey] = useState(undefined);

    const [columnsStateMap, setColumnsStateMap] = useColumnState(ColumnState.CREDENTIAL);

    let [selectedRow, setSelectedRow] = useState(undefined);
    let [changeOwnerVisible, setChangeOwnerVisible] = useState(false);

    const columns = [
        {
            dataIndex: 'index',
            valueType: 'indexBorder',
            width: 48,
        },
        {
            title: '名称',
            dataIndex: 'name',
        }, {
            title: '内容',
            dataIndex: 'content',
            key: 'content',
        }, 
        // {
        //     title: '所有者',
        //     dataIndex: 'ownerName',
        //     key: 'ownerName',
        //     hideInSearch: true
        // },
        {
            title: '创建时间',
            key: 'created',
            dataIndex: 'created',
            hideInSearch: true,
        },
        {
            title: '操作',
            valueType: 'option',
            key: 'option',
            render: (text, record, _, action) => [
                // <Show menu={'command-exec'} key={'command-exec'}>
                //     <a
                //         key="run"
                //         onClick={() => {
                //             setAssetVisible(true);
                //             setSelectedRowKey(record['id']);
                //         }}
                //     >
                //         执行
                //     </a>
                // </Show>,
                <Show menu={'command-edit'} key={'command-edit'}>
                    <a
                        key="edit"
                        onClick={() => {
                            setVisible(true);
                            setSelectedRowKey(record['id']);
                        }}
                    >
                        编辑
                    </a>
                </Show>,
                // <Show menu={'command-change-owner'} key={'command-change-owner'}>
                //     <a
                //         key="change-owner"
                //         onClick={() => {
                //             handleChangeOwner(record);
                //         }}
                //     >
                //         更换所有者
                //     </a>
                // </Show>,
                <Show menu={'command-del'} key={'command-del'}>
                    <Popconfirm
                        key={'confirm-delete'}
                        title="您确认要删除此行吗?"
                        onConfirm={async () => {
                            await api.deleteById(record.id);
                            actionRef.current.reload();
                        }}
                        okText="确认"
                        cancelText="取消"
                    >
                        <a key='delete' className='danger'>删除</a>
                    </Popconfirm>
                </Show>,
            ],
        },
    ];

    const handleChangeOwner = (row) => {
        setSelectedRow(row);
        setChangeOwnerVisible(true);
    }

    const handleImportSensitiveCommand = async (file) => {

        let [success, data] = await api.importSensitiveCommand(file);
        if (success === false) {
            notification['error']({
                message: '导入动态命令失败',
                description: data,
            });
            return false;
        }

        let successCount = data['successCount'];
        let errorCount = data['errorCount'];
        if (errorCount === 0) {
            notification['success']({
                message: '导入动态命令成功',
                description: '共导入成功' + successCount + '条动态命令。',
            });
        } else {
            notification['info']({
                message: '导入动态命令完成',
                description: `共导入成功${successCount}条动态命令，失败${errorCount}条动态命令。`,
            });
        }
        actionRef.current.reload();
        return false;
    }

    return (<Content className="page-container">
        <ProTable
            scroll={{ x: 'max-content' }}
            columns={columns}
            actionRef={actionRef}
            columnsState={{
                value: columnsStateMap,
                onChange: setColumnsStateMap
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
                    name: params.name,
                    content: params.content,
                    field: field,
                    order: order
                }
                let result = await api.getPaging(queryParams);
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
            headerTitle="敏感指令列表"
            toolBarRender={() => [
                <Show menu={'command-add'}>
                    <Button key="button" type="primary" onClick={() => {
                        setVisible(true)
                    }}>
                        新建
                    </Button>
                </Show>,
                <Show menu={'asset-import'}>
                    <Popover content={importExampleContent}>
                        <Upload
                            maxCount={1}
                            beforeUpload={handleImportSensitiveCommand}
                            showUploadList={false}
                        >
                            <Button key='import'>导入</Button>
                        </Upload>
                    </Popover>
                </Show>,
            ]}
        />

        <SensitiveCommandModal
            id={selectedRowKey}
            visible={visible}
            confirmLoading={confirmLoading}
            handleCancel={() => {
                setVisible(false);
                setSelectedRowKey(undefined);
            }}
            handleOk={async (values) => {
                setConfirmLoading(true);

                try {
                    let success;
                    if (values['id']) {
                        success = await api.updateById(values['id'], values);
                    } else {
                        success = await api.create(values);
                    }
                    if (success) {
                        setVisible(false);
                    }
                    actionRef.current.reload();
                } finally {
                    setConfirmLoading(false);
                }
            }}
        />

        <SelectingAsset
            visible={assetVisible}
            handleCancel={() => {
                setAssetVisible(false);
                setSelectedRowKey(undefined);
            }}
            handleOk={(rows) => {
                if (rows.length === 0) {
                    message.warning('请至少选择一个资产');
                    return;
                }

                let cAssets = rows.map(item => {
                    return {
                        id: item['id'],
                        name: item['name']
                    }
                });

                window.location.href = '#/execute-command?commandId=' + selectedRowKey + '&assets=' + JSON.stringify(cAssets);
            }}
        />

        <ChangeOwner
            lastOwner={selectedRow?.owner}
            open={changeOwnerVisible}
            handleOk={async (owner) => {
                let success = await api.changeOwner(selectedRow?.id, owner);
                if (success) {
                    setChangeOwnerVisible(false);
                    actionRef.current.reload();
                }
            }}
            handleCancel={() => {
                setChangeOwnerVisible(false);
            }}
        />
    </Content>);
};

export default SensitiveCommand;