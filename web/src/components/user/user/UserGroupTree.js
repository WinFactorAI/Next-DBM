import { Input, Tree } from 'antd';
import i18next from 'i18next';
import React, { useEffect, useMemo, useState } from 'react';
import userGroupApi from '../../../api/user-group';

const { Search } = Input;

const UserGroupTree = ({
    onSelect,

}) => {
    const [expandedKeys, setExpandedKeys] = useState([]);
    const [searchValue, setSearchValue] = useState('');
    const [autoExpandParent, setAutoExpandParent] = useState(true);
    const [defaultData, setDefaultData] = useState([]);
    const [dataList, setDataList] = useState([]);


    // 获取初始数据
    useEffect(() => {
        userGroupApi.getAll().then(res => {
            const formattedData = formatTreeData(res);
            setDefaultData(formattedData);
        });
    }, []);

    // 生成扁平化数据列表用于搜索
    useEffect(() => {
        if (defaultData.length > 0) {
            const list = [];
            const generateList = (data) => {
                data.forEach(node => {
                    list.push({ key: node.key, title: node.title });
                    if (node.children) {
                        generateList(node.children);
                    }
                });
            };
            generateList(defaultData);
            setDataList(list);
        }
    }, [defaultData]);

    // 格式化API返回的数据结构
    const formatTreeData = (nodes) => {
        return nodes.map(node => ({
            key: node.id.toString(),
            title: node.name,
            children: node.subItems ? formatTreeData(node.subItems) : null
        }));
    };

    const getParentKey = (key, tree) => {
        let parentKey;
        for (let i = 0; i < tree.length; i++) {
            const node = tree[i];
            if (node.children) {
                if (node.children.some(item => item.key === key)) {
                    return node.key;
                }
                parentKey = getParentKey(key, node.children);
                if (parentKey) return parentKey;
            }
        }
        return parentKey;
    };

    const onExpand = (newExpandedKeys) => {
        setExpandedKeys(newExpandedKeys);
        setAutoExpandParent(false);
    };

    const onChange = (e) => {
        const { value } = e.target;
        const newExpandedKeys = dataList
            .map((item) => {
                if (item.title.includes(value)) {
                    return getParentKey(item.key, defaultData);
                }
                return null;
            })
            .filter((item, i, self) => item && self.indexOf(item) === i);

        setExpandedKeys(newExpandedKeys);
        setSearchValue(value);
        setAutoExpandParent(true);
    };

    const treeData = useMemo(() => {
        const loop = (data) => data.map((item) => {
            const { title, key } = item;
            const index = title.indexOf(searchValue);
            const beforeStr = title.substring(0, index);
            const afterStr = title.slice(index + searchValue.length);

            return {
                key,
                title: index > -1 ? (
                    <span>
                        {beforeStr}
                        <span style={{ color: '#f50' }}>{searchValue}</span>
                        {afterStr}
                    </span>
                ) : (
                    <span>{title}</span>
                ),
                children: item.children && loop(item.children)
            };
        });

        return defaultData.length ? loop(defaultData) : [];
    }, [searchValue, defaultData]);

    return (
        <div>
            <Search
                style={{ marginBottom: 8 }}
                placeholder={i18next.t('user.userGroup.search')}
                onChange={onChange}
                allowClear
            />
            <Tree
                showLine={
                    true && {
                        showLeafIcon: false,
                    }
                }
                showIcon={true}
                onExpand={onExpand}
                expandedKeys={expandedKeys}
                autoExpandParent={autoExpandParent}
                treeData={treeData}
                // selectable={false}
                onClick={(e, node) => {
                    // 自定义点击逻辑
                    // console.log('Clicked node:', node);
                    onSelect(node)
                    // 如果需要展开/折叠功能，可以手动控制
                    if (expandedKeys.includes(node.key)) {
                        setExpandedKeys(expandedKeys.filter(k => k !== node.key));
                    } else {
                        setExpandedKeys([...expandedKeys, node.key]);
                    }
                }}
            />
        </div>
    );
};

export default UserGroupTree;