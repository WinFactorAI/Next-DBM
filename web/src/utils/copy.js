import { CopyOutlined } from '@ant-design/icons';
import { Button, message, Tooltip } from 'antd';
import i18next from 'i18next';
import { useRef } from 'react';
const SimpleCopy = ({ text ,isShow = true }) => {
    const inputRef = useRef(null);

    const copy = () => {
        try {
            // 创建隐藏输入框
            const input = inputRef.current;
            input.value = text.replace(/\n/g, '');
            input.select();

            // 执行复制
            document.execCommand('copy');
            message.success(i18next.t('sqlLog.action.copy.success'));
        } catch {
            message.error(i18next.t('sqlLog.action.copy.failure'));
        }
    };

    return (
        <>
            <input
                type="text"
                ref={inputRef}
                style={{ position: 'absolute', left: '-9999px' }}
                readOnly
            />
            <Tooltip
                title={i18next.t('sqlLog.action.copy')}
                mouseEnterDelay={0.5}
                overlayClassName="copy-tooltip"
            >
                <span className="text-selected" onClick={copy}>{ isShow && text} <Button icon={<CopyOutlined />} size="small" type="link"></Button></span>
            </Tooltip>
        </>
    );
};

// 使用示例
// export default () => <SimpleCopy text="要复制的文本" />;
export default SimpleCopy;