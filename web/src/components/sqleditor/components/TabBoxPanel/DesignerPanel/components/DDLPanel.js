import React, { useCallback, useContext, useEffect, useRef, useState } from "react";
import MonacoEditor from 'react-monaco-editor';
import { debugLog } from "../../../../../../common/logger";
import { VisibilityContext } from '../../../../components/Utils/visibilityProvider';
function DDLPanel({ setValue, value, currentHeight }) {
  const {tabs,tabIndex,getTabByID} = useContext(VisibilityContext);
 
  const editableRef = React.createRef();  
  useEffect(() => {
    if (editableRef.current) {  
      editableRef.current.style.height = `${currentHeight}px`;
    }
  }, [currentHeight]);

  const [sqlValue, setSqlValue] = useState("");
  useEffect(() => {
    setSqlValue(getTabByID(tabIndex).sql);
  },[tabs,tabIndex]);

  // 编辑器实例引用
  const editorRef = useRef(null);
  // Monaco API 引用
  const monacoRef = useRef(null);

  // 获取编辑器实例的回调函数
  const editorDidMountHandle = useCallback((editor, monacoIns) => {
    if (editor && monacoIns) {
      editorRef.current = editor;
      monacoRef.current = monacoIns;
      debugLog(' ## editorRef.current',editorRef.current);
    } else {
      console.error(' ## editor or monacoInstance is not defined');
    }
    // 在这里可以执行额外的设置或操作
  }, []);

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
    automaticLayout: true,
    readOnly: true,
    // 其他选项...
  };
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
    <div ref={editableRef} className="aceEditor-box w-full bg-gray-200 DesignerPanle-DDLPanel">
      <MonacoEditor
        width="100%"
        height="100%"
        theme={ theme === 'dark' ? 'vs-dark' : 'vs'}  
        language="sql"
        options={editorOptions}
        value={value} // 使用状态作为编辑器的值
        editorDidMount={editorDidMountHandle}
      />
    </div>
  );
}

export default DDLPanel;
