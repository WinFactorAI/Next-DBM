import { ClientSideRowModelModule } from '@ag-grid-community/client-side-row-model';
import { ModuleRegistry } from '@ag-grid-community/core';
import { AgGridReact } from '@ag-grid-community/react'; // React Grid Logic
import "@ag-grid-community/styles/ag-grid.css"; // Core CSS
import "@ag-grid-community/styles/ag-theme-quartz.css"; // Theme
import { Spin } from 'antd';
import React, { forwardRef, useContext, useEffect, useImperativeHandle, useRef, useState } from 'react';
import toast from 'react-hot-toast';
import { debugLog } from "../../../../../common/logger";
import { VisibilityContext } from '../../../components/Utils/visibilityProvider';

ModuleRegistry.registerModules([ ClientSideRowModelModule ]);
// Create new GridExample component
const GridExample = forwardRef((props, ref) => {
  const gridRef = useRef();
  const [loading, setLoading] = React.useState(false);
  const {showConfirmModal,operationLabel,setOperationLabel} =  useContext(VisibilityContext);
  const [colDefs, setColDefs] = useState([]);
  const [rowData, setRowData] = useState([]);
  const [oldRow, setOldRow] = useState({});
 


  useEffect(() => {
    // 创建行号列定义
    const rowNumberColumn = {
      headerName: "#",
      field: "rowIndex",
      width: 50,
      cellRenderer: function(params) {
        return params.node.rowIndex + 1; // 行号从1开始
      },
      cellRendererParams: {
        suppressTooltip: true
      },
      filter: true,
      sortable: false,
      resizable: true,
      suppressMenu: true
    };

    // 动态生成其他列定义
    const dynamicColumns = Object.keys(props.headers).map((key) => ({
      headerName: props.headers[key], // 使用键作为列头名称
      field: key,
      editable: true
    }));

    // 合并行号列和动态生成的列定义
    const allColumns = [rowNumberColumn, ...dynamicColumns];
    setColDefs(allColumns);
  }, [props.headers]);

  useEffect(() => {
    // setLoading(true);
    // Update rowData when rows change
    // debugLog(" colDefs ",colDefs)
    setRowData(Object.keys(props.rows).map((rowIndex) => {
      const rowData = props.rows[rowIndex];
      const data = {};
      colDefs.forEach((colDef, colIndex) => {
        if(colDef.field === 0){
          data[colDef.field] = rowIndex;
        } else {
          data[colDef.field] = rowData[colIndex-1];
        }
      });
      return data;
    }));

    // 模拟异步操作
    // setTimeout(() => {
    //   setLoading(false);
    // }, 500);
  }, [props.rows, colDefs]);

  // Handle cell value changes
  const handleCellValueChanged = (params) => {
    const updatedData = params.api.getDataAsJson();
    setRowData(updatedData);
  };

  const tableRef = React.createRef();  
  const tableLoadingRef = React.createRef();
  useEffect(() => {
    if (tableRef.current) {  
      // const height = window.innerHeight - 570;    
      // tableRef.current.style.height = `${height}px`;
      tableRef.current.style.height = `${props.listHeight}px`;
    }
    // if (tableLoadingRef){
    //   tableLoadingRef.current.style.height = `${props.listHeight}px`;
    // }
    // debugLog(" props.listHeight " ,props.listHeight)
  }, [props.listHeight]);
  
  // 自定义的中文文本
  const localeText = {
      noRowsToShow: '没有数据显示'
      // 在这里可以添加其他中文文本的自定义
  };
  
  const [selectedRows, setSelectedRows] = useState([]);
  // 监听行选中事件
  const onRowSelected = (event) => {
    const selectedRows = gridRef.current.api.getSelectedRows();
    // setOperationLabel("选中"+selectedRows.length+"条")
    // debugLog('Row selected event :', selectedRows);
    // debugLog('Row selected:', event.node.data);
    setSelectedRows(event.node.data)
    setOperationLabel("选中"+selectedRows.length+"行")
 
    props.onSelectRow(selectedRows)
  }

  // 双击编辑模式
  const onCellDoubleClickedHandler = (params) => {
    debugLog('Double clicked on cell:', params);
    const currentRow = { ...params.data };
    setOldRow(currentRow)
    // 这里可以添加自定义的逻辑，例如立即开始编辑或显示弹出窗口等
    setOperationLabel("编辑"+params.column.colId+"列"+params.value)
  };
  
  const onCellClickedHandler = (params) =>{
    debugLog('Clicked on cell:', params);
    if(params.column.colId === "rowIndex"){
      const selectedRows = gridRef.current.api.getSelectedRows();
      if(selectedRows.length === 1){
        const rowIndex = parseInt(params.rowIndex) +1
        setOperationLabel("选中第"+rowIndex+"行")
      } else {
        setOperationLabel("选中"+selectedRows.length +"行")
      }

    }else{
      const rowIndex = parseInt(params.rowIndex) +1
      const colIndex = parseInt(params.column.colId) +1 
      setOperationLabel("选中"+rowIndex+"行"+colIndex+"列"+params.value)
    }
  }
  // Ag-Grid React 配置
  const gridOptions = {
      rowSelection: 'multiple',
      theme: 'ag-theme-alpine-dark', // 设置表格主题
      headerHeight: 30, // 设置表头高度
      rowHeight: 30, // 设置行高
      // 其他配置项...
      localeText: localeText,
      enableContextMenu: true,
      contextMenuSuppressDefault: true,
      getContextMenuItems: function(params) {
        return [
          {
            name: 'Copy', 
            action: function() { 
              // 实现复制功能
            }
          },
          {
            name: 'Paste', 
            action: function() { 
              // 实现粘贴功能
            }
          },
          'separator',
          {
            name: 'Delete', 
            action: function() { 
              // 实现删除功能
            }
          },
        ];
      },
      onRowSelected: onRowSelected,
      onCellDoubleClicked: onCellDoubleClickedHandler,
      onCellClicked: onCellClickedHandler,
      onGridReady: (params) => {
        // 设置行号
        params.api.forEachNode((node, index) => {
          node.data.rowIndex = index + 1;
        });
        params.api.refreshCells({ force: true }); // 刷新单元格以更新显示
      },
  };
  
  
   const deleteRowData = () => {
    // 将 rowData 数据删除包含在selectedRows 中的
    const updatedData = rowData.filter((row) => !selectedRows.includes(row));
    setRowData(updatedData);
  };
  const deleteSelectedRows = () => {
    const selectedRows = gridRef.current.api.getSelectedRows();
    if(selectedRows.length === 0){
      toast.error('请选择要删除的行')
      return 
    }
    showConfirmModal("清空查询记录","确定要删除"+selectedRows.length+"条记录吗？",null,(isOk)=>{
      if( isOk ){
        const updatedData = rowData.filter(row => !selectedRows.includes(row));
        setRowData(updatedData);
        props.pushWaitSaveRowData(selectedRows,"delete");
      }
    });
  };
   // 定义一个函数来添加一行数据
  const addRowData = () => {
   // 创建一个具有默认值的新对象
    const blankRow = colDefs.reduce((acc, def) => {
      acc[def.field] = ''; // 可以根据需要设置默认值
      return acc;
    }, {});
    const selectedRows = gridRef.current.api.getSelectedRows();
    if (selectedRows.length > 0) {
      // 获取选定行的索引
      const selectedRowIndex = rowData.findIndex(row => JSON.stringify(row) === JSON.stringify(selectedRows[0]));
  
      // 复制现有的 rowData，然后在选定行之后插入新行
      const updatedData = [...rowData.slice(0, selectedRowIndex + 1), blankRow, ...rowData.slice(selectedRowIndex + 1)];
      setRowData(updatedData);
      props.pushWaitSaveRowData(blankRow,"insert")
  
      // 重新选中插入行前的行
      gridRef.current.api.forEachNode(node => {
        if (node.rowIndex === selectedRowIndex) {
          gridRef.current.api.deselectAll();
          gridRef.current.api.forEachNode(node => {
            if (node.rowIndex === selectedRowIndex) {
              node.setSelected(true);
            }
          });
        }
      });

      setTimeout(() => {
        debugLog(" Object.keys(updatedData[0])[0] ",Object.keys(updatedData[0])[0])
        //设置默认编辑一个单元格
        gridRef.current.api.startEditingCell({
          rowIndex: selectedRowIndex + 1,
          colKey: Object.keys(updatedData[0])[0],
        });
      }, 0);

    } else {
      // 如果没有选定行，则在最后添加新行
      const updatedData = [...rowData, blankRow];
      setRowData(updatedData);
      props.pushWaitSaveRowData(blankRow,"insert");

      setTimeout(() => {
        debugLog(" Object.keys(updatedData[0])[0] ",Object.keys(updatedData[0]))
        //设置默认编辑一个单元格
        gridRef.current.api.startEditingCell({
          rowIndex: updatedData.length - 1,
          colKey: Object.keys(updatedData[0])[0],
        });
      }, 50);

    }
  };
  const [copyRows,setCopyRows] = useState([])
 
  // 复制行
  const copySelectedRow = async () => {
    try {
      const selectedRows = gridRef.current.api.getSelectedRows();
      if (selectedRows.length > 0) {
        // 将选中行复制到简切板
        // const formattedRows = selectedRows.map(row => {
        //   debugLog(" row ",row)
        //   const values = Object.values(row);
        //   return values.join(',') + "\n";
        // });
        // const selectedRowsFormat = formattedRows.join('');
        // debugLog(" selectedRowsFromat ",selectedRowsFormat)
        // await navigator.clipboard.writeText(selectedRowsFormat);

        await navigator.clipboard.writeText(selectedRows);
        toast.success('复制成功');
      } else {
        toast.error('请选择要复制的行');
      }
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  }
  const parseCSV = (csvText, colDefs) => {
    const lines = csvText.split('\n').filter(line => line.trim() !== '');
    return lines.map(line => {
      const values = line.split(',');
      return colDefs.reduce((acc, def, index) => {
        if(def.field === 0){
          acc[def.field] = index;
        } else {
          acc[def.field] = values[index-1];
        }

        return acc;
      }, {});
    });
  };
  
  // 修改
  const updateRows = (params) => {
    debugLog(" params ",params.data)
    debugLog(" oldRow ",oldRow)

    const updatedData = [...rowData];
    updatedData[params.rowIndex] = params.data;
    setRowData(updatedData);
    props.pushWaitSaveRowData(params.data,"update",oldRow);
  }
  // 粘贴
  const pasteFromClipboard = async () =>{
    try {
      // 将新行插入到原行的下一行
      const selectedRows = gridRef.current.api.getSelectedRows();
      if (selectedRows.length > 0) {
        // const pastedText = await navigator.clipboard.readText();
        // debugLog(" pastedText",pastedText)
        // // 解析CSV数据
        // const parsedData = parseCSV(pastedText, colDefs);
        const selectedRowIndex = rowData.findIndex(row => JSON.stringify(row) === JSON.stringify(selectedRows[0]));
        const updatedData = [...rowData.slice(0, selectedRowIndex + 1), ...selectedRows.map(row => ({ ...row })), ...rowData.slice(selectedRowIndex + 1)];
        setRowData(updatedData);
        props.pushWaitSaveRowData(...selectedRows.map(row => ({ ...row })),"paste");
        // 确保表格数据更新后执行定位
        setTimeout(() => {
          // 定位到新插入的行并激活第一个单元格的编辑状态
          gridRef.current.api.startEditingCell({
            rowIndex: selectedRowIndex + 1, // 新行的索引
            colKey: Object.keys(updatedData[0])[0], // 第一个列的字段名
          });
        }, 0);
        toast.success('粘贴成功')
      }else {
        toast.error("请选择一行数据");
      }
    } catch (err) {
      console.error('Failed to read clipboard contents: ', err);
      toast.error('粘贴失败'+err);
    }
  }
  const getRowStyle = (params) => {
    debugLog(" params.data ",params);
    if (params.data['_status'] === 'add') {
      return { backgroundColor: 'lightgreen' };
    } else if (params.data['_status'] === 'update') {
      return { backgroundColor: 'lightyellow' };
    } else {
      return { backgroundColor: 'white' };
    }
  };
  useImperativeHandle(ref, () => ({
    addRowData,
    deleteRowData,
    deleteSelectedRows,
    copySelectedRow,
    pasteFromClipboard
  }));
  // getRowStyle={getRowStyle}
  // debugLog("colDefs",colDefs);
  // Container: Defines the grid's theme & dimensions.

  const [theme, setTheme] = useState(localStorage.getItem('theme'));
  useEffect(() => {
      const updateTheme = () => {
        let theme = localStorage.getItem('theme');
        setTheme(theme)
      };
      updateTheme();
      const intervalId = setInterval(updateTheme, 3000);
      return () => clearInterval(intervalId);
  }, []);


  return (
    <div ref={tableRef} className={`w-full h-full overflow-auto result-section ag-grid-box ${theme === 'dark' ? 'ag-theme-custom-dark' : 'ag-theme-custom-light'}`}  >
        { loading ? (
          <Spin ref={tableLoadingRef} style={{ height: props.listHeight }} spinning={loading} tip="加载中... " >
           &nbsp;
          </Spin>
        ):(
          <AgGridReact 
          ref={gridRef}
          className={theme === 'dark' ? 'ag-theme-custom-dark' : 'ag-theme-custom-light'}
          rowData={rowData} 
          columnDefs={colDefs}
          gridOptions={gridOptions}
          // 处理单元格值变化事件
          onCellValueChanged={updateRows}
        />
        )}
    </div>
  );
});

// Render GridExample
// const root = createRoot(document.getElementById("root"));
// root.render(<GridExample />);

export default GridExample;