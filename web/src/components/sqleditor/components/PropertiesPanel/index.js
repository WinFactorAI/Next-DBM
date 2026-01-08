import React, { useContext, useEffect } from 'react';
import SplitPane from 'react-split-pane';
import { VisibilityContext } from '../../components/Utils/visibilityProvider';
import DDLPanel from './DDLPanel';
import HistoryPanel from './HistoryPanel';
import LibraryPanel from './LibraryPanel';

// 应用组件
function PropertiesPanel() {
  const { isCmdPaneVisible } = useContext(VisibilityContext);
  const { isHistoryPaneVisible } = useContext(VisibilityContext);
  const { isDDLPaneVisible } = useContext(VisibilityContext);

  const { libraryPanelSize} = useContext(VisibilityContext);
  const { dDLPanelSize } = useContext(VisibilityContext);
  const { historyPanelSize } = useContext(VisibilityContext);
  const { changeSplitPropertiesPanelSize } = useContext(VisibilityContext);
  const change = (sizes) => {
    changeSplitPropertiesPanelSize(sizes,window.innerHeight);
  };
  useEffect(() => {
    // const size  = localStorage.getItem('splitPredefinedPanelPos')
    // if( size ) {
    //   changeSplitPropertiesPanelSize(size,window.innerHeight);
    // }else {
      localStorage.setItem('splitPredefinedPanelPos', ['30%','30%','40%']);
    // }
  }, []);

  return (
    <div>
        <SplitPane split="horizontal" className="height100vh" onChange={change} >
            {isCmdPaneVisible && <DDLPanel initialSize={dDLPanelSize} minSize='200px'/>}
            {isDDLPaneVisible && <LibraryPanel initialSize={libraryPanelSize} minSize='200px' />}
            {isHistoryPaneVisible && <HistoryPanel initialSize={historyPanelSize} minSize='200px'/>}
        </SplitPane>        
    </div>
  );
}

export default PropertiesPanel;