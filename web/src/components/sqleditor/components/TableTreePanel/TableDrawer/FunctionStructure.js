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
        <svg width="20px" height="18.84px" viewBox="0 0 1102 1024" version="1.1" xmlns="http://www.w3.org/2000/svg"><path fill="#6366f1" d="M940.268308 1024H760.648205v-81.132308h179.698872a81.394872 81.394872 0 0 0 81.26359-81.394871V162.527179a81.394872 81.394872 0 0 0-81.237334-81.394871H734.391795V0h205.955282A162.789744 162.789744 0 0 1 1102.769231 162.527179v698.945642A163.026051 163.026051 0 0 1 940.268308 1024z m-255.894975-690.018462a33.214359 33.214359 0 0 1-37.257846-24.681025c-0.210051-2.100513-5.592615-45.42359-41.668923-45.42359-38.833231 0-64.039385 66.691282-74.699487 95.310769l-2.940718 7.614359c-2.625641 6.826667-9.268513 27.044103-18.379487 55.138462h84.466872a27.779282 27.779282 0 1 1 0 53.825641h-101.691077q-46.132513 145.723077-91.346052 291.18359A118.285128 118.285128 0 0 1 289.188103 840.205128a138.633846 138.633846 0 0 1-130.205539-87.69641 26.781538 26.781538 0 0 1 23.630769-33.345641 36.969026 36.969026 0 0 1 42.929231 18.379487 76.931282 76.931282 0 0 0 63.698051 48.836923 54.744615 54.744615 0 0 0 45.108513-34.133333c5.093744-16.278974 51.016205-164.365128 86.646154-276.48h-104.027897a27.779282 27.779282 0 1 1 0-53.825641h121.147077c11.395282-35.446154 20.164923-61.965128 23.630769-70.629744l2.625641-7.351795c16.357744-43.323077 50.412308-133.907692 141.180718-133.907692a106.023385 106.023385 0 0 1 110.749538 94.785641 30.194872 30.194872 0 0 1-31.927795 29.144615zM524.760615 0h79.425641v79.294359h-79.425641V0zM81.26359 162.527179v698.945642a81.394872 81.394872 0 0 0 81.237333 81.132307h232.237949V1024H162.500923A163.026051 163.026051 0 0 1 0 861.472821V162.527179A162.789744 162.789744 0 0 1 162.500923 0h232.237949v81.132308H162.500923A81.394872 81.394872 0 0 0 81.394872 162.527179zM604.186256 1024h-79.425641v-79.556923h79.425641V1024z m-29.039589-280.681026a28.356923 28.356923 0 0 1 11.264-21.79282l73.517948-67.478975-67.058871-60.127179a29.748513 29.748513 0 0 1 24.155897-53.563077 50.83241 50.83241 0 0 1 38.071795 16.278974l53.116718 55.138462 54.193231-55.138462a50.911179 50.911179 0 0 1 35.446153-16.278974 33.450667 33.450667 0 0 1 38.071795 27.569231 30.798769 30.798769 0 0 1-11.211487 21.79282l-69.842051 63.277949 71.890051 64.328205a29.722256 29.722256 0 0 1-24.103384 53.563077 51.803897 51.803897 0 0 1-38.098052-16.278974l-57.974154-59.339487-57.921641 59.339487a50.54359 50.54359 0 0 1-35.446153 16.01641 33.319385 33.319385 0 0 1-38.203077-27.306667z m227.485538 27.569231z"  /></svg>
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
