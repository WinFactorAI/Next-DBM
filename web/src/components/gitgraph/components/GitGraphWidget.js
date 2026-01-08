import { ForkOutlined, TagOutlined } from '@ant-design/icons';
import multiavatar from '@multiavatar/multiavatar/esm';
import i18next from 'i18next';
import _ from 'lodash';
import React, { useEffect, useRef, useState } from 'react';
import GitGraph from 'react-gitgraph';
import toast, { Toaster } from 'react-hot-toast';
import gitApi from "../../../api/git";
// import FaCodeFork from 'react-icons/lib/fa/code-fork'
// import FaTag from 'react-icons/lib/fa/tag'
import { Button, Popover } from 'antd';
import SplitPane from 'react-split-pane';
// import importedData from '../data/commits.json';
import ChangeView from './ChangeView';

import { Drawer, Space } from 'antd';
import 'antd/es/button/style/css'; // 为 Button 组件引入样式
import 'antd/es/drawer/style/css';
import 'antd/es/modal/style/css';
import 'antd/es/select/style/css';
import 'antd/es/space/style/css';
import { debugLog } from "../../../common/logger";
import GitRecoverModal from './GitRecoverModal';

const api = gitApi;
const provinceData = ['Zhejiang', 'Jiangsu'];
const cityData = {
  Zhejiang: ['Hangzhou', 'Ningbo', 'Wenzhou'],
  Jiangsu: ['Nanjing', 'Suzhou', 'Zhenjiang'],
};

const GitGraphWidget = ({id,allBranchHistory,setNodeId}) =>{
  

  const [importedData,setImportedData] = useState(allBranchHistory)
  const gitgraphRef = useRef(null);
  const [commitFiles,setCommitFiles] = useState(null)
  const [commitHash,setCommitHash]= useState(null)

  // const [gitgraph,setGitgraph] = useState(null)
  const [openDetail,setOpenDetail] = useState(false)
  const [isModalOpen,setIsModalOpen] = useState(false)


  const [cities, setCities] = useState(cityData[provinceData[0]]);
  const [secondCity, setSecondCity] = useState(cityData[provinceData[0]][0]);
  const handleProvinceChange = (value) => {
    setCities(cityData[value]);
    setSecondCity(cityData[value][0]);
  };
  const onSecondCityChange = (value) => {
    setSecondCity(value);
  };


  // initializeGraph = initializeGraph.bind(this)
  // onCommitSelection = onCommitSelection.bind(this)

  const [branchStack,setDranchStack] = useState([])
  const [branches,setBranches] = useState([])
  const [branchesBucket,setBranchesBucket] = useState([])
  const [nodesStore,setNodesStore] = useState([])
  const [myTemplateConfig,setMyTemplateConfig] = useState({ // inherited from 'metro' template
    colors: ["#3E46D9", "#4AD386","#979797","red", "orange", "yellow", "#F85BB5", "#008fb5", "#f1c109", "#8fb500"],
    branch: {
      lineWidth: 3,
      spacingX: 20,
      showLabel: false,
      labelRotation: 0
    },
    commit: {
      spacingY: 40,
      dot: {
        size: 10,
        strokeWidth: 0, // Commit 点的描边宽度
      },
      message: {
        display: false,
        displayAuthor: true,
        displayBranch: true,
        displayHash: true,
        font: "normal 10pt Arial"
      },
      onClick: (commit) => onCommitSelection(commit),
      onMouseEnter: (commit) => onCommitMouseEnter(commit),
      onMouseLeave: (commit) => onCommitMouseLeave(commit),
      shouldDisplayTooltipsInCompactMode: false,
      tooltipHTMLFormatter: function ( commit ) {
        return "[" + commit.sha1 + "]: " + commit.message;
      }
    }
  })

  // 主面板历史状态
  const getGitPanelSize = (defSize,index) =>{
    const splitGitPanelPos = localStorage.getItem('splitGitPanlePos')
    if(splitGitPanelPos){
      return  splitGitPanelPos.split(',')[index];
    }else {
      return defSize
    }
  }
    
  const [parentBoxHeight,setParentBoxHeight] = useState(0)
  const tableGitBoxRef = useRef(null);   
  const viewCodeBoxRef = useRef(null);
  const [tableGitPanelSize,setTableGitPanelSize] = useState(getGitPanelSize('60%',0))
  const [viewCodePanelSize,setViewCodePanelSize] = useState(getGitPanelSize('40%',1))
  useEffect(() => {
      change([tableGitPanelSize, viewCodePanelSize]); // 初始化时调用一次
  },[]);

  const change = (size) =>{
    localStorage.setItem('splitGitPanlePos', size);
    // debugLog(" ### size ",size)
    const totalHeight = window.innerHeight; 
    const firstPaneHeight = (totalHeight * parseFloat(size[0])) / 100;
    const secondPaneHeight = (totalHeight* parseFloat(size[1])) / 100;
    setParentBoxHeight(secondPaneHeight-150)
    if (tableGitBoxRef.current) {  
      tableGitBoxRef.current.style.height = `${firstPaneHeight}px`;
    }
    if (viewCodeBoxRef.current) {  
      // debugLog(" ## secondPaneHeight ",secondPaneHeight)
      viewCodeBoxRef.current.style.height = `${secondPaneHeight}px`;

      // const element = document.getElementById('viewCodeBoxRef');
      // if (element) {
      //   element.style.height = `${secondPaneHeight}px`;
      // }
    }
    
    // setGitBoxHeight(firstPaneHeight);
    // setViewCodeBoxHeight(secondPaneHeight);
  }
  const onCommitSelection = (commit) =>{
    // alert("You clicked on commit " + commit.sha1)
    // debugLog(" commit.sha1 ",commit)
    toast.success(' 点击了 提交ID ' + commit.sha1);
    const commitRow = document.getElementById('row-'+commit.sha1);
    setActiveRow(commitRow)
  }

  const onCommitMouseEnter = (commit) =>{
    debugLog(`Mouse entered commit with SHA1: ${commit.sha1}`);
    toast.success('111'+"You clicked on commit " + commit.sha1);
    // 在这里可以添加更多逻辑，例如更改样式或显示工具提示
  }
  
  const  onCommitMouseLeave = (commit) =>{
    debugLog(`Mouse left commit with SHA1: ${commit.sha1}`);
    // 在这里可以添加更多逻辑，例如恢复默认样式或隐藏工具提示
  }
  const  commitAttributes = (node) => {
    return {
      dotColor: !node.is_current ? node.color: "white",
      dotSize: 2,
      dotStrokeWidth: 6,
      dotClassName: "circle",
      sha1: node.id,
      message: node.message,
      short_id: node.short_id,
      //tag: node.tag,
      author: node.author_name + "<" + node.author_email + ">",
      onClick: (commit) => onCommitSelection(commit),
      onMouseEnter: (commit) => onCommitMouseEnter(commit),
      onMouseLeave: (commit) => onCommitMouseLeave(commit)
    }
  }
  const [gitgraphInstance, setGitgraphInstance] = useState(null);
  const [graphKey, setGraphKey] = useState(0);  // 控制重新渲染的 key
  let  gitgraph=null

  useEffect(() => {
    // debugLog(" #### id ",id)
    // debugLog(" #### allBranchHistory ",allBranchHistory)
    // debugLog(" #### branches ",branches)
    // debugLog(" #### branchesBucket ",branchesBucket)
    setBranches([])
    setBranchesBucket([])
    setNodesStore([])
    setImportedData(allBranchHistory)
    setGraphKey(prevKey => prevKey + 1);  // 每次数据变化，key 增加触发重新渲染

  },[allBranchHistory]);

 
  const  initializeGraph = (gitgraphTmp) =>{
    setBranches([])
    setBranchesBucket([])
    debugLog(" 触发重新绘制")
    // if (!gitgraph) return;  // 防止 gitgraph 为空时执行
    // 对数组进行倒序
    // importedData.reverse();
    // setGitgraph(gitgraph)
    gitgraph = gitgraphTmp
    importData(gitgraphTmp)

    // const master = gitgraph.branch("master");

    // master.commit("Initial commit");
    // master.commit("another old commit");
  
    // const j1 = master.branch("feature/jira-001");
    // j1.commit("implement UI");
    // j1.commit("add more tests");
    // j1.commit("fix bug");
    
    gitgraph.canvas.addEventListener( "commit:mouseover", function ( event ) {
      this.style.cursor = "pointer"
    })

    gitgraph.canvas.addEventListener("commit:mouseout", function (event) {
      this.style.cursor = "auto"
    })
  }

  useEffect(() => {
    nodesStore.forEach((node,index) => {
      var branchIndex = findBranchFromCommit(branchesBucket, node.full_id)
      if (node.parentIds.length === 2) {
        branchIndex = findTheOtherBranchIndex(node.full_id, branchIndex, branchesBucket);
      }
      
      var row = document.getElementById("row-" + node.id)?.cells
      if(row){
        for (var i = 0; i < row.length; i++) {
          row[i].style.color = myTemplateConfig.colors[branchIndex]
        }
      }
    })
    

    // 给tr添加点击事件
    const table = tableGitBoxRef.current.querySelector('table#gitTable');
    const rows = table.querySelectorAll('tr');
    const handleClick = (e) => {
      if (e.target.tagName !== 'SPAN' && e.target.tagName !== 'BUTTON' && !e.target.classList.contains('operation-box')) {
        setActiveRow(e.currentTarget);
      }
      const row = e.currentTarget;
      debugLog(" handleClick row",row)
      const rowId = row.id; // 获取行的 ID
      const nodeId = rowId.replace("row-", ""); // 提取 node ID
      debugLog("Node ID:", nodeId);
      setNodeId(nodeId)
    };
    rows.forEach(row => {
      if(row.id != ''){
        row.addEventListener('click', handleClick);
      }
    });
    if(rows.length>1){
      // 立即触发点击事件
      const firstRow = rows[1];
      firstRow.click(); // 模拟点击
    }

    return () => {
      rows.forEach(row => {
        row.removeEventListener('click', handleClick);
      });
    };
  }, [importedData]);

  const  onDetailClose = () => {
      setOpenDetail(false)
  };
 
  const [itemDetail,setItemDetail] = useState({});
  const showRecoverModal = (e,commit) => {
    // debugLog(' commit ',commit);
    e.stopPropagation(); // 阻止事件继续传递
    setIsModalOpen(true)
    setItemDetail(commit)
    debugLog(" showRecoverModal commit ",commit)
  };
  const  handleOk = () => {
    setIsModalOpen(false)
  };
  const  handleCancel = () => {
    setIsModalOpen(false)
  };
  // componentDidMount() {}
  const [width,setWidth] = useState(myTemplateConfig.branch.spacingX + 142);
  const [tdStyle,setTdStyle] = useState({
    minWidth: `${width}px`,
    width: `${width}px`,
  });
 
  const createRows = (myTemplateConfig) => {
    // debugLog(" ## createRows",myTemplateConfig)
    let table = []
    if(importedData && importedData.length >0)  {
      for (let i = 1; i < importedData.length; i++) {
        // debugLog(" @@ importedData",importedData)
        table.push(<tr id={'row-' + importedData[i].short_id} className='lien'> <td></td>{getCommitMessage(myTemplateConfig, importedData[i])}</tr>)
      }
      table.push(<tr className='lien'>{getCommitMessage(myTemplateConfig, null)}</tr>)
      table.push(<tr className='lien'>{getCommitMessage(myTemplateConfig, null)}</tr>)
    }    
    return table
  }

  const  getCommitMessage = (myTemplateConfig, commit) => {

    return [
      <td align="left" className='lien-td message-box' >
        
          {commit ? 
            <Popover placement="top" content={commit.message} title="提交描述">
              {commit.message }
            </Popover>
            : undefined}
        
      </td>,
      <td align="left" className='lien-td lien-td-icon'> {commit ? commit.tag ? <TagOutlined /> : undefined : undefined}</td>,
      <td align="left" className='lien-td'>{commit ? commit.tag ? commit.tag : undefined : undefined}</td>,
      <td align="left" className='lien-td lien-td-icon'>{commit ? <ForkOutlined /> : undefined}</td>,
      <td align="left" className='lien-td'>{commit ? '[' + commit.branch + ']' : undefined}</td>,
      <td align="left" className='lien-td'>{commit ? commit.short_id : undefined}</td>,
      // <td align="left" className='lien-td'>{commit ? commit.title : undefined}</td>,
      <td align="left" className='lien-td lien-td-icon'>{commit ? 
        <div className='avatar' dangerouslySetInnerHTML={{ __html: multiavatar(commit.author_name) }} />
        // <div className='avatar'>{ multiavatar(commit.author_name)}</div> 
      : undefined}</td>,
      <td align="left" className='lien-td'>{commit ? commit.author_name + "<" + commit.author_email + ">" : undefined}</td>,
      <td align="left" className='lien-td'>{commit ? commit.created_at : undefined}</td>,
      <td align="left" className='lien-td operation-box'>{commit ? (
        <Space>
          {/* <Button  onClick={showDetailDrawer}>详情</Button> */}
          <Button type='primary' size='small' onClick={(e) => showRecoverModal(e,commit)}>{i18next.t('gitGraphWidget.table.header.restore')}</Button>
        </Space>
      ) : undefined}</td>
    ]
  }
  const BATCH_SIZE = 100; // 每批处理的大小
  let currentIndex = 0; // 当前处理的索引
  
  const handleScroll = () => {
    const scrollTop = tableGitBoxRef.current.scrollTop;
    debugLog(" scrollTop ",scrollTop)
    // debugLog(" gitgraphRef.current.canvas " ,gitgraphRef.current.canvas)
    // gitgraphRef.current.canvas.getContext('2d').reset();
    // debugLog(" gitgraph ",gitgraph)
    // 获取 GitGraph 实例
    // const gitgraph = gitgraphRef.current.gitgraph;
    // 重新绘制图形
    // gitgraph && gitgraph.render();
    //currentIndex = Math.floor(scrollTop / 30);
    // clearData()
    // importData(gitgraph); // 继续渲染下一批
    // initializeGraph(gitgraph)
    // const newStartIndex = Math.floor(scrollTop / itemHeight);
    // setStartIndex(newStartIndex);
    // setEndIndex(newStartIndex + visibleCount);
    // debugLog(" 删除前 ",nodesStore.length);
    // nodesStore.shift();
    // debugLog(" 删除后 ",nodesStore.length);
    // setNodesStore([])
    // setBranches([])
    // setBranchesBucket([])

  };

  //滚动条监控
  useEffect(() => {
    const container = tableGitBoxRef.current;
    container.addEventListener('scroll', handleScroll);
    return () => container.removeEventListener('scroll', handleScroll);
  }, []);
 
  const importData = (gitgraph) => {
    // debugLog(" ### currentIndex ",currentIndex)
    // debugLog(" ### importedData.length ",importedData.length)
    // 计算当前批次的数据
    const nextBatch = importedData.slice(currentIndex, currentIndex + BATCH_SIZE);
    // debugLog(" nextBatch.length ",nextBatch.length)
    // if (nextBatch.length >= 700) {
    if (nextBatch.length === 0) {
        // debugLog("所有数据已渲染完毕");
        return; // 如果没有数据则结束
    }

    var commits = nextBatch
      
    for (var i = 0; i<commits.length;i++){
        var commit = commits[i];
        // debugLog(" ## commit " ,commit)
        nodesStore.unshift({
            'is_current': commit["is_current"],
            'tag': commit["tag"],
            'branch': commit["branch"],
            'id': commit["short_id"],
            'full_id': commit["full_id"],
            'date': commit["created_at"],
            'message': commit["message"],
            'author': commit["author_name"]+ "<"+commit["author_email"]+">",
            'parentIds': commit["parent_ids"],
            'placed':false,
            'childrenPlaced':[]
        });
    }

    var firstNode = _.find(nodesStore, { 'parentIds': [] });

    branches[0] = gitgraph.branch(firstNode.branch);
    branchesBucket[0]= [];
    branchesBucket[0].push(firstNode.full_id);
    // for each node in the node set to place
    nodesStore.forEach((node,index) => {
        // we find the branch the node is belongig to 
        var actualBranchIndex = findBranchFromCommit(branchesBucket, node.full_id);

        // check if this is a merge
        if (node.parentIds.length <2){
            // commit the node
            if (index === 0){
              branches[actualBranchIndex].commit(commitAttributes(node));
            } else {
                if (branches[actualBranchIndex].name !== node.branch) {

                  let b = -1
                  branches.forEach((branch, index) => {
                    if (branch.name === node.branch) {
                      b = index;
                    }
                  })
                  if (-1 === b) {
                    // prepare branch info
                    let branchCnt = branches.length;
                    branchesBucket[branchCnt] = [];
                    branchesBucket[branchCnt].push(node.full_id);
                    // create branch
                    branches[branchCnt] = branches[actualBranchIndex].branch(node.branch);
                    actualBranchIndex = branchCnt
                  } else {
                    actualBranchIndex = b
                  }
                }
                branches[actualBranchIndex].commit(commitAttributes(node));
            }
        } else {
            // find the other branch to merge to
            var otherBranch = findTheOtherBranchIndex(node.full_id,actualBranchIndex,branchesBucket);
            
            // debugLog(node.full_id);
            // // merge
            // debugLog("merge : "+actualBranchIndex);
            // debugLog("in : "+otherBranch);
            branches[actualBranchIndex].merge(branches[otherBranch], commitAttributes(node));
            actualBranchIndex = otherBranch
            
            // make sure the resulting commit is in the actualBranch (resulting banch of the merge)
            var pos = branchesBucket[otherBranch].indexOf(node.full_id);
            if (pos>-1){
              branchesBucket[otherBranch].splice(pos,1);
            }
        }
        
        // check children count
        node.children = findChildren(node.full_id,nodesStore);
        
        // if more than one child = we need to branch for child after the first one
        if (node.children.length>1){
            // we branch for each child following the first one
            for (var i=1;i<node.children.length;i++ ) {
              var branch = _.find(branches, { 'name': node.children[i].branch });
              if (undefined === branch){
                // prepare branch info
                let branchCnt = branches.length;
                branchesBucket[branchCnt] = [];
                branchesBucket[branchCnt].push(node.children[i].full_id);

                // create branch
                branches[branchCnt] = branches[actualBranchIndex].branch(node.children[i].branch);
              } else {
                let branchCnt = branches.map((e) => { return e.name; }).indexOf(branch.name);
                branchesBucket[branchCnt].push(node.children[i].full_id);
              }
            }
        }
        if (node.children.length > 0) {
            // we add the child to the actual branch
            branchesBucket[actualBranchIndex].push(node.children[0].full_id);
        }
    })

    // currentIndex += BATCH_SIZE; // 更新当前索引

    // 使用 setTimeout 或 requestIdleCallback 来延迟下一批渲染
    // setTimeout(() => {
    //   setNodesStore([])
    //   setBranches([])
    //   setBranchesBucket([])
    //   importData(gitgraph); // 继续渲染下一批
    // }, 100); // 这里可以调整延迟时间以优化性能
  }

  const findChildren = (commitId,nodesStore) =>{
      var children = [];
       nodesStore.forEach((node) => {
           if (node.parentIds.indexOf(commitId)>-1){
               children.push(node);
           }
       });
      return children;
  }   
  
  const findBranchFromCommit = (branchesBucket, commitId) => {
      var branchIndex = 0;
      if (branchesBucket.length === 1) return 0;
      branchesBucket.forEach((branchBucket, index) => {
          if (branchBucket.indexOf(commitId) > -1) {
              branchIndex = index;
          }
      })
      return branchIndex;
  }   

  const findTheOtherBranchIndex = (commitId,actualBranch,branchesBucket) => {
      var otherBranchIndex = 0;
      branchesBucket.forEach((brancheBucket,index) => {
          if ((brancheBucket.indexOf(commitId)>-1)&&(index!==actualBranch)){
              otherBranchIndex = index;
          }
      })
      return otherBranchIndex;
  }

  const toggleRowActivation = (row) => {
    if (row.classList.contains('active-row')) {
      row.classList.remove('active-row');
    } else {
      row.classList.add('active-row');
    }
  }

  const setActiveRow = async (row) =>{
 
      // 移除所有行的激活状态
      const rows = document.querySelectorAll('table tr');
      rows.forEach(r => r.classList.remove('active-row'));
    
      // 为点击的行添加激活状态
      row.classList.add('active-row');
      // debugLog(" row ",row.id.replace('row-',''))
   
      let commitFiles = await api.commitFiles(id,row.id.replace('row-',''))
      setCommitHash(row.id.replace('row-',''))
      setCommitFiles(commitFiles)
  }

  const onFinish = (values) => {
    debugLog('Success:', values);
  };
  const onFinishFailed = (errorInfo) => {
    debugLog('Failed:', errorInfo);
  };

  return(
    <div>
      <SplitPane 
      className="height100vh1"
      split="horizontal" 
      onChange={change} >
        <div initialSize={tableGitPanelSize} minSize="10%" maxSize="80%">
          <div ref={tableGitBoxRef} className='git-box' >

            <table id="gitTable" key={'gitTable'} className='gitTable'>
              {/* <MermaidDiagram commits={importedData} /> */}
              {/* <GitGraph 
                key={graphKey}  // 使用 key 触发重新渲染
                // key={'gitgraph'}
                className='gitgraph' 
                initializeGraph={initializeGraph}
                // ref={(gitgraph)=>{gitgraph=gitgraph}}
                ref={gitgraphRef}
                options={{
                      template: myTemplateConfig,
                      reverseArrow: false,
                      orientation: "vertical",
                      mode: "extended"}} /> */}

              <GitGraph 
                key={graphKey}  // 使用 key 触发重新渲染
                // key={'gitgraph'}
                className='gitgraph' 
                initializeGraph={initializeGraph}
                // ref={(gitgraph)=>{gitgraph=gitgraph}}
                ref={gitgraphRef}
                options={{
                      template: myTemplateConfig,
                      reverseArrow: true,
                      orientation: "vertical",
                      mode: "extended"
                      }} />
              <thead>
                  <tr id={'thead-box-0'} className='lien lien-head no-click'>
                      <th align="left" className='lien-td' style={tdStyle}>{i18next.t('gitGraphWidget.table.header.chart')}</th>
                      <th align="left" className='lien-td'>{i18next.t('gitGraphWidget.table.header.description')}</th>
                      <th align="left" className='lien-td'></th>
                      <th align="left" className='lien-td'>{i18next.t('gitGraphWidget.table.header.label')}</th>
                      <th align="left" className='lien-td'></th>
                      <th align="left" className='lien-td'>{i18next.t('gitGraphWidget.table.header.branch')}</th>
                      <th align="left" className='lien-td'>{i18next.t('gitGraphWidget.table.header.commit')}</th>
                      <th align="left" className='lien-td'></th>
                      <th align="left" className='lien-td'>{i18next.t('gitGraphWidget.table.header.author')}</th>
                      <th align="left" className='lien-td'>{i18next.t('gitGraphWidget.table.header.date')}</th>
                      <th align="left" className='lien-td'>{i18next.t('gitGraphWidget.table.header.action')}</th>
                  </tr>
              </thead>
              <tbody>
                {
                  importedData && importedData.length >0 && (
                    <tr id={'row-' + importedData[0].short_id}  className='lien'>
                      <td style={tdStyle}></td>
                      {getCommitMessage(myTemplateConfig, importedData[0])}
                    </tr>
                  )
                }
                {createRows(myTemplateConfig)}
              </tbody>
            </table>
          </div>
        </div>
        <div initialSize={viewCodePanelSize} minSize="10%"  className='change-view'>
          <div ref={viewCodeBoxRef} >
            <ChangeView id={id} parentBoxHeight={parentBoxHeight} commitHash={commitHash} commitFiles={commitFiles}></ChangeView>
          </div>
        </div>
      </SplitPane>

      <Drawer title="详情" placement="left" 
        // height={'80%'} 
        width={'80%'} 
        onClose={onDetailClose} open={openDetail}
        extra={
          <Space>
            <Button onClick={onDetailClose}  >关闭</Button>
            {/* <Button type="primary" onClick={onDetailClose}  >
              OK
            </Button> */}
          </Space>
        }
        >
          <ChangeView></ChangeView>
          {/* <DiffViewer></DiffViewer> */}
        <p>表结构版本管理</p>
      </Drawer>
  
      <GitRecoverModal
            id={id}
            itemDetail={itemDetail}
            visible={isModalOpen}
            handleCancel={handleCancel}
            handleOk={handleOk}
      ></GitRecoverModal>
      <Toaster position="top-right" gutter={8} toastOptions={{  duration: 3000, }} />  
    </div>
  )
  
}

export default GitGraphWidget;
