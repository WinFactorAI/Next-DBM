import React, { useContext, useEffect } from 'react';
import SplitPane from 'react-split-pane';
import { VisibilityContext } from '../../components/Utils/visibilityProvider';
import PropertiesPanel from '../PropertiesPanel';
import TabBoxPanel from '../TabBoxPanel';
import TableTreePanel from '../TableTreePanel';
// 应用组件
function MainPanel() {
  const { 
    isTableTreePanelVisible ,
    isPropertiesPanelVisible,
    tableTreePanelSize ,
    propertiesPanelSize ,
    changeMainPanelSize
  } = useContext(VisibilityContext);
 
  
  useEffect(() => {
 
  }, [tableTreePanelSize,propertiesPanelSize,changeMainPanelSize]);
  const change=(size) =>{
    changeMainPanelSize(size,window.innerWidth);
  }

  return (
      <SplitPane split="vertical" className="main-split-pane" onChange={change}>
          <TableTreePanel 
             initialSize={isTableTreePanelVisible ? tableTreePanelSize : 0}
             minSize={isTableTreePanelVisible ? "10%" : 0}
             maxSize={isTableTreePanelVisible ? "500px" : 0}
          ></TableTreePanel>
          <TabBoxPanel></TabBoxPanel>
          <PropertiesPanel 
            initialSize={isPropertiesPanelVisible ? propertiesPanelSize : 0}
            minSize={isPropertiesPanelVisible ? "10%" : 0}
            maxSize={isPropertiesPanelVisible ? "50%" : 0}
          ></PropertiesPanel>
      </SplitPane>
  );
}

export default MainPanel;