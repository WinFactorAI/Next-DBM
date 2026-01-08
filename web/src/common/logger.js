// logger.js - 全局日志工具模块

// 全局调试开关
const DEBUG = true; // 设置为 true 开启调试，false 关闭调试

// 调试日志输出函数
export const debugLog = (...args) => {
  if (DEBUG) {
    const stack = new Error().stack; // 获取调用堆栈信息
    const callerInfo = stack.split("\n")[2]; // 获取第二行（调用位置）
    // const position = callerInfo.match(/\((.*):(\d+):(\d+)\)/); // 提取文件名、行号和列号
    // const position = callerInfo.match(/(?:at\s+|@)?(.*):(\d+):(\d+)/);
    // const position = callerInfo.match(/(?:at\s+|@)?(.*?)(?::(\d+):(\d+))?$/);
    const position = callerInfo.match(/(?:\s+|@)?(.*?):(\d+):(\d+)$/);

    if (position) {
      const [_, file, line, column] = position;
      console.log(`[DEBUG] `, ...args, `\n${file}:${line}:${column}`);
    } else {
      console.log("[DEBUG] ", ...args); // 如果无法解析位置信息
    }
  }
};

// 普通日志输出函数
export const infoLog = (...args) => {
  console.log("[INFO]", ...args);
};