import { Input } from 'antd';
import React from 'react';

// 用于格式化显示的逻辑（可选）
const formatText = (text) => {
  return text.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
};

const EnglishInput = (props) => {
  const { value, onChange } = props;

  // 处理输入改变的函数，允许只输入英文字符
  const handleChange = (e) => {
    const { value: inputValue } = e.target;
    const reg = /^[a-zA-Z\s]*$/; // 只允许英文字符和空格
    if (reg.test(inputValue) || inputValue === '') {
      onChange(inputValue);
    }
  };

  // 当输入框失去焦点时调用
  const handleBlur = () => {
    let valueTemp = value || '';
    onChange(valueTemp.trim()); // 去除首尾空格
  };

  // Tooltip 显示内容
  const title = value ? (
    <span className="english-input-title">
      {value !== '-' ? formatText(value) : '-'}
    </span>
  ) : (
    '请输入英文名'
  );

  return (
    // <Tooltip trigger={['focus']} title={title} placement="topLeft" overlayClassName="english-input">
      <Input
        {...props}
        onChange={handleChange}
        onBlur={handleBlur}
        placeholder="请输入英文名"
        maxLength={20}  
        allowClear
      />
    // </Tooltip>
  );
};

export default EnglishInput;