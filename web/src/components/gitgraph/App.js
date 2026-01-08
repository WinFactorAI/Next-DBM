import 'antd/es/button/style/css'; // 为 Button 组件引入样式
import 'antd/es/collapse/style/css';
import 'antd/es/drawer/style/css';
import 'antd/es/select/style/css';
import 'antd/es/space/style/css';

import { React } from 'react';
import './App.css';
import GitPanle from './GitPanle';

function App () {
    return (
      <div className="App">
        <GitPanle></GitPanle>
      </div>
    );
 
}

export default App;
