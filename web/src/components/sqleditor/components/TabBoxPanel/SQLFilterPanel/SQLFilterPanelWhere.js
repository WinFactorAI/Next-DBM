import { useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import MonacoEditor from 'react-monaco-editor';
import { v4 as uuid } from 'uuid';
import { debugLog } from "../../../../../common/logger";
import { VisibilityContext } from '../../Utils/visibilityProvider';
// const isWhere = true
// const customKeywords = ['MY_KEYWORD_1', 'MY_KEYWORD_2', 'MY_FUNCTION', 'MY_TABLE', 'MY_COLUMN'];

// monaco.languages.registerCompletionItemProvider('sql', {
//   provideCompletionItems: (model, position) => {
//     // 获取当前位置的上下文
//     const lineContent = model.getLineContent(position.lineNumber);
//     const wordUntilPosition = model.getWordUntilPosition(position);
//     if(!isWhere){
//       return null;
//     }
//     // 过滤与当前位置上下文相关的关键字
//     const filteredKeywords = customKeywords.filter(keyword => {
//       return !wordUntilPosition.word.includes(keyword);
//     });

//     // 创建代码完成项
//     const suggestions = filteredKeywords.map(keyword => ({
//       label: keyword,
//       kind: monaco.languages.CompletionItemKind.Keyword,
//       insertText: keyword,
//       documentation: `自定义关键字: ${keyword}`
//     }));

//     return {
//       suggestions
//     };
//   }
// });
function SQLFilterPanelWhere({ currentTab }) {
  const { tabs,
    tabIndex,
    setTabWhere,
    getTabByID,
    getDist,
    setOperationLabel
  } = useContext(VisibilityContext);
  const [keywords, setKeywords] = useState(getDist('mysql-where-keywords'));
  const editorId = useMemo(() => {
    return uuid();
  }, []);

  // 缓存输入内容
  const [sqlValue, setSqlValue] = useState("");
  useEffect(() => {
    setSqlValue(getTabByID(tabIndex)?.where);
  }, [tabs, tabIndex]);

  useEffect(() => {
    // 更新到tab对象中保存
    setTabWhere(sqlValue);
  }, [sqlValue]);

  // 编辑器实例引用
  const editorRef = useRef(null);
  // Monaco API 引用
  const monacoRef = useRef(null);

  const monacoProviderRef = useRef(null); // To track the registered provider

  const registerCompletionProvider = (id, monacoIns) => {
    const providerId = `sql-where-completion-provider-${id}`;
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
            detail: `MySQL Keyword where ${keyword}`,
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
    const providerId = `sql-where-completion-provider-${id}`;
    const providers = monacoIns.languages.getLanguages().find(lang => lang.id === 'sql').extensions;
    const provider = providers.find(provider => provider.id === providerId);

    if (provider) {
      monacoIns.languages.unregisterCompletionItemProvider('sql', provider.id);
      debugLog(`Unregistered completion provider for ID: ${providerId}`);
    } else {
      debugLog(`No completion provider found for ID: ${providerId}`);
    }
  };

  const handleCursorSelectionChange = (event) => {
    // 处理光标焦点变化事件
    debugLog('Cursor selection changed:', event);
    // if(currentTab.id  === getTabByID(tabIndex).id){
    //   registerCompletionProvider(tabIndex,monacoRef.current);
    // }
  };

  const handleBlurEvent = () => {
    // 处理失去焦点事件
    debugLog('Editor lost focus handleBlurEvent');
    // monacoProviderRef.current?.dispose();
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
      // debugLog('Editor content changed:', event);
      // const newValue = editor.getValue();
      setSqlValue(editor.getValue())

    });
    editor.onDidFocusEditorText(() => {
      setOperationLabel("WHERE 获取焦点")
    });

    editor.onDidBlurEditorText(() => {
      setOperationLabel("")
    });
    // 注册光标焦点变化事件
    editor.onDidChangeCursorSelection((event) => {
      debugLog('Cursor selection changed:', event);
      setOperationLabel("输入WHERE 内容...")
    });
    // 监听获得焦点事件
    editor.onDidFocusEditorWidget(() => {
      debugLog('1 Editor gained focus onDidFocusEditorWidget');
      if (editorRef.current?.onDidChangeModelContentListener) {
        editorRef.current.onDidChangeModelContentListener.dispose();
      }
      registerCompletionProvider(tabIndex, monacoIns);
    });
    // 注册失去焦点事件
    editor.onDidBlurEditorWidget(() => {
      debugLog('1 Editor lost focus onDidBlurEditorWidget');

      if (editorRef.current?.onDidChangeModelContentListener) {
        editorRef.current.onDidChangeModelContentListener.dispose();
      }
      unregisterCompletionProvider(tabIndex, monacoIns);
      monacoProviderRef.current?.dispose();
    });
    // registerCompletionProvider(tabIndex,monacoIns);
    // 清理函数，当组件卸载时移除事件监听器
    return () => {
      // editor.removeEventListener('cursorSelectionChanged', handleCursorSelectionChange);
      // editor.removeEventListener('blur', handleBlurEvent);
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
        theme={theme === 'dark' ? 'vs-dark' : 'vs'}
        language="sql"
        value={sqlValue}
        editorDidMount={editorDidMountHandle}
      />
    </div>
  );
}

export default SQLFilterPanelWhere;
