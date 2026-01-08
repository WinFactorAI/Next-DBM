import i18next from 'i18next';
import { useContext, useEffect, useState } from 'react';
import About from '../../components/DBM/About';
import { VisibilityContext } from '../../components/Utils/visibilityProvider';
// 状态栏
function StatusBar({ showAboutModel }) {
  const { 
    tabs, 
    tabIndex,
    statusLabel,setStatusLabel,
    dbInfo,
    osInfo,
    operationLabel,
    setOperationLabel,
    dbVariables,
    language,
    getTabByID,
  } = useContext(VisibilityContext);
  const [modelType, setModelType] = useState('');

  useEffect(() => {
    // console.log(" #### StatusBar tabIndex ", tabIndex);
    let currentTab = getTabByID(tabIndex)
    setModelType(currentTab && currentTab.type)
  }, [tabIndex, osInfo, getTabByID]);

  return (
    <p className="flex items-center overflow-hidden whitespace-nowrap" key={`dbeditor-bar-${language}`}>
      <span className="text-gray-500 ml-1 text-size-12 truncate"> {i18next.t('dbmEditor.statusBar.model')} {modelType} </span>
      <span className="ml-1 mr-1 statusBar-line" />
      <span className="text-gray-500 ml-1 text-size-12 truncate"> {i18next.t('dbmEditor.statusBar.status')} {statusLabel} </span>
      <span className="ml-1 mr-1 statusBar-line" />
      {dbInfo && <span className="text-gray-500 ml-1 text-size-12 truncate"> {dbInfo} </span>}
      {dbInfo && <span className="ml-1 mr-1 statusBar-line" />}
      {osInfo && <span className="text-gray-500 ml-1 text-size-12 truncate"> {osInfo} </span>}
      {osInfo && <span className="ml-1 mr-1 statusBar-line" />}
      <span className="text-gray-500 modal-about"><About></About></span>
      <span className="ml-1 mr-1 statusBar-line" />
      <span className="text-gray-500 ml-1 text-size-12 operationLabel"> {operationLabel} </span>
      {/* <span className="bg-gray-400 ml-1 mr-1" style={{ height: '1em', width: '1px' }} /> */}
    </p>
  );
}

export default StatusBar;