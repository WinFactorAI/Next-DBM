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
       <svg width="20px" height="19.30px" viewBox="0 0 1065 1024" version="1.1" xmlns="http://www.w3.org/2000/svg"><path fill="#6366f1" d="M819.2 854.308571l117.028571-257.462857h122.88l-210.651428 415.451429h-70.217143l-216.502857-415.451429h128.731428zM532.48 977.188571v-35.108571H386.194286v-263.314286h146.285714v-70.217143H386.194286V333.531429h263.314285v175.542857h70.217143v-175.542857h257.462857v175.542857H1053.257143V117.028571c0-64.365714-52.662857-117.028571-117.028572-117.028571H117.028571C52.662857 0 0 52.662857 0 117.028571v789.942858c0 64.365714 52.662857 117.028571 117.028571 117.028571h427.154286c-5.851429-17.554286-11.702857-29.257143-11.702857-46.811429zM76.068571 117.028571c0-23.405714 17.554286-40.96 40.96-40.96h819.2c23.405714 0 40.96 17.554286 40.96 40.96v152.137143H76.068571V117.028571z m245.76 825.051429H117.028571c-23.405714 0-40.96-17.554286-40.96-40.96v-228.205714h239.908572v269.165714z m0-333.531429H76.068571V333.531429h239.908572v275.017142z" /></svg>
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
