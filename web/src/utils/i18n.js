import i18n from 'i18next';
import Backend from 'i18next-http-backend';
import { initReactI18next } from 'react-i18next';

try {
i18n
  .use(Backend)  // 允许从远程服务器加载语言文件
  .use(initReactI18next)
  .init({
    lng: 'zh-CN', // 默认语言
    fallbackLng: 'zh-CN', // 备用语言
    debug: false, // 开启调试模式，方便在控制台查看翻译情况
    backend: {
      loadPath: '/trans/{{lng}}',
      parse: (data) => {
        try {
          const jsonData = JSON.parse(data);
          return jsonData?.data?.messages || {}; 
        } catch (error) {
          console.error("翻译文件解析错误:", error);
          return {};  // 返回空对象，确保不抛出错误
        }
      },
    },
    interpolation: {
      escapeValue: false, // React 已经有 XSS 保护，不需要转义
    },
  });
  console.log("init languages: OK");
} catch (error) {
  console.error("Error init languages:", error);
}
export default i18n;