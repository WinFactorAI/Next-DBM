import * as monaco from 'monaco-editor';
import React, { useContext, useEffect, useRef } from 'react';
import { debugLog } from "../../../../../common/logger";
import { VisibilityContext } from '../../Utils/visibilityProvider';
// 定义你的原始代码和修改后的代码
// const originalCode = getTabByID(tabIndex).originalSql; // 获取原始SQL
// const modifiedCode = getTabByID(tabIndex).sql; // 获取修改后的SQL
// { listHeight ,original, modified }
function DiffEditor(props) {
  const {tabs,tabIndex} = useContext(VisibilityContext);

  const containerRef = useRef(null);
  const editorRef = useRef(null);
  

  useEffect(() => {
    const defineTheme = () => {
      monaco.editor.defineTheme('high-contrast', {
        base: 'vs-dark',
        inherit: true,
        rules: [
          { token: '', foreground: 'ffffff', background: '000000' },
          { token: 'comment', foreground: '888888' },
          { token: 'keyword', foreground: 'ff0000' },
          { token: 'number', foreground: '00ff00' },
          { token: 'string', foreground: '00ffff' },
        ],
        colors: {
          'editor.background': '#000000',
          'editor.foreground': '#ffffff',
          'editorCursor.foreground': '#ffffff',
          'editor.lineHighlightBackground': '#333333',
          'editorLineNumber.foreground': '#888888',
          'editor.selectionBackground': '#555555',
          'editor.inactiveSelectionBackground': '#333333',
        },
      });
    };

    // defineTheme();

    if (containerRef.current) {
      editorRef.current = monaco.editor.createDiffEditor(containerRef.current, {
        // theme: 'high-contrast',
        // theme: localStorage.getItem('theme') === 'dark' ? '' : 'high-contrast',
        originalEditable: true,
        automaticLayout: true,
        renderSideBySide: true,
        renderIndicators: true,
        autoCloseBrackets: true,
      });

      debugLog(' ### props.tabItem', props.tabItem);
      const originalModel = monaco.editor.createModel( props.tabItem.srcObj, 'sql');
      const modifiedModel = monaco.editor.createModel( props.tabItem.distObj, 'sql');

      editorRef.current.setModel({
        original: originalModel,
        modified: modifiedModel,
      });
    }

    return () => {
      if (editorRef.current) {
        editorRef.current.dispose();
      }
      // 清除主题
      // monaco.editor.setTheme('vs-dark'); // 恢复默认主题
    };
  }, [tabs,tabIndex]);

  const editableRef = React.createRef();  
  useEffect(() => {
    if (editableRef.current) {  
      editableRef.current.style.height = `${props.listHeight}px`;
    }
    if (containerRef.current) {  
      containerRef.current.style.height = `${props.listHeight}px`;
    }
  }, [props.listHeight]);

  return  (
          <div ref={editableRef} className="aceEditor-box w-full bg-gray-200 SQLDiffEditorPanel-DiffEditorPanel">
            <div ref={containerRef} style={{ height: '100%', width: '100%' }} />
          </div>
      )     
}

export default DiffEditor;