import * as monaco from 'monaco-editor';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import MonacoEditor from 'react-monaco-editor';
import { debugLog } from "../../../common/logger";
import * as dists from '../../sqleditor/components/Utils/dicts/mysql.js';
const SqlsEditer = ({ id, sql, height, onChange }) => {
    const editableRef = React.createRef();
    const [value, setValue] = useState(sql || '');
    const [autoCompleteEnabled, setAutoCompleteEnabled] = useState(true);
    const [keywords, setKeywords] = useState(dists.keywords);
    // 编辑器实例引用
    const editorRef = useRef(null);
    // Monaco API 引用
    const monacoRef = useRef(null);
    const monacoProviderRef = useRef(null); // To track the registered provider

    // 注册 SQL 语言（如果未注册）
    const initSql = () => {
        if (!monaco.languages.getLanguages().some(lang => lang.id === 'sql')) {
            monaco.languages.register({ id: 'sql' });
            monaco.languages.setMonarchTokensProvider('sql', {
                tokenizer: {
                    root: [
                        [/\b(SELECT|INSERT|UPDATE|DELETE|FROM|WHERE|AND|OR|NOT|NULL|VALUES|INTO|CREATE|TABLE|DROP|ALTER|JOIN|ON|AS|IN|BY|GROUP|ORDER|LIMIT)\b/i, 'keyword'],
                        [/\b(TRUE|FALSE)\b/i, 'boolean'],
                        [/\b([0-9]+)\b/, 'number'],
                        [/'.*?'/, 'string'],
                        [/".*?"/, 'string'],
                        [/--+.*/, 'comment'],
                        [/\/\*.*\*\//, 'comment']
                    ]
                }
            });
        }
    }
    const registerCompletionProvider = (id, monacoIns) => {
        initSql();
        const providerId = `sql-completion-provider-${id}`;
        try {
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
        } catch (error) {
            console.error('Failed to register completion provider:', error);
        }
    };

    const unregisterCompletionProvider = (id, monacoIns) => {
        // 清理提供者引用
        if (monacoProviderRef.current) {
            // 注意：Monaco API 不提供直接注销提供者的方法
            // 我们只需清理引用即可
            monacoProviderRef.current = null;
            debugLog('Unregistered completion provider');
        }
    };
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
            // updateSqlValue(newValue);
            // setContentSql(newValue)
        });

        // Register a new provider and store the reference
        registerCompletionProvider(id, monacoIns);


        // 监听快捷键或特定注释
        // editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter, () => {
        //     askAI(editor, monaco)
        // });


        // 监听选择变化
        editor.onDidChangeCursorSelection((event) => {
            const { selection } = event;
            // console.log('User selection changed:', selection);
            // const selection = editor.getSelection();
            const selectedText = editor.getModel().getValueInRange(selection);
            if (selectedText.length > 0) {
                // console.log(" selectedText ", selectedText)
                // setTabSelectSql(selectedText)
                // setContentSql(selectedText)
            }
        });

        // 清理函数，当组件卸载时注销提示项提供者
        return () => {
            unregisterCompletionProvider(id, monacoIns);
        };
    }, [id]);


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
    useEffect(() => {
        setValue(sql || '');
    }, [sql]);

    const [width, setWidth] = useState('60%');

    // 动态更新宽度
    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth <= 768) { // 判断屏幕宽度
                setWidth('100%');
            } else {
                setWidth('60%');
            }
        };

        window.addEventListener('resize', handleResize);
        handleResize(); // 初始时执行一次

        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, []);

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
        <div ref={editableRef} className="sqlEditerView-box w-full">
            <MonacoEditor
                width="100%"
                height={height || 400}
                theme={theme === 'dark' ? 'vs-dark' : 'vs'}
                language="sql"
                options={editorOptions}
                value={value} // 使用状态作为编辑器的值
                editorDidMount={editorDidMountHandle}
                onChange={(newValue) => {
                    setValue(newValue);
                    onChange?.(newValue); // ✅ 通知父组件更新 form
                }}
            />
        </div>
    )
};

export default SqlsEditer;
