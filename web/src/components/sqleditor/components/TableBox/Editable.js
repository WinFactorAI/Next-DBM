import { AgGridReact } from '@ag-grid-community/react'; // React Grid Logic
import "@ag-grid-community/styles/ag-grid.css"; // Core CSS
import "@ag-grid-community/styles/ag-theme-quartz.css"; // Theme
import React, { useEffect, useState } from 'react';

import { ClientSideRowModelModule } from '@ag-grid-community/client-side-row-model';
import { ModuleRegistry } from '@ag-grid-community/core';
import { debugLog } from "../../../../common/logger";

ModuleRegistry.registerModules([ ClientSideRowModelModule ]);

// Create new GridExample component
function GridExample(props){

  const [colDefs, setColDefs] = useState([]);
  const [rowData, setRowData] = useState([]);

  useEffect(() => {
    // Update colDefs when headers change
    setColDefs(Object.keys(props.headers).map((key) => {
      return { field: props.headers[key], editable: true };
    }));
  }, [props.headers]);

  useEffect(() => {
    // Update rowData when rows change
    setRowData(Object.keys(props.rows).map((rowIndex) => {
      const rowData = props.rows[rowIndex];
      const data = {};
      colDefs.forEach((colDef, colIndex) => {
        data[colDef.field] = rowData[colIndex];
      });
      return data;
    }));
  }, [props.rows, colDefs]);

  // Handle cell value changes
  const handleCellValueChanged = (params) => {
    const updatedData = params.api.getDataAsJson();
    setRowData(updatedData);
  };

 

  // const [colDefs, setColDefs] = useState(Object.keys(headers['headers']).map((key,value) => {
  //   return { field:headers['headers'][key] , editable: true };
  // }));
  // // 转换行数据数组为rowData对象数组
  // const [rowData, setRowData] = useState(() => {
  //   return Object.keys(headers['rows']).map((row, rowIndex) => {
  //     const rowData = headers['rows'][rowIndex];
  //     const data = {};
  //     colDefs.forEach((colDef, colIndex) => {
  //       data[colDef.field] = rowData[colIndex];
  //     });
  //     return data;
  //   });
  // });

  debugLog("rowData",rowData);
  
  const tableRef = React.createRef();  
  useEffect(() => {
    if (tableRef.current) {  
      const height = window.innerHeight - 570;    
      tableRef.current.style.height = `${height}px`;
    }
  }, []);
  
  // 自定义的中文文本
  const localeText = {
      noRowsToShow: '没有数据显示'
      // 在这里可以添加其他中文文本的自定义
  };
  
  // Ag-Grid React 配置
  const gridOptions = {
      // 其他配置项...
      localeText: localeText
  };
  
  // debugLog(" GridExample ",headers,rows)
  // Row Data: The data to be displayed.
  // const [rowData, setRowData] = useState([
  //   { make: "Tesla", model: "Model Y", price: 64950, electric: true },
  //   { make: "Ford", model: "F-Series", price: 33850, electric: false },
  //   { make: "Toyota", model: "Corolla", price: 29600, electric: false },
  //   { make: 'Mercedes', model: 'EQA', price: 48890, electric: true },
  //   { make: 'Fiat', model: '500', price: 15774, electric: false },
  //   { make: 'Nissan', model: 'Juke', price: 20675, electric: false },
  // ]);
  
  // Column Definitions: Defines & controls grid columns.
  // const [colDefs, setColDefs] = useState([
  //   { field: "make" },
  //   { field: "model" },
  //   { field: "price" },
  //   { field: "electric" }
  // ]);


  // debugLog("colDefs",colDefs);
  // Container: Defines the grid's theme & dimensions.
  return (
    <div ref={tableRef} className="w-full h-full  overflow-auto result-section ag-theme-quartz"   >
      <AgGridReact rowData={rowData} columnDefs={colDefs}
        gridOptions={gridOptions}
        // 处理单元格值变化事件
        onCellValueChanged={(params) => {
          // 获取修改后的数据
          const updatedData = params.api.getDataAsJson();
          // 更新rowData状态
          setRowData(updatedData);
        }}
      />
    </div>
  );
}

// Render GridExample
// const root = createRoot(document.getElementById("root"));
// root.render(<GridExample />);

export default GridExample;