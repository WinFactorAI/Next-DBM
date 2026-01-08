import { HashLoader } from 'react-spinners';

const Loading = ({ loading, message, szie }) => {
    if (!loading) return null; // 不加载时隐藏

    return (
        <div className='loading-container' >
            <HashLoader color="#6366f1" size={szie ? szie : 40} />
            {message && <div className='loading-text'>{message}</div>}
        </div>
    );
};

export default Loading;