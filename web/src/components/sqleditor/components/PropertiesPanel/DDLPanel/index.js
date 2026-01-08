import i18next from 'i18next';
import { setLocaleData } from 'monaco-editor-nls';
import zh_CN from 'monaco-editor-nls/locale/zh-hans.json';
import React, { useContext, useEffect, useRef, useState } from 'react';
import MonacoEditor from 'react-monaco-editor';
import { VisibilityContext } from '../../../components/Utils/visibilityProvider';

// 应用组件
function DDLPanel() {
  // const { isDDLPaneVisible, ddlValue, ddlHeight, ddlWidth } = React.useContext(VisibilityContext);
  const { language } = useContext(VisibilityContext);
  const { ddlValue } = useContext(VisibilityContext);
  const { dDLPanelSizePx } = useContext(VisibilityContext);
  const { percentToPx } = useContext(VisibilityContext);
  const dDLPanelRef = React.createRef();
  const monacoRef = useRef(null);
  useEffect(() => {
    // debugLog(' ### dDLPanelSizePx == ',  dDLPanelSizePx  );   
    if (dDLPanelRef.current) {
      // const dDLPanelSizePx = percentToPx(dDLPanelSize,window.innerHeight)
      // debugLog(" dDLPanelSizePx " ,dDLPanelSizePx)
      dDLPanelRef.current.style.height = `${dDLPanelSizePx}px`;
    }
  }, [dDLPanelSizePx]);

  const editorOptions = {
    // 不显示迷你地图
    minimap: {
      enabled: false
    },
    // 启用SQL语法高亮和关键字提示
    language: 'sql',
    autoClosingBrackets: 'always',
    quickSuggestions: true,
    suggestOnTriggerCharacters: true,
    // 启用自动完成功能
    autoClosingBrackets: true,
    autoClosingQuotes: true,
    quickSuggestions: {
      strings: true,
      other: true,
      comments: false
    },
    automaticLayout: true,
    // 不显示行号
    lineNumbers: false,
    readOnly: true,
    locale: 'zh-cn',
    // 其他选项...
  };

  useEffect(() => {
    // console.log('##### MonacoEditor');
    setLocaleData(zh_CN);
  }, [language]);
  const [theme, setTheme] = useState(localStorage.getItem('theme'));
  useEffect(() => {
    const updateTheme = () => {
      let theme = localStorage.getItem('theme');
      setTheme(theme)
    };
    updateTheme();
    const intervalId = setInterval(updateTheme, 3000);
    return () => clearInterval(intervalId);
  }, []);
  return (
    <div className="bg-white"  >
      <div className="right-box-title" key={`dbeditor-ddlpanel-${language}`} >
        {i18next.t('dbmEditor.DDLPanel.info')}
      </div>
      <div className="text-indigo-500">
        <div ref={dDLPanelRef}>
          <MonacoEditor
            width="100%"
            height='100%'
            theme={theme === 'dark' ? 'vs-dark' : 'vs'}
            language="sql"
            value={ddlValue}
            options={editorOptions}
            editorWillMount={(monaco) => {
              monacoRef.current = monaco;
            }}
            editorDidMount={(editor, monaco) => {

            }}
          />
        </div>
      </div>
    </div>
  );
}

export default DDLPanel;