import { CloseOutlined } from '@ant-design/icons';
import { Anchor, Avatar, Button, Col, Collapse, Drawer, Form, Input, List, Row, Space } from "antd";
import i18next from 'i18next';
import * as monaco from 'monaco-editor';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import MonacoEditor from 'react-monaco-editor';
import buildLogApi from "../../api/build-log";
import { debugLog } from '../../common/logger';
import { abortedSvg } from "./components/status/aborted";
import { abortedProgressSvg } from "./components/status/aborted-progress";
import { builtSvg } from "./components/status/built";
import { builtProgressSvg } from "./components/status/built-progress";
import { disabledSvg } from "./components/status/disabled";
import { disabledProgressSvg } from "./components/status/disabled-progress";
import { failedSvg } from "./components/status/failed";
import { failedProgressSvg } from "./components/status/failed-progress";
import { failuresSvg } from "./components/status/failures";
import { failuresProgressSvg } from "./components/status/failures-progress";
import { startSvg } from "./components/status/start";
import { stopSvg } from "./components/status/stop";
import { successSvg } from "./components/status/success";
import { successProgressSvg } from "./components/status/success-progress";

const { Panel } = Collapse;
const { Search } = Input;
const { Link } = Anchor;
const api = buildLogApi;
const { TextArea } = Input;
const BuildLogsDrawer = ({
    visible,
    handleOk,
    handleCancel,
    confirmLoading,
    id,
    worker
}) => {
    const [form] = Form.useForm();
    // const [userSelected, setUserSelected] = useState(null);
    const getBuildPanelSize = (defSize, index) => {
        const splitBuildPanelPos = localStorage.getItem('splitBuildHistoryPanelPos')
        if (splitBuildPanelPos) {
            return splitBuildPanelPos.split(',')[index];
        } else {
            return defSize
        }
    }
    const [leftPanelSize, setLeftPanelSize] = useState(getBuildPanelSize('20%', 0))
    const [rightPanelSize, setRightPanelSize] = useState(getBuildPanelSize('90%', 1))

    const percentToPx = (percent, baseSize) => {
        return (baseSize * parseFloat(percent)) / 100;
    }

    const change = (size) => {
        localStorage.setItem('splitBuildHistoryPanelPos', size);

        const WWidth = window.innerWidth;
        const firstPaneWidth = percentToPx(size[0], WWidth);
        const threadPaneWidth = percentToPx(size[2], WWidth);
        setLeftPanelSize(firstPaneWidth);
        setRightPanelSize(threadPaneWidth)
    }

    const formItemLayout = {
        labelCol: { span: 6 },
        wrapperCol: { span: 14 },
    };

    const [queryProcessData, setQueryProcessData] = useState([])
    const queryProcessDataRef = useRef([]);
    const getLogList = async () => {
        let queryParamsLog = {
            pageIndex: 1,
            pageSize: 100,
            buildId: id
        }
        try {
            const res = await buildLogApi.getPaging(queryParamsLog);
            debugLog("res", res.items);
            setQueryProcessData(res.items || []); // 确保数据更新
            queryProcessDataRef.current = res.items || []; // 同步更新到 ref
        } catch (error) {
            debugLog("Error fetching log list:", error);
        }
    }
    const selectedItemRef = useRef(null);
    const timerRef = useRef(null); // 用于存储定时器 ID
    useEffect(() => {
        selectedItemRef.current = null;
        setQueryProcessData([])
        setSelectedItem(null);
        setLogDetail('');
        getLogList();
        if (visible) {
            // 设置定时器
            timerRef.current = setInterval(() => {

                getLogList();
                debugLog('定时器执行 selectedItemRef.current ', selectedItemRef.current);
                if (selectedItemRef.current) {
                    getLogDetail();
                }
                else if (queryProcessDataRef.current && queryProcessDataRef.current.length > 0) {
                    debugLog('定时器执行 queryProcessDataRef.current', queryProcessDataRef.current);
                    const firstItemId = queryProcessDataRef.current[0].id;
                    setSelectedItem(firstItemId);
                    selectedItemRef.current = firstItemId; // 更新引用
                }
            }, 1000);
        } else {
            // 清除定时器
            if (timerRef.current) {
                clearInterval(timerRef.current);
                timerRef.current = null;
            }
        }

        // 在组件卸载时清除定时器
        return () => {
            if (timerRef.current) {
                clearInterval(timerRef.current);
                timerRef.current = null;
            }

        };
    }, [visible]);

    const iconType = (type) => {
        switch (type) {
            case 'startSvg':
                return startSvg();

            case 'successSvg':
                return successSvg();
            case 'successProgressSvg':
                return successProgressSvg();

            case 'failuresSvg':
                return failuresSvg();

            case 'failuresProgressSvg':
                return failuresProgressSvg();

            case 'failedSvg':
                return failedSvg();
            case 'failedProgressSvg':
                return failedProgressSvg();

            case 'builtSvg':
                return builtSvg();
            case 'builtProgressSvg':
                return builtProgressSvg();

            case 'disabledSvg':
                return disabledSvg();
            case 'disabledProgressSvg':
                return disabledProgressSvg();

            case 'abortedSvg':
                return abortedSvg();
            case 'abortedProgressSvg':
                return abortedProgressSvg();

            case 'stopSvg':
                return stopSvg();
            default:
                return successProgressSvg();
        }
    }

    const [searchText, setSearchText] = useState('');

    // 过滤后的数据
    const filteredData = useMemo(() => {
        if (!searchText) return queryProcessData;
        return queryProcessData.filter(item =>
            Object.values(item).some(value =>
                String(value).toLowerCase().includes(searchText.toLowerCase())
            )
        );
    }, [queryProcessData, searchText]);

    const onSearch = (value) => {
        setSearchText(value);
        console.log('搜索内容:', value);
    };

    useEffect(() => {
        const element = document.getElementById('logviewRef');
        if (element) {
            debugLog(" window.innerHeight ", window.innerHeight);
            element.style.height = `${window.innerHeight - 42}px`;
        }
    }, []);

    const [sqlValue, setSqlValue] = useState("");
    // useEffect(() => {
    //   setSqlValue(getTabByID(tabIndex).sql);
    // },[tabs,tabIndex]);
    const [keywords, setKeywords] = useState(['ERROR', 'ERR', 'FATAL', 'WARN', 'WARNING', 'INFO', 'DEBUG', 'TRACE']);
    // 编辑器实例引用
    const editorRef = useRef(null);
    // Monaco API 引用
    const monacoRef = useRef(null);
    const monacoProviderRef = useRef(null); // To track the registered provider

    // 注册 高亮显示 语言（如果未注册）
    const initHighlight = () => {
        if (!monaco.languages.getLanguages().some(lang => lang.id === 'log')) {
            monaco.languages.register({ id: 'log' });
            monaco.languages.setMonarchTokensProvider('log', {
                tokenizer: {
                    root: [
                        // 匹配 `数据库`.`表`
                        [/`[a-zA-Z0-9_]+`\.`[a-zA-Z0-9_]+`/, 'dbTable'],
                        // 匹配「test-#1」这种动态标识
                        [/[「][a-zA-Z0-9_-]+-#\d+[」]/, 'dynamicId'],
                        // 匹配时间戳 [2025-10-02 08:23:00.013360]
                        [/\[\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}(?:\.\d+)?\]/, 'timestamp'],

                        // 匹配日志级别
                        [/\[(ERROR|ERR|FATAL)\]/, 'error'],
                        [/\[(WARN|WARNING)\]/, 'warning'],
                        [/\[(INFO)\]/, 'info'],
                        [/\[(DEBUG|TRACE)\]/, 'debug'],

                        // 匹配方括号里的其他内容
                        [/\[[^\]]+\]/, 'bracket'],
                        // IP 或域名 + 端口
                        [/\b((\d{1,3}\.){3}\d{1,3}|[a-zA-Z0-9.-]+):\d+\b/, 'host'],
                        // 数字
                        [/\b\d+\b/, 'number'],
                        [/\b(SELECT|INSERT|UPDATE|DELETE|FROM|WHERE|AND|OR|NOT|NULL|VALUES|INTO|CREATE|TABLE|DROP|ALTER|JOIN|ON|AS|IN|BY|GROUP|ORDER|LIMIT|SHOW|DESCRIBE|EXPLAIN)\b/i, 'sqlKeyword'],

                        // 引号字符串
                        [/".*?"/, 'string'],
                        [/'.*?'/, 'string'],

                        // 其他文本
                        [/./, 'text'],
                    ]
                }
            });
            monaco.editor.defineTheme('vs-dark', {
                base: 'vs-dark',
                inherit: true,
                rules: [
                    { token: 'dbTable', foreground: 'ffaa00' },
                    { token: 'dynamicId', foreground: 'ffaa00' },
                    { token: 'timestamp', foreground: '319331' },
                    { token: 'error', foreground: 'ff5555', fontStyle: 'bold' },
                    { token: 'warning', foreground: 'ffaa00', fontStyle: 'bold' },
                    { token: 'info', foreground: '00bfff' },
                    { token: 'debug', foreground: '8888ff' },
                    { token: 'number', foreground: 'b5cea8' },
                    { token: 'string', foreground: 'ce9178' },
                    { token: 'bracket', foreground: '9e9e9e' },
                    { token: 'text', foreground: '727171' },
                    { token: 'sqlKeyword', foreground: 'ffaa00' },
                    { token: 'host', foreground: '00bfff' },
                ],
                colors: {
                    'editor.background': '#1e1e1e'
                }
            });
            monaco.editor.defineTheme('vs', {
                base: 'vs',
                inherit: true,
                rules: [
                    { token: 'dbTable', foreground: 'ffaa00' },
                    { token: 'dynamicId', foreground: '00bfff' },
                    { token: 'timestamp', foreground: '319331' },
                    { token: 'error', foreground: 'ff5555', fontStyle: 'bold' },
                    { token: 'warning', foreground: 'ffaa00', fontStyle: 'bold' },
                    { token: 'info', foreground: '00bfff' },
                    { token: 'debug', foreground: '8888ff' },
                    { token: 'number', foreground: 'b5cea8' },
                    { token: 'string', foreground: 'ce9178' },
                    { token: 'bracket', foreground: '9e9e9e' },
                    { token: 'text', foreground: '727171' },
                    { token: 'sqlKeyword', foreground: 'ffaa00' },
                    { token: 'host', foreground: '00bfff' },
                ],
                colors: {
                    'editor.background': '#ffffff'
                }
            });
        }
    };
    const registerCompletionProvider = (id, monacoIns) => {
        initHighlight();
        const providerId = `sql-completion-provider-${id}`;
        try {
            monacoProviderRef.current = monacoIns.languages.registerCompletionItemProvider('log', {
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
                        detail: `Log Keyword ${keyword}`,
                        documentation: `Log Keyword: ${keyword}`
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
            const newValue = editor.getValue();
        });

        // Register a new provider and store the reference
        registerCompletionProvider(id, monacoIns);



        // 监听选择变化
        editor.onDidChangeCursorSelection((event) => {
            const { selection } = event;
            const selectedText = editor.getModel().getValueInRange(selection);
            if (selectedText.length > 0) {

            }
        });

        // 清理函数，当组件卸载时注销提示项提供者
        return () => {
            unregisterCompletionProvider(id, monacoIns);
        };
    }, []);


    const editorOptions = {
        // 不显示迷你地图
        minimap: {
            enabled: false
        },
        // 启用SQL语法高亮和关键字提示
        language: 'log',
        autoClosingBrackets: 'always',
        quickSuggestions: true,
        suggestOnTriggerCharacters: true,
        // 启用自动完成功能
        autoClosingBrackets: true,
        autoClosingQuotes: true,
        automaticLayout: true,
        readOnly: true,
        wordWrap: 'on', // 开启自动换行
        // 针对移动端的额外配置
        mouseWheelZoom: true,       // 允许手势缩放
        folding: false,             // 简化移动端显示
        // 其他选项...
    };
    const [selectedItem, setSelectedItem] = useState(null);
    const [logDetail, setLogDetail] = useState('');

    const getLogDetail = async () => {

        if (!selectedItemRef.current) {
            return;
        }
        await buildLogApi.getById(selectedItemRef.current).then(res => {
            debugLog(" res ", res)
            setLogDetail(res.content)
        })
    }

    useEffect(() => {
        debugLog(" selectedItem ", selectedItem)
        selectedItemRef.current = selectedItem;
        getLogDetail();
    }, [selectedItem])

    const deleteById = async (id) => {
        await buildLogApi.deleteById(id).then(res => {
            getLogList();
        })
    }

    // 动态更新宽度
    const [width, setWidth] = useState('60%');
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

        <Drawer placement="right"
            width={width}
            title={i18next.t('buildLogsDrawer.title')}
            // onClose={handleCancel()} 
            open={visible}
            visible={visible}
            onClose={() => {
                handleCancel()
            }}
            confirmLoading={confirmLoading}
        >
            <Row>
                <Col xs={24} sm={6} md={4} lg={4} xl={4}>
                    <div initialSize={leftPanelSize} minSize="15%" maxSize="30%">
                        <Collapse defaultActiveKey={['1']} className="collapse-box">
                            <Panel header={i18next.t('buildLogsDrawer.buildHistory')} key="1">
                                <Space direction="vertical" className='buildhistory-space-vertical'>
                                    <Search
                                        size='middle'
                                        placeholder={i18next.t('buildLogsDrawer.searchPlaceholder')}
                                        onSearch={onSearch}
                                        onChange={e => setSearchText(e.target.value)}
                                        value={searchText}
                                        allowClear />
                                    <List
                                        className="credential-list logView-left-pane"
                                        itemLayout="horizontal"
                                        dataSource={filteredData}
                                        renderItem={(item) => (
                                            <List.Item key={item.id}
                                                className={selectedItem === item.id ? 'selected-item' : ''}
                                                onClick={() => {
                                                    setSelectedItem(item.id);
                                                    // setUserSelected(item.id)
                                                }}>
                                                <List.Item.Meta title={
                                                    <Space className='list-action-title'>
                                                        <Avatar className='list-action-icon' src={iconType(item.status)} />
                                                        <a>{item.name}</a>
                                                        <Button icon={<CloseOutlined />} className='list-action-close-icon' size='small' onClick={(e) => {
                                                            e.stopPropagation(); // 阻止事件冒泡，避免触发父级的点击事件
                                                            deleteById(item.id)
                                                        }} />
                                                    </Space>
                                                }
                                                    description={item.created} />
                                            </List.Item>
                                        )}
                                    />
                                </Space>
                            </Panel>
                        </Collapse>
                    </div>
                </Col>
                <Col xs={24} sm={18} md={20} lg={20} xl={20}>
                    <div className="logView-right-pane" initialSize={rightPanelSize} minSize="50%">
                        <div id="logviewRef" className="logView-box w-full bg-gray-200">
                            <MonacoEditor
                                width="100%"
                                height="100%"
                                theme={theme === 'dark' ? 'vs-dark' : 'vs'}
                                language="log"
                                options={editorOptions}
                                value={logDetail}
                                editorDidMount={editorDidMountHandle}
                            />
                        </div>
                    </div>
                </Col>
            </Row>
            {/* </SplitPane> */}

        </Drawer>
    )
};

export default BuildLogsDrawer;