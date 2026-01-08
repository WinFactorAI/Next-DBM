import React from 'react';
import DataDraw from "./TableDrawer/DataDraw";
// 应用组件
function TableTreePanel() {
  // const { isTableTreePanelVisible, setIsTableTreePanelVisible } = React.useContext(VisibilityContext);
  // const { tableTreePanelSize, setTableTreePanelSize } = React.useContext(VisibilityContext);
  // initialSize={tableTreePanelSize}
  return (
    <div>
       <DataDraw />
    </div>
  );
}

export default TableTreePanel;