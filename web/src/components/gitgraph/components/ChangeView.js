import { Button, Collapse, Select, Space } from 'antd';
import i18next from 'i18next';
import React, { forwardRef, useEffect, useRef, useState } from 'react';
import gitApi from "../../../api/git";
import { debugLog } from "../../../common/logger";
import DiffViewer from './DiffViewer';
const { Panel } = Collapse;
const api = gitApi;

const handleChange = (value) => {
    debugLog(`selected ${value}`);
  };
const  ChangeView = forwardRef((props, ref) => {

  const [optionsFiles, setOptionsFiles] = useState([]);
  useEffect(() => {
    debugLog(" ### props.commitFiles ",props.commitFiles)
    if(props.commitFiles){
      let commitFiles = props.commitFiles.map(fileList => {
        let fileName = fileList.replace('* ', '');
        return {
          value: fileName,
          label: fileName
        };
      })
      setOptionsFiles(commitFiles);

      let fileListTmp = props.commitFiles.map(fileList => {
        let fileName = fileList.replace('* ', '');
        return {
          name: fileName,
          collapsible: fileName,
          splitView: false
        };
      })
      setFileList(fileListTmp)
    }
    setActiveKeys([])
    // setFileList(props.commitFiles)
  },[props.commitFiles]);

 
  const [parentHeight, setParentHeight] = useState(window.innerHeight - 500);
  const [fileList, setFileList] = useState([]);
  const [allPanelsExpanded, setAllPanelsExpanded] = useState(false);
  const [activeKeys, setActiveKeys] = useState([]);

  const toggleAllPanels = () => {
    setAllPanelsExpanded(!allPanelsExpanded);
    setActiveKeys(allPanelsExpanded ? [] : fileList.map((_, index) => `${index + 1}`));
  };

 
  const viewCodeSubBoxRef = useRef(null);
  useEffect(() => {
    const splitGitPanlePosSize = localStorage.getItem('splitGitPanlePos');
    setParentHeight(window.innerHeight - 500);
    debugLog(" window.innerHeight ",window.innerHeight)
    // debugLog(" viewCodeBoxHeight ",viewCodeBoxHeight)
    if (viewCodeSubBoxRef.current) {  
    
      // viewCodeBoxRef.current.style.height = `${viewCodeBoxHeight}px`;
      // viewCodeBoxRef.current.style.maxHeight = `${viewCodeBoxHeight}px`;

    }
    // viewCodeBoxHeight
  }, []);

  const updateSplitView = (newValue) => {
    setFileList((prevList) =>
      prevList.map((item) => ({
        ...item,
        splitView: newValue,
      }))
    );
  };
 
  useEffect(() => {
    if (ref && ref.current) {
      debugLog(' ### CodeBox ref:', ref.current);
      // 这里你可以直接操作 DOM，例如设置高度
      ref.current.style.height = '300px'; // 根据需要设置高度
    }
  }, [ref]);

  const getCommitFeile = async (item) =>{
    debugLog(" item ",item)
    let commitDiffFile = await api.commitDiffFile(props.id,props.commitHash,item.name);
    debugLog(" commitDiffFile ",commitDiffFile)
    // 如何更新item oldCode newCode
    // 更新 fileList 中对应 item 的 oldCode 和 newCode
    if(commitDiffFile){
      setFileList((prevFileList) => {
        return prevFileList.map((file) => {
          if (file.name === item.name) {
            return {
              ...file,
              oldCode: commitDiffFile.oldVersion,  // 更新 oldCode
              newCode: commitDiffFile.newVersion,  // 更新 newCode
            };
          }
          return file;  // 保持其他项不变
        });
      });
    }
  }

  return (
    <div  className='git-view-box'>
      <Space direction="vertical" style={{ width: '100%'}}>
        <Space className='git-view-file-bar'> 
            <Space align='start'>
              {i18next.t('changeView.bar.show')} 
              <Select
                size='small'
                allowClear
                showSearch
                defaultValue=""
                style={{
                    width: 220,
                }}
                onChange={handleChange}
                options={optionsFiles}/>
               {i18next.t('changeView.bar.have')}  {optionsFiles.length}  {i18next.t('changeView.bar.files')} 
            </Space>
            <Space.Compact block size='small' align='start'>
                <Button  size='small' onClick={()=>toggleAllPanels()} >  {i18next.t('changeView.bar.expand')}  </Button>
                <Button  size='small' onClick={()=>updateSplitView(false)} >  {i18next.t('changeView.bar.singleLineDisplay')}  </Button>
                <Button  size='small' onClick={()=>updateSplitView(true)} >  {i18next.t('changeView.bar.compare')}  </Button>
            </Space.Compact>
        </Space>
        <Space id="viewCodeBoxRef" ref={ref} direction="vertical" style={{width: '100%' ,height:`${props.parentBoxHeight}px`,overflowY:'auto'}} >
            <Collapse
              activeKey={activeKeys} 
              onChange={(keys) => {
                setActiveKeys(keys);
                const lastExpandedKey = keys[keys.length - 1];  // 获取最后一个被展开的 key
                const currentItem = fileList[lastExpandedKey - 1];
                debugLog('当前展开的面板ID:', lastExpandedKey);
                getCommitFeile(currentItem)
              }}
              className='git-view-file-list-item'
              expandIconPosition={'end'}
              style={{ flex: 1, overflowY: 'auto' }}>
               {fileList.map((item, index) => (
                <Panel header={item.name} key={`${index + 1}`}>
                  <DiffViewer splitView={item.splitView} oldCode={item.oldCode} newCode={item.newCode} />
                </Panel>
               ))}
            </Collapse>
        </Space>
      </Space>
    </div>
  )
});

export default ChangeView;