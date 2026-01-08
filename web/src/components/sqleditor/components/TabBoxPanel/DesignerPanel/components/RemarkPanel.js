import React, { useCallback, useContext, useEffect, useState } from "react";
import MonacoEditor from 'react-monaco-editor';
import { debugLog } from "../../../../../../common/logger";
import { VisibilityContext } from '../../../../components/Utils/visibilityProvider';
function RemarkPanel({ setValue, value, currentHeight }) {
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

  // 获取编辑器实例的回调函数
  const editorDidMountHandle = useCallback((editor, monacoIns) => {
    debugLog(" ## editorDidMountHandle ");
    if (!editor || !monacoIns) {
      console.error(' ## editor or monacoInstance is not defined');
      return;
    }
    // 监听编辑器内容变化
    editor.onDidChangeModelContent((event) => {
      const newValue = editor.getValue();
      setValue(newValue)
    });

    // 清理函数，当组件卸载时注销提示项提供者
    return () => {
      // debugLog(' ## editorWillUnmount');
    };
    // 在这里可以执行额外的设置或操作
  }, [tabIndex]);

  useEffect(() => {
    // debugLog(" ## RemarkPanel unmount");
  }, [tabIndex]);

  const editorOptions = {
    // 不显示迷你地图
    minimap: {
      enabled: false
    },
    // 启用SQL语法高亮和关键字提示
    language: 'text',
    autoClosingBrackets: 'always',
    quickSuggestions: true,
    suggestOnTriggerCharacters: true,
    autoClosingQuotes: true,
    automaticLayout: true,
    readOnly: false,
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
    <div ref={editableRef} className="aceEditor-box w-full bg-gray-200 DesignerPanel-RemarkPanel">
      <MonacoEditor
        width="100%"
        height="100%"
        theme={ theme === 'dark' ? 'vs-dark' : 'vs'}  
        language="text"
        options={editorOptions}
        editorDidMount={editorDidMountHandle}
      />
    </div>
  );
}

export default RemarkPanel;
