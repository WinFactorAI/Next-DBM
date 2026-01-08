import React from 'react';
import ReactDiffViewer, { DiffMethod } from 'react-diff-viewer';
  
function DiffViewer ({splitView,oldCode,newCode}) {
 
  return (
    <ReactDiffViewer 
    oldValue={oldCode} 
    newValue={newCode} 
    splitView={splitView}
    compareMethod={DiffMethod.WORDS}
    showDiffOnly ={true}/>
  );
 
}
export default DiffViewer;