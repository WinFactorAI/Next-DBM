import { Anchor, Collapse, Drawer, Form, Input } from "antd";
import i18next from "i18next";
import React, { useCallback, useEffect, useRef, useState } from 'react';
import gitApi from "../../api/git";
import workBuildManagerApi from "../../api/worker/command";
import { debugLog } from "../../common/logger";
import GitGraphModal from "../gitgraph/GitGraphModal";

const { Panel } = Collapse;
const { Search } = Input;
const { Link } = Anchor;
const api = gitApi;
const {TextArea} = Input;

const GitManagerLogsModal = ({
                          visible,
                          handleOk,
                          handleCancel,
                          confirmLoading,
                          id,
                          worker
                      }) => {
    debugLog(" id ",id)
    const [form] = Form.useForm();
                        
    const formItemLayout = {
        labelCol: {span: 6},
        wrapperCol: {span: 14},
    };

    useEffect(() => {

        const getItem = async () => {
            let data;
            if (worker === true) {
                data = await workBuildManagerApi.getById(id);
            } else {
                data = await api.getById(id);
            }
            if (data) {
                form.setFieldsValue(data);
            }
        }


        if (visible) {
            if (id) {
                getItem();
            } else {
                form.setFieldsValue({});
            }
        } else {
            form.resetFields();
        }
    }, [visible]);

    useEffect(() => {
        const element = document.getElementById('logviewRef');
        if (element) {
            debugLog(" window.innerHeight ", window.innerHeight);
            element.style.height = `${window.innerHeight-42}px`;
        }
    }, []);
  
    const [sqlValue, setSqlValue] = useState("");
    // useEffect(() => {
    //   setSqlValue(getTabByID(tabIndex).sql);
    // },[tabs,tabIndex]);
  
    // 编辑器实例引用
    const editorRef = useRef(null);
    // Monaco API 引用
    const monacoRef = useRef(null);
  
    // 获取编辑器实例的回调函数
    const editorDidMountHandle = useCallback((editor, monacoIns) => {
      if (editor && monacoIns) {
        editorRef.current = editor;
        monacoRef.current = monacoIns;
 
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
      language: 'plaintext',
      autoClosingBrackets: 'always',
      quickSuggestions: true,
      suggestOnTriggerCharacters: true,
      // 启用自动完成功能
      autoClosingBrackets: true,
      autoClosingQuotes: true,
      automaticLayout: true,
      readOnly: true,
      wordWrap: 'on', // 开启自动换行
      // 其他选项...
    };
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

    return (

        <Drawer 
            placement="right"
            width={width}
            title={i18next.t('gitLogs.drawer.title')}
            // onClose={handleCancel()} 
            open={visible}
            visible={visible}
            onClose={()=>{
                handleCancel()
            }} 
            confirmLoading={confirmLoading}
            destroyOnClose={true}
            >
             <GitGraphModal id={id}></GitGraphModal>
        </Drawer>
    )
};

export default GitManagerLogsModal;