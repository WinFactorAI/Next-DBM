import { Spin } from 'antd';
import React from 'react';
const Landing = () => {
    return (
        <div style={{
            // width: '100vw',
            // height: '100vh',
            width: '100%',
            height: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'white'
        }}>
            <Spin>
                <div style={{fontWeight: 'bold',marginTop:'40px'}}>正在努力加载中...</div>
            </Spin>
        </div>
    );
};

export default Landing;