import mermaid from 'mermaid';
import React, { useEffect, useRef, useState } from 'react';
const MermaidChart = () => {
 

  const chartRef = useRef(null);
  const [gitGraphData, setGitGraphData] = useState(`%%{init: { 'logLevel': 'debug', 'theme': 'base', 'gitGraph': {'showBranches': true, 'showCommitLabel':true,'mainBranchName': 'MetroLine1'}} }%%
  gitGraph BT:
    commit id:"NewYork"
    commit id:"Dallas"
    branch MetroLine2
    commit id:"LosAngeles"
    commit id:"Chicago"
    commit id:"Houston"
    branch MetroLine3
    commit id:"Phoenix"
    commit type: HIGHLIGHT id:"Denver"
    commit id:"Boston"
    checkout MetroLine1
    commit id:"Atlanta"
    merge MetroLine3
    commit id:"Miami"
    commit id:"Washington"
    merge MetroLine2 tag:"MY JUNCTION"
    commit id:"Boston"
    commit id:"Detroit"
    commit type:REVERSE id:"SanFrancisco"
    commit 
    commit `);
            

  useEffect(() => {
    mermaid.initialize({ startOnLoad: true });
    mermaid.contentLoaded();
  }, []);

  // useEffect(() => {
  //   // 处理 JSON 数据并生成 gitGraph 格式
  //   const processCommits = (commits) => {
  //         let graphLines = [];
  //         let currentBranch = '';
  //         let branchStack = [];
  //         // 添加初始化字符串
  //         graphLines.push("%%{init: { 'logLevel': 'debug', 'theme': 'base' } }%%");
  //         graphLines.push("gitGraph BT:");
          
  //         commits.forEach(commit => {
  //             const { branch, short_id, title } = commit;

  //             // 检查是否切换了分支
  //             if (currentBranch !== branch) {
  //                 if (currentBranch) {
  //                     graphLines.push(`checkout ${currentBranch}`);
  //                 }
  //                 graphLines.push(`branch ${branch}`);
  //                 currentBranch = branch;
  //             }

  //             // 添加提交信息
  //             graphLines.push(`commit id:"${short_id}"`);

  //             // 根据需要处理其他信息
  //             // 例如，添加 tag 或 commit type
  //             // graphLines.push(`commit id:"${full_id}" tag:"your-tag"`); // 如果有 tag
  //             // graphLines.push(`commit type:HIGHLIGHT`); // 如果需要 highlight

  //             // 根据父提交 ids 来构建结构
  //             if (commit.parent_ids.length > 0) {
  //                 commit.parent_ids.forEach(parentId => {
  //                     graphLines.push(`merge ${parentId}`);
  //                 });
  //             }
  //         });

  //         // 添加最后的 checkout 操作
  //         if (currentBranch) {
  //             graphLines.push(`checkout ${currentBranch}`);
  //         }

  //         return graphLines.join('\n');
  //   };

  //     const formattedGraph = processCommits(commits);
  //     debugLog(" formattedGraph ",formattedGraph);
  //     setGitGraphData(formattedGraph);
  //     mermaid.initialize({ startOnLoad: true });
  //     mermaid.contentLoaded();
  // }, [commits]);


  return (
    <div className="mermaid">
      {gitGraphData}
    </div>
  );
};

export default MermaidChart;