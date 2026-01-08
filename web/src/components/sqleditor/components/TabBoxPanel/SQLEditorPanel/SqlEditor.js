import { message } from 'antd';
import { debounce } from 'lodash';
import * as monaco from "monaco-editor";
import React, { useCallback, useContext, useEffect, useRef, useState } from "react";
import MonacoEditor from 'react-monaco-editor';
import aiApi from '../../../../../api/worker/ai';
import { debugLog } from '../../../../../common/logger';
import { VisibilityContext } from '../../../components/Utils/visibilityProvider';

function SqlEditor({ currentTab, setValue, value, sqlEditorHeight, sqlEditorWidth }) {
  const [autoCompleteEnabled, setAutoCompleteEnabled] = useState(true);
  const { tabs,
    tabIndex,
    getTabByID,
    getDist,
    setTabSQL,
    setTabSelectSql,
    setAskAi,
    setOperationLabel,
  } = useContext(VisibilityContext);
  // MySQL 关键字列表
  const [keywords, setKeywords] = useState(getDist('keywords'));


  const editableRef = React.createRef();
  useEffect(() => {
    if (editableRef.current) {
      // editableRef.current.style.width = '100%'; // 或其他需要的宽度
      editableRef.current.style.height = `${sqlEditorHeight}px`;
      // editableRef.current.style.width = `${sqlEditorWidth}px`;
      // debugLog(' ## sqlEditorWidth == ',  sqlEditorWidth);
    }
  }, [sqlEditorHeight, sqlEditorWidth]);

  // 缓存输入内容
  const [sqlValue, setSqlValue] = useState(getTabByID(tabIndex)?.sql);
  useEffect(() => {
    // debugLog(" getTabByID(tabIndex)?.sql ")
    setSqlValue(getTabByID(tabIndex)?.sql);
  }, [tabs, tabIndex]);

  useEffect(() => {
    // 更新到tab对象中保存 防止死循环更新
    if (sqlValue !== getTabByID(tabIndex)?.sql) {
      setTabSQL(sqlValue);
    }
    // debugLog(" ## sqlValue ", sqlValue);
  }, [sqlValue]);



  const customKeywords = ["SET", "customKeyword2", "customKeyword3"];

  const setCustomHighlightRules = (editor) => {
    const customHighlightRules = function () {
      this.$rules = {
        start: [
          {
            token: "custom.keyword",
            regex: "\\b(" + customKeywords.join("|") + ")\\b",
          },
        ],
      };
    };

    const Mode = require("ace-builds/src-noconflict/mode-text").Mode;
    // (function() {
    //     this.HighlightRules = customHighlightRules;
    // }).call(Mode.prototype);
    const customMode = function () {
      this.HighlightRules = customHighlightRules;
    };
    customMode.prototype = new Mode();
    editor.getSession().setMode(new Mode());

    // editor.getSession().setMode(new (require("ace-builds/src-noconflict/mode-text").Mode)());

    // editor.getSession().setMode(new (require("ace-builds/src-min-noconflict/mode-mysql").Mode)());
  };

  // 编辑器实例引用
  const editorRef = useRef(null);
  // Monaco API 引用
  const monacoRef = useRef(null);

  const monacoProviderRef = useRef(null); // To track the registered provider

  const registerCompletionProvider = (id, monacoIns) => {
    const providerId = `sql-completion-provider-${id}`;
    const existingProviders = monacoIns.languages.getLanguages().find(lang => lang.id === 'sql').extensions;
    debugLog(` ######providerId : `, providerId);
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
          // debugLog(` keywords : `,keywords);
          const suggestionItems = keywords.map(keyword => ({
            label: keyword,
            kind: monacoIns.languages.CompletionItemKind.Keyword,
            insertText: keyword,
            range: range,
            detail: `MySQL Keyword ${keyword}`,
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
    const providerId = `sql-completion-provider-${id}`;
    const providers = monacoIns.languages.getLanguages().find(lang => lang.id === 'sql').extensions;
    const provider = providers.find(provider => provider.id === providerId);

    if (provider) {
      monacoIns.languages.unregisterCompletionItemProvider('sql', provider.id);
      debugLog(`Unregistered completion provider for ID: ${providerId}`);
    } else {
      debugLog(`No completion provider found for ID: ${providerId}`);
    }
  };

  const updateSqlValue = debounce((newValue) => {
    setSqlValue(newValue);
  }, 300);

  const askAI = (editor, monaco) => {
    const selection = editor.getSelection();
    const selectedText = editor.getModel().getValueInRange(selection);
    if (selectedText.length === 0) {
      message.warning("没有选中任何信息")
      return
    }
    setOperationLabel("调用AI中...")
    aiApi.ask({ type: "deepseek", prompt: selectedText }).then((response) => {
      // 在选中文本的末尾插入新行和 AI 返回的内容
      const newText = `\n${response}`;

      // 计算插入的位置（选中文本的末尾）
      const insertPosition = selection.getEndPosition();

      // 创建一个新的范围，表示插入的位置
      const insertRange = new monaco.Range(
        insertPosition.lineNumber,
        insertPosition.column,
        insertPosition.lineNumber,
        insertPosition.column
      );

      // 执行编辑操作，插入新内容
      editor.executeEdits('', [
        {
          range: insertRange, // 插入的范围
          text: newText,     // 插入的文本
        },
      ]);

      // 将光标移动到插入内容的末尾
      const newPosition = insertPosition.delta(0, newText.length);
      editor.setPosition(newPosition);
      editor.focus();
      setOperationLabel("AI已回复内容...")
    });
  }

  // 获取编辑器实例的回调函数
  const editorDidMountHandle = useCallback((editor, monacoIns) => {
    // debugLog(" ## editorDidMountHandle ");
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
      const newValue = editor.getValue();
      // debugLog(' ## Editor content changed:', newValue);
      // setSqlValue(editor.getValue())
      updateSqlValue(newValue);

      // setOperationLabel("输入内容...")
      
    });

    // Register a new provider and store the reference
    registerCompletionProvider(tabIndex, monacoIns);


    // 监听快捷键或特定注释
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter, () => {
      askAI(editor, monaco)
    });

    editor.onDidFocusEditorText(() => {

      setTimeout(() => {
        setOperationLabel("获取焦点");
      }, 0);
    });

    editor.onDidBlurEditorText(() => {
      setTimeout(() => {
        setOperationLabel("");
      }, 0);
    });

    // 监听选择变化
    editor.onDidChangeCursorSelection((event) => {
      const { selection } = event;
      // console.log('User selection changed:', selection);
      // const selection = editor.getSelection();
      const selectedText = editor.getModel().getValueInRange(selection);
      if (selectedText.length > 0) {
        // console.log(" selectedText ", selectedText)
        setTabSelectSql(selectedText)
        setOperationLabel("选择" + selectedText.length + "字符")
      }

    });

    // 通过代码设置选择范围（不会被触发）
    // const selection = {
    //   startLineNumber: 1,
    //   startColumn: 1,
    //   endLineNumber: 1,
    //   endColumn: 5,
    // };
    // editor.setSelection(selection);
    editor.focus();



    // 清理函数，当组件卸载时注销提示项提供者
    return () => {
      unregisterCompletionProvider(tabIndex, monacoIns);
    };
    // 在这里可以执行额外的设置或操作
  }, [tabIndex]);

  useEffect(() => {

    // debugLog(" ## currentTab ",currentTab);
    // debugLog(" ## getTabByID(tabIndex) ",getTabByID(tabIndex));
    // 销毁
    monacoProviderRef.current?.dispose();
    if (currentTab.id === getTabByID(tabIndex).id) {
      registerCompletionProvider(tabIndex, monacoRef.current);
    }
    // 清理函数：Tab 变化时销毁旧的提供者
    return () => {
      monacoProviderRef.current?.dispose();
    };
  }, [tabIndex]);

  useEffect(() => {
    if (getTabByID(tabIndex)?.askAi == true) {
      askAI(editorRef.current, monacoRef.current);
      setAskAi(false)
    }
  }, [tabs, tabIndex]);
  const addSuggestion = (label, insertText) => {
    setSuggestions(prevSuggestions => [
      ...prevSuggestions,
      { label, kind: monaco.languages.CompletionItemKind.Keyword, insertText }
    ]);
  };

  // addSuggestion('WHERE','WHERE');
  // addSuggestion('ORDER BY ','ORDER BY ');
  const editorOptions = {
    // 不显示迷你地图
    minimap: {
      enabled: false
    },
    // 启用SQL语法高亮和关键字提示
    language: 'sql',
    autoClosingBrackets: 'always',
    quickSuggestions: autoCompleteEnabled,
    suggestOnTriggerCharacters: autoCompleteEnabled,
    // 启用自动完成功能
    autoClosingBrackets: true,
    autoClosingQuotes: true,
    automaticLayout: true,
    readOnly: false,
    // 针对移动端的额外配置
    mouseWheelZoom: true,       // 允许手势缩放
    folding: false,             // 简化移动端显示
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
    <div ref={editableRef} className="aceEditor-box w-full SQLEditorPanl-SqlEditor">
      <MonacoEditor
        width="100%"
        height="100%"
        theme={theme === 'dark' ? 'vs-dark' : 'vs'}
        language="sql"
        options={editorOptions}
        value={sqlValue} // 使用状态作为编辑器的值 getTabByID(tabIndex)?.sql
        editorDidMount={editorDidMountHandle}
      />
    </div>
  );
}

export default SqlEditor;
