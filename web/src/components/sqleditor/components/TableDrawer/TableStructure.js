import React, { useState } from "react";
import GetTableInfo from "../GetTableInfo";
import TablePopup from "./TablePopup";

function TableStructure({ tableName, tableHead, tableNo }) {
  const [trigger, setTrigger] = useState(false);
  tableHead = Object.values(tableHead);

  // 状态：控制内容的显示和隐藏
  const [isVisible, setIsVisible] = useState(false);
  const [tableHeadData, setTableHeadData] = useState([]);
  const [tableRowData, setTableRowData] = useState([]);
  const handleTable = () => {
    const { tableHeaders, tableRows } = GetTableInfo(tableNo);
    setTableHeadData(tableHeaders);
    setTableRowData(tableRows);
    setTrigger(true);
  };
  // 点击按钮时调用的函数，用于切换状态
  const handleClick = () => {
    setIsVisible(!isVisible);
  };

  return (
    <div className="mx-2">
      <div className="flex items-center cursor-pointer" onClick={handleClick}>
        <svg width="20px" height="20.00px" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg"><path fill="#6366f1" d="M959.825 384.002V191.94c0-70.692-57.308-128-128-128H191.94c-70.692 0-128 57.308-128 128v639.885c0 70.692 57.308 128 128 128h639.885c70.692 0 128-57.308 128-128V384.002z m-813.16-237.337a63.738 63.738 0 0 1 45.336-18.785H832a63.962 63.962 0 0 1 63.886 64.121v128.061H127.88v-128.06a63.738 63.738 0 0 1 18.785-45.337z m269.127 461.308v-223.97h192.181v223.97H415.792z m192.181 63.94v223.972H415.792V671.914h192.181z m-256.121-63.94H127.88v-223.97h223.972v223.97zM146.665 877.21a63.467 63.467 0 0 1-18.785-45.21V671.914h223.972v223.97h-159.85a63.626 63.626 0 0 1-45.337-18.675z m749.22-45.21a63.763 63.763 0 0 1-63.886 63.886H671.914V671.914h223.97v160.085z m0-224.026H671.914v-223.97h223.97v223.97z" /></svg>
        {isVisible ? (
          <p className="font-bold text-lg ml-3 text-gray-500">{tableName} [-]</p>
          ):(
          <p className="font-bold text-lg ml-3 text-gray-500">{tableName} [+]</p>
        )}
      </div>
      {isVisible && tableHead.map((row, index) => (
        <div className="flex items-end relative ml-3" key={index}>
          <div className="w-6 h-8 border-l-2 border-b-2"></div>
          <p className="absolute top-5 left-9 text-gray-500 text-sm font-semibold">
            {row}{" "}
            <span className="text-indigo-300 hover:text-indigo-400">
              [varchar(40)]
            </span>
          </p>
        </div>
      ))}

      <TablePopup
        trigger={trigger}
        setTrigger={setTrigger}
        headers={tableHeadData}
        rows={tableRowData}
      />
    </div>
  );
}

export default TableStructure;
