// 应用组件
export const formatTimestamp = (timestamp) =>{
  const date = new Date(timestamp);

  // 获取日期和时间的各个部分
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, '0'); // 月份从0开始，所以加1
  const day = date.getDate().toString().padStart(2, '0');
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  const seconds = date.getSeconds().toString().padStart(2, '0');
  // 将各个部分拼接成一个格式化的字符串
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}

export const formatTimestampStr = (timestamp) =>{
  const date = new Date(timestamp);

  // 获取日期和时间的各个部分
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, '0'); // 月份从0开始，所以加1
  const day = date.getDate().toString().padStart(2, '0');
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  const seconds = date.getSeconds().toString().padStart(2, '0');
  const milliseconds = ('00' + date.getMilliseconds()).slice(-3);
  // 将各个部分拼接成一个格式化的字符串
  return `${year}${month}${day}${hours}${minutes}${seconds}${milliseconds}`;
}

export const percentToPx =  (percent,baseSize) =>{
  return ( baseSize * parseFloat(percent)) / 100;
}

export const cutStringAtDash = (str, dashPosition) => {
  let targetIndex = -1;

  if (dashPosition === -1) {
      // 查找最后一个 "-" 的位置
      targetIndex = str.lastIndexOf('-');
  } else {
      let currentPosition = 0;
      // 查找第 dashPosition 个 "-" 的位置
      for (let i = 0; i < str.length; i++) {
          if (str[i] === '-') {
              currentPosition++;
              if (currentPosition === dashPosition) {
                  targetIndex = i;
                  break;
              }
          }
      }
  }

  // 如果找到了目标位置，则截取并返回
  if (targetIndex !== -1) {
      return str.substring(0, targetIndex);
  }

  // 如果没有找到，返回整个字符串
  return str;
}

// 递归查找节点信息
export const  findNodeByKey = (data, key) => {
  for (let i = 0; i < data.length; i++) {
    const node = data[i];
    if (node.key === key) {
      return node;
    }
    if (node.children) {
      const foundNode = findNodeByKey(node.children, key);
      if (foundNode) {
        return foundNode;
      }
    }
  }
  return null;
};
  
 
export default {
  cutStringAtDash,
  formatTimestamp,
  percentToPx,
  findNodeByKey,
  formatTimestampStr
  // ... 可以添加更多工具函数
};
