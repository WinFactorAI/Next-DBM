import { useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import MonacoEditor from 'react-monaco-editor';
import { v4 as uuid } from 'uuid';
import { debugLog } from "../../../../../common/logger";
import { VisibilityContext } from '../../Utils/visibilityProvider';

// const isOrderBy = true
// const customOrderByKeywords = ['ASC', 'DESC', 'NULLS FIRST', 'NULLS LAST'];

// monaco.languages.registerCompletionItemProvider('sql', {
//   provideCompletionItems: (model, position) => {
//     // 检查当前是否处于 ORDER BY 子句中
//     const lineContent = model.getLineContent(position.lineNumber);
//     if(!isOrderBy){
//       return null;
//     }
//     // if (!lineContent.includes('ORDER BY')) {
//     //   return null; // 如果不在 ORDER BY 子句中，则不提供任何建议
//     // }

//     // 创建代码完成项
//     const suggestions = customOrderByKeywords.map(keyword => ({
//       label: keyword,
//       kind: monaco.languages.CompletionItemKind.Keyword,
//       insertText: keyword,
//       documentation: `ORDER BY 关键字: ${keyword}`
//     }));

//     return {
//       suggestions
//     };
//   }
// });
function SQLFilterPanelOrderBy({ currentTab }) {
  const { tabs, 
    tabIndex, 
    getTabByID, 
    getDist, 
    setTabOrderBy,
    setOperationLabel
  } = useContext(VisibilityContext);
  const [keywords, setKeywords] = useState(getDist('mysql-orderby-keywords'));
  const editorId = useMemo(() => {
    return uuid();
  }, []);

  // 缓存输入内容
  const [sqlValue, setSqlValue] = useState("");
  useEffect(() => {
    setSqlValue(getTabByID(tabIndex)?.orderBy);
  }, [tabs, tabIndex]);

  useEffect(() => {
    // 更新到tab对象中保存
    setTabOrderBy(sqlValue);
  }, [sqlValue]);

  // 编辑器实例引用
  const editorRef = useRef(null);
  // Monaco API 引用
  const monacoRef = useRef(null);

  const monacoProviderRef = useRef(null); // To track the registered provider

  const registerCompletionProvider = (id, monacoIns) => {
    const providerId = `sql-orderby-completion-provider-${id}`;
    const existingProviders = monacoIns.languages.getLanguages().find(lang => lang.id === 'sql').extensions;

    // 检查是否已经注册过该提供者
    if (!existingProviders.some(provider => provider.id === providerId)) {
      monacoProviderRef.current = monacoIns.languages.registerCompletionItemProvider('sql', {
        id: providerId,
        provideCompletionItems: (model, position) => {
          const word = model.getWordUntilPosition(position);
          const range = new monacoIns.Range(
            position.lineNumber,
            word.startColumn,
            position.lineNumber,
            word.endColumn
          );

          const suggestionItems = keywords.map(keyword => ({
            label: keyword,
            kind: monacoIns.languages.CompletionItemKind.Keyword,
            insertText: keyword,
            range: range,
            detail: `MySQL Keyword order by ${keyword}`,
            documentation: `MySQL Keyword: ${keyword}`
          }));

          return { suggestions: suggestionItems };
        }
      });

      debugLog(`Registered completion provider for ID: ${providerId}`);
    } else {
      debugLog(`Completion provider already registered for ID: ${providerId}`);
    }
  };

  const unregisterCompletionProvider = (id, monacoIns) => {
    const providerId = `sql-orderby-completion-provider-${id}`;
    const providers = monacoIns.languages.getLanguages().find(lang => lang.id === 'sql').extensions;
    const provider = providers.find(provider => provider.id === providerId);

    if (provider) {
      monacoIns.languages.unregisterCompletionItemProvider('sql', provider.id);
      debugLog(`Unregistered completion provider for ID: ${providerId}`);
    } else {
      debugLog(`No completion provider found for ID: ${providerId}`);
    }
  };
  // 获取编辑器实例的回调函数
  const editorDidMountHandle = useCallback((editor, monacoIns) => {
    if (!editor || !monacoIns) {
      console.error(' ## editor or monacoInstance is not defined');
      return;
    }
    editorRef.current = editor;
    monacoRef.current = monacoIns;
    // 清理旧的内容变化监听器
    if (editorRef.current?.onDidChangeModelContentListener) {
      editorRef.current.onDidChangeModelContentListener.dispose();
    }
   
    // 监听编辑器内容变化
    editor.onDidChangeModelContent((event) => {
      setSqlValue(editor.getValue())
    });

    editor.onDidFocusEditorText(() => {
      setOperationLabel("ORDER BY 获取焦点")
    });

    editor.onDidBlurEditorText(() => {
      setOperationLabel("")
    });
    // 注册光标焦点变化事件
     editor.onDidChangeCursorSelection((event) => {
      debugLog('Cursor selection changed:', event);
      setOperationLabel("输入ORDER BY 内容...")
    });
    // 监听获得焦点事件
    editor.onDidFocusEditorWidget(() => {
      debugLog('2 Editor gained focus onDidFocusEditorWidget');
      if (editorRef.current?.onDidChangeModelContentListener) {
        editorRef.current.onDidChangeModelContentListener.dispose();
      }
      registerCompletionProvider(tabIndex, monacoIns);
    });
    // 注册失去焦点事件
    editor.onDidBlurEditorWidget(() => {
      debugLog('2 Editor lost focus onDidBlurEditorWidget');

      if (editorRef.current?.onDidChangeModelContentListener) {
        editorRef.current.onDidChangeModelContentListener.dispose();
      }
      unregisterCompletionProvider(tabIndex, monacoIns);
      monacoProviderRef.current?.dispose();
    });
    // Register a new provider and store the reference
    // registerCompletionProvider(tabIndex, monacoIns);

    // 清理函数，当组件卸载时注销提示项提供者
    return () => {
      unregisterCompletionProvider(tabIndex, monacoIns);
    };
    // 在这里可以执行额外的设置或操作
  }, [tabIndex]);


  useEffect(() => {
    // monacoProviderRef.current?.dispose();
    // if (currentTab.id === getTabByID(tabIndex).id) {
    //   registerCompletionProvider(tabIndex, monacoRef.current);
    // } 
    // 清理函数：Tab 变化时销毁旧的提供者
    return () => {
      monacoProviderRef.current?.dispose();
    };
  }, [tabIndex]);

  const options = {
    lineNumbers: false,
    renderLineHighlight: 'none',
    scrollBeyondLastLine: false,
    wordWrap: 'off',
    minimap: {
      enabled: false,
    },
    // 不显示滚动条
    scrollbar: {
      vertical: 'hidden',
      horizontal: 'hidden',
    },
    overviewRulerBorder: false,
    glyphMargin: false,
    folding: false,
    lineDecorationsWidth: 0, // 行号宽度
    lineNumbersMinChars: 0, // 行号最小宽度
    automaticLayout: true,
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
    <div className="singleFileMonacoEditor">
      <MonacoEditor
        options={options}
        theme={ theme === 'dark' ? 'vs-dark' : 'vs'}  
        language="sql"
        value={sqlValue}
        editorDidMount={editorDidMountHandle}
      />
    </div>
  );
}

export default SQLFilterPanelOrderBy;
