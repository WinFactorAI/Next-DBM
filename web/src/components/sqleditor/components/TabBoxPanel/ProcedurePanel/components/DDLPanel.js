import * as monaco from "monaco-editor";
import React, { useCallback, useContext, useEffect, useRef, useState } from "react";
import MonacoEditor from 'react-monaco-editor';
import { VisibilityContext } from '../../../../components/Utils/visibilityProvider';
// import RSOCMode from "./Mode/RSOCMode";
  
// 假设这是你的自定义提示列表
const customSuggestions = [
  { label: 'SELECT', kind: monaco.languages.CompletionItemKind.Keyword },
  { label: 'FROM', kind: monaco.languages.CompletionItemKind.Keyword },
  // ...其他自定义提示
];

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

  // 获取编辑器实例的回调函数
  const editorDidMountHandle = useCallback((editor, monacoIns) => {
    if (editor && monacoIns) {
      // editorRef.current = editor;
      // monacoRef.current = monacoIns;
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
    quickSuggestions: {
      strings: true,
      other: true,
      comments: false
    },
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
    <div ref={editableRef} className="aceEditor-box w-full bg-gray-200 ProductPanel-DDLPanel">
      <MonacoEditor
        width="100%"
        height="100%"
        theme={ theme === 'dark' ? 'vs-dark' : 'vs'}  
        language="sql"
        options={editorOptions}
        value={value} // 使用状态作为编辑器的值
        onChange={editorDidMount => {
          setValue(editorDidMount)
        }}
        editorDidMount={editorDidMountHandle}
      />
    </div>
  );
}

export default DDLPanel;
