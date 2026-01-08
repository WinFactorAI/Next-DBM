import { CheckOutlined, CloseOutlined, CopyOutlined, MinusOutlined, PlusOutlined, SnippetsOutlined, SyncOutlined } from '@ant-design/icons';
import { Button, Pagination } from 'antd';
import React, { useContext, useEffect, useRef, useState } from "react";
import { CSVLink } from "react-csv";
import toast from 'react-hot-toast';
import { debugLog } from "../../../../../common/logger";
import { VisibilityContext } from '../../../components/Utils/visibilityProvider';
import Editable from "./Editable";
function Table({ isOperation, tab, item, query, headers, rows, csvData, listHeight }) {
  const { showConfirmModal } = useContext(VisibilityContext);
  const {
    webSocketSendData,
    getSQLConverter,
  } = useContext(VisibilityContext);
  // 根据 isOperation 的值动态设置 display 属性
  const displayStyle = isOperation ? {} : { display: 'none' };
  const [currentPage, setCurrentPage] = useState(1);

  const [isShowSaveBtn, setIsShowSaveBtn] = useState(false);
  const [isAddRow, setIsAddRow] = useState(true);
  const [isDeleteRow, setIsDeleteRow] = useState(false);
  const [isCopyRow, setIsCopyRow] = useState(false);
  const [isPasteRow, setIsPasteRow] = useState(false);
  const [isSaveRow, setIsSaveRow] = useState(false);
  const [isSelectedRow, setIsSelectedRow] = useState(false);

  const [waitSaveRowData, setWaitSaveRowData] = useState([]);
  const waitSaveRowDataRef = useRef(waitSaveRowData);
  useEffect(() => {
    // setIsAddRow(false);
    setIsDeleteRow(false);
    setIsCopyRow(false);
    setIsSaveRow(false); // 默认保存按钮禁用

    // 如果 waitSaveRowData 不为空，启用相关按钮
    if (waitSaveRowData.length > 0) {
      setIsSaveRow(true);  // 启用保存按钮
    }
  }, []); // 只在组件加载时执行一次
  useEffect(() => {
    debugLog(" waitSaveRowData ", waitSaveRowData)
    if (waitSaveRowData.length > 0) {
      setIsSaveRow(true)
      setIsAddRow(false)
      setIsDeleteRow(false)
      setIsCopyRow(false)
      setIsPasteRow(false)
    } else {
      setIsSaveRow(false)
      // setIsAddRow(true)
      // setIsDeleteRow(true)
      // setIsCopyRow(true)
    }
    waitSaveRowDataRef.current = waitSaveRowData;
  }, [waitSaveRowData])

  // debugLog("Table", headers, rows, csvData);
  const editableRef = React.createRef();
  const editableBoxRef = React.createRef();
  const editableBoxEmptyRef = React.createRef();
  useEffect(() => {

    if (editableBoxEmptyRef.current) {
      editableBoxEmptyRef.current.style.height = `${listHeight}px`;
    }
  }, [listHeight]);

  const [defaultPageSize, setDefaultPageSize] = useState(item.attr.pageSize);
  const [totalRows, setTotalRows] = useState([]);
  useEffect(() => {
    // 遍历item.attr.totalRows 添加_index属性  生成唯一的key
    setTotalRows(item.attr.totalRows);
    setDefaultPageSize(item.attr.pageSize)
  }, [item.attr]);

  const handleShowSizeChange = (current, pageSize) => {
    debugLog('Current page:', current);
    debugLog('Page size:', pageSize);
    setDefaultPageSize(pageSize)
    // 在这里处理页面大小变化的逻辑
    // 例如更新状态或调用 API
  };
  const handlePageChange = (currentPage, pageSize) => {
    // 点击结果分页进行查询结果
    debugLog('currentPage:', currentPage, 'PageSize:', pageSize);
    setCurrentPage(currentPage);
    // debugLog('### item.attr.sqlCommand :', item.attr.sqlCommand);
    webSocketSendData({
      "key": item.tabKey,
      "retType": 'tableRsesult',
      "data": item.attr.sqlCommand,
      "attr": {
        sqlCommand: item.attr.sqlCommand,
        totalRows: totalRows,
        pageSize: pageSize,
        currentPage: currentPage,
        tabId: item.tabKey,
        newTabIndex: null,
        nextAction: 'getTableStruct',
        timestamp: new Date().getTime(),
        sqlCommand: item.attr.sqlCommand
      }
    });
    setIsDeleteRow(false)
    setIsCopyRow(false)
    setIsPasteRow(false)
    setIsSaveRow(false)
  };

  const onSelectRow = (record, selected, selectedRows) => {
    debugLog('waitSaveRowDataRef.current.length ', waitSaveRowDataRef.current.length, " isSaveRow ", isSaveRow);
    if (waitSaveRowDataRef.current.length == 0) {
      setIsDeleteRow(true);
      setIsCopyRow(true);
    }
  }
  const refresh = () => {
    setIsAddRow(true)
    handlePageChange(item.attr.currentPage, item.attr.pageSize)
    toast.success('刷新成功')
  }
  const save = () => {
    debugLog('### waitSaveRowData.length :', waitSaveRowData.length, 'isSaveRow :', isSaveRow);
    if (waitSaveRowData.length > 0 && isSaveRow == true) {
      const sql = getSQLConverter('insertRow',
        {
          database: tab.dbName,
          tableName: tab.tableName,
          tableStruct: tab.tableStruct.slice(1),
          columns: headers,
          values: waitSaveRowData
        })
      debugLog(" sql ", sql)
      webSocketSendData({
        "key": item.tabKey + "-insertRow",
        "retType": 'KeyValueJsonResult',
        "data": sql,
        "attr": {
          tabId: item.tabKey,
          sqlCommand: sql,
          timestamp: new Date().getTime(),
          dataType: 'insertRow',
        }
      })
    }
    toast.success('保存成功')
    setWaitSaveRowData([])
  }
  const dontSave = () => {
    toast.success('不保存')
    setWaitSaveRowData([])
    refresh()
  }
  const pushWaitSaveRowData = (rows, type, oldRow) => {
    debugLog('### row :', rows, 'type:', type);
    if (type === 'delete') {
      // 生成SQL诶句
      const sql = getSQLConverter('deleteRow',
        {
          database: tab.dbName,
          tableName: tab.tableName,
          tableStruct: tab.tableStruct.slice(1),
          columns: headers,
          values: rows
        })
      debugLog(" sql ", sql)
      //  rowId: rows[0][0],
      webSocketSendData({
        "key": item.tabKey + "-deleteRow",
        "retType": 'KeyValueJsonResult',
        "data": sql,
        "attr": {
          tabId: item.tabKey,
          sqlCommand: sql,
          timestamp: new Date().getTime(),
        }
      })
      //  handlePageChange(item.attr.currentPage,item.attr.pageSize)  
    }
    if (type === 'update' && isSaveRow == false) {
      // 生成SQL诶句
      const sql = getSQLConverter('updateRow',
        {
          database: tab.dbName,
          tableName: tab.tableName,
          tableStruct: tab.tableStruct.slice(1),
          columns: headers,
          values: rows,
          oldRow: oldRow
        })
      debugLog(" sql ", sql)
      webSocketSendData({
        "key": item.tabKey + "-updateRow",
        "retType": 'KeyValueJsonResult',
        "data": sql,
        "attr": {
          tabId: item.tabKey,
          sqlCommand: sql,
          timestamp: new Date().getTime(),
          dataType: 'updateRow',
        }
      })
    } else if (type === 'update' && isSaveRow == true) {
      setWaitSaveRowData([rows])
    }
    if (type === 'insert') {
      setIsSaveRow(true)
      setIsDeleteRow(false)
      setIsCopyRow(false)
      setIsPasteRow(false)
      debugLog('### insert :', rows, 'type:', type);
      setWaitSaveRowData([rows])

      // const sql = getSQLConverter('deleteRow',{database: item.attr.database,tableName: item.attr.tableName,columns: item.attr.headers,values: rows})
      // debugLog(" rows ",rows)
      // const sql = getSQLConverter('insertRow',
      //     {
      //       database: tab.dbName,
      //       tableName: tab.tableName,
      //       tableStruct: tab.tableStruct.slice(1),
      //       columns: headers,
      //       values: rows
      //     })
      // debugLog(" sql ",sql)
      // webSocketSendData({
      //   "key": item.tabKey+ "-insertRow",
      //   "retType": 'KeyValueJsonResult',
      //   "data": sql,
      //   "attr": {
      //     tabId: item.tabKey,
      //     sqlCommand : sql,
      //     timestamp :new Date().getTime(),
      //     dataType: 'insertRow',
      //   }
      // })
    }
    if (type === 'paste') {
      setIsSaveRow(true)
      debugLog('### paste :', rows, 'type:', type);
      setWaitSaveRowData([rows])
    }
    // row._action = type
    // setWaitSaveRowData([...waitSaveRowData, rows])
  }
  return (
    <div>
      {query ? (
        <section ref={editableBoxRef} >
          <div className="flex w-full justify-between lg:mt-0 border-b">
            <div className="text-center m-1 table-bar div-inline-block">

              <div className='table-tool-bar-box' style={displayStyle}>
                <Button size='small' type="link" title="刷新" onClick={() => {
                  refresh()
                }}><SyncOutlined /></Button>
                <span className="bg-gray-500 ml-1 mr-1 bar-line" />
                <Button size='small' type="link" title="添加行" disabled={!isAddRow} onClick={() => {
                  editableRef.current.addRowData()
                  // debugLog('### isSaveRow :', isSaveRow);
                  // setIsAddRow(false)
                  // setIsDeleteRow(false)
                  // setIsPasteRow(false)
                }}><PlusOutlined /></Button>
                <Button size='small' type="link" title="删除行" disabled={!isDeleteRow} onClick={() => {
                  editableRef.current.deleteSelectedRows()
                  setIsDeleteRow(false)
                }}><MinusOutlined /></Button>
                {/* <Button size='small' type="link" title="撤销" onClick={()=>{
                  // cancelOperation()
                }}><RollbackOutlined /></Button> */}

                <Button size='small' type="link" title="复制" disabled={!isCopyRow} onClick={() => {
                  editableRef.current.copySelectedRow()
                  setIsPasteRow(true)
                }}><CopyOutlined /></Button>
                <Button size='small' type="link" title="粘贴" disabled={!isPasteRow} onClick={() => {
                  editableRef.current.pasteFromClipboard()
                  setIsSaveRow(true)
                }}><SnippetsOutlined /></Button>

                {/* <Button size='small' type="text"><EyeOutlined /></Button> */}
                <Button size='small' type="link" title="应用" disabled={!isSaveRow} onClick={() => {
                  save()
                }}><CheckOutlined /></Button>
                <Button size='small' type="link" title="放弃" disabled={!isSaveRow} onClick={() => {
                  dontSave()
                }}><CloseOutlined /></Button>
                <span className="bg-gray-500 ml-1 mr-1 bar-line" />
              </div>
              <div className='table-tool-bar-page-box'>
                <Pagination
                  size="small"
                  total={totalRows}
                  current={currentPage}
                  showLessItems
                  showSizeChanger
                  onChange={handlePageChange}
                  onShowSizeChange={handleShowSizeChange}
                  defaultPageSize={defaultPageSize}
                  locale={{
                    items_per_page: '',
                    jump_to: '跳至',
                    jump_to_confirm: '确定',
                    page: '页',
                    first_page: '第一页',
                    last_page: '最后一页',
                    prev_page: '上一页',
                    next_page: '下一页',
                    prev_5: '向前 5 页',
                    next_5: '向后 5 页',
                    total: (total) => `共 ${total} 条`
                  }}
                  showTotal={(total) => `总 ${total} 条`} />
              </div>
              <div className='table-tool-bar-page-box'>
                <span className="bg-gray-300 ml-1 mr-1 bar-line" />
                <span className="text-gray-400 ">执行时间: {item.attr.useTime}s</span>
              </div>
            </div>

            <CSVLink
              data={csvData}
              filename={new Date().getTime().toString() + ".csv"}
              className="p-1"
              style={{ display: "none" }}
            >
              <button className="flex mx-auto text-white bg-indigo-500 border-0  py-1 h-6 px-1 focus:outline-none hover:bg-indigo-600  text-lg justify-center items-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 40.496 36"
                  className="fill-current"
                >
                  <path
                    id="Icon_awesome-file-export"
                    d="M27,8.571a1.682,1.682,0,0,0-.492-1.188L19.624.492A1.686,1.686,0,0,0,18.429,0H18V9h9ZM40.148,21.656,33.42,14.878a1.128,1.128,0,0,0-1.927.795V20.25h-4.5v4.5h4.5v4.584a1.128,1.128,0,0,0,1.927.795l6.729-6.785A1.2,1.2,0,0,0,40.148,21.656ZM13.5,23.625v-2.25a1.128,1.128,0,0,1,1.125-1.125H27v-9H17.438A1.692,1.692,0,0,1,15.75,9.563V0H1.688A1.683,1.683,0,0,0,0,1.688V34.313A1.683,1.683,0,0,0,1.688,36H25.313A1.683,1.683,0,0,0,27,34.313V24.75H14.625A1.128,1.128,0,0,1,13.5,23.625Z"
                  />
                </svg>
                <span className="pl-2 font-semibold">导出CSV</span>
              </button>
            </CSVLink>
          </div>
          <Editable ref={editableRef}
            headers={headers}
            rows={rows}
            listHeight={listHeight}

            onSelectRow={onSelectRow}

            setIsDeleteRow={setIsDeleteRow}
            setIsCopyRow={setIsCopyRow}
            setIsPasteRow={setIsPasteRow}
            setIsSaveRow={setIsSaveRow}
            pushWaitSaveRowData={pushWaitSaveRowData}
          ></Editable>
        </section>
      ) : (
        <div ref={editableBoxEmptyRef} className="table-empty-box w-full flex text-center justify-center items-center font-bold font-mono text-gray-400 text-2xl px-6">
          暂无数据
        </div>
      )}
    </div>
  );
}

export default Table;
