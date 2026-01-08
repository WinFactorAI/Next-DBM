import React, { useState } from "react";
import Select from 'react-select';
import DataTree from "./DataTree";

const options = [
  { value: 'chocolate', label: 'Chocolate' },
  { value: 'strawberry', label: 'Strawberry' },
  { value: 'vanilla', label: 'Vanilla' }
]

function DataDraw() {
  let customers = require("../DataStore/customers.json");
  let suppliers = require("../DataStore/suppliers.json");
  let products = require("../DataStore/products.json");

  const [isExpandedTable, setIsExpandedTable] = useState(true);
  const [isExpandedView, setIsExpandedView] = useState(false);
  const [isExpandedFunction, setIsExpandedFunction] = useState(false);

  const toggleExpansionTable = () => {
    setIsExpandedTable(!isExpandedTable);
  };
  const toggleExpansionView = () => {
    setIsExpandedView(!isExpandedView);
  };
  const toggleExpansionFunction = () => {
    setIsExpandedFunction(!isExpandedFunction);
  };

  return (
    <div className="w-full h-screen overflow-auto">
      <div title="数据库" className="parent-container">
        <svg className="ml-2"  width="30px" height="30.00px" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg"><path d="M923.648 209.92C923.648 108.032 738.304 25.6 512 25.6s-411.648 81.92-411.648 184.32v24.064c23.04 49.664 66.56 87.04 119.808 101.376a4.589 4.589 0 0 1 4.608 4.608c4.608 5.12 14.336 5.12 18.944 9.728 4.608 4.608 9.728 4.608 19.456 4.608s4.608 0 9.728 4.608c4.608 4.608 14.848 4.608 19.456 4.608h11.264c9.728 4.608 19.456 4.608 33.792 9.728 14.336 5.12 19.456 4.608 29.184 4.608h4.608c9.728 0 19.456 4.608 29.184 4.608h9.728c9.728-1.024 19.968 1.024 29.184 4.608H512c203.776 0 373.248-62.976 411.648-150.016V209.92z" fill="#4E8CEE" /><path d="M512 583.68c208.384 0 377.856-67.584 411.648-155.136V291.84C883.712 378.88 715.776 441.856 512 441.856s-377.856-67.584-411.648-154.624v144.896C140.288 519.168 308.736 583.68 512 583.68z" fill="#A6C5F6" /><path d="M512 771.072c208.384 0 377.856-67.584 411.648-154.624V476.16C889.856 563.2 715.776 630.784 512 630.784s-371.2-62.976-411.136-150.016v140.288C140.288 708.096 308.736 771.072 512 771.072z" fill="#A6C5F6" /><path d="M512 822.784c-203.264 0-371.2-61.44-411.136-148.48v135.68C100.864 911.36 285.184 998.4 512 998.4s411.648-81.92 411.648-188.416v-140.8c-33.792 87.552-203.264 153.6-411.648 153.6z" fill="#A6C5F6" /></svg>
        <Select options={options} className="m-2 w-full" placeholder="Select Databases" isClearable />
      </div>
      <DataTree/>
    </div>

  );
}

export default DataDraw;
