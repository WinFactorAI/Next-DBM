import { ConfigProvider } from 'antd';
import zhCN from 'antd/es/locale-provider/zh_CN';
import dayjs from "dayjs";
import 'dayjs/locale/zh-cn';
import relativeTime from "dayjs/plugin/relativeTime";
import ReactDOM from 'react-dom';
import { QueryClient, QueryClientProvider, } from 'react-query';
import { HashRouter as Router } from "react-router-dom";
import App from './App';
import './index.css';
import * as serviceWorker from './serviceWorker';

dayjs.extend(relativeTime);
dayjs.locale('zh-cn');

const queryClient = new QueryClient();

// window.onerror = function (message, source, lineno, colno, error) {
//     console.error("全局错误捕获:", { message, source, lineno, colno, error });
//     // location.reload();
//     return true; // 阻止默认错误处理
// };
// window.onerror = function (message, source, lineno, colno, error) {
//     console.error("全局错误捕获:", { message, source, lineno, colno, error });

//     let refreshCount = localStorage.getItem("error_refresh_count") || 0;
//     refreshCount = parseInt(refreshCount, 10);

//     if (refreshCount < 1) { // 限制最多 3 次刷新
//         localStorage.setItem("error_refresh_count", refreshCount + 1);
//         // window.location.reload();
//     } else {
//         console.warn("页面错误过多，已停止自动刷新");
//     }

//     return true; // 阻止默认错误处理
// };

// 页面加载成功后，重置刷新次数
// window.onload = function () {
//     localStorage.removeItem("error_refresh_count");
// };

ReactDOM.render(
    <ConfigProvider locale={zhCN}>
        <Router>
            <QueryClientProvider client={queryClient}>
                <App/>
            </QueryClientProvider>
        </Router>
    </ConfigProvider>,
    document.getElementById('root')
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();

