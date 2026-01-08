import { AppstoreOutlined } from '@ant-design/icons';
import { Cascader } from 'antd';
import { useContext, useEffect, useState } from "react";
import { debugLog } from "../../../../../common/logger";
import { VisibilityContext } from '../../Utils/visibilityProvider';

{/* <AppstoreAddOutlined /> */ }
function FilterSqlEditor(props) {
  const { tabs, tabIndex,
    treeData,
    utilsCutStringAtDash,
    utilsFindNodeByKey,
    getSQLConverter,
    webSocketSendData,
    protocolType,
    setOperationLabel
  } = useContext(VisibilityContext);

  const [options, setOptions] = useState([]);
  const [defaultValue, setDefaultValue] = useState([props.tabItem.title.split('.')[0], 'tables', props.tabItem.title.split('.')[1]]);
  useEffect(() => {

  }, [defaultValue])
  const convertDataToCascaderOptions = (data) => {
    return data.map(parent => {
      const hasChildren = parent.menuType !== 'tableMenu' && parent.children && parent.children.length > 0;
      return {
        label: parent.title,
        value: parent.title,
        type: parent.menuType,
        node: parent,
        // 如果有子级，递归调用自身，否则不生成 children
        children: hasChildren ? convertDataToCascaderOptions(parent.children) : undefined,
        isLeaf: parent.menuType == 'tableMenu', // 继续标记为非叶子节点
      };
    });
  };
  useEffect(() => {
    let operationData = convertDataToCascaderOptions(treeData)
    setOptions(operationData);
    let selectedOptions = []
    operationData.forEach(opItem => {
      // debugLog(" ## defaultValue[0] ",defaultValue[0])

      if (opItem.value == defaultValue[0]) {
        // debugLog(" ## operationData ### opItem ",opItem)
        opItem.children.forEach(childItem => {
          if (childItem.value == defaultValue[1]) {
            childItem.children.forEach(grandsonItem => {
              if (grandsonItem.value == defaultValue[2]) {
                // debugLog(" ##@@ operationData opItem ",opItem)
                // debugLog(" ##@@ operationData childItem ",childItem)
                // debugLog(" ##@@ operationData grandsonItem ",grandsonItem)
                selectedOptions.push(opItem)
                selectedOptions.push(childItem)
                selectedOptions.push(grandsonItem)
              }
            })
          }
        })
      }
    })
    // debugLog(" ## operationData ",operationData)
    onChangeSrc(" ## 初始化数据 ", [selectedOptions])
  }, [treeData]);
  const onChangeSrc = (value, selectedOptions) => {
    debugLog(" onChangeSrc ", value, selectedOptions);
    props.tabItem.srcObjArry = selectedOptions;
    setOperationLabel("选择源库表")
  };
  const onChangeDis = (value, selectedOptions) => {
    debugLog(" onChangeDis ", value, selectedOptions);
    props.tabItem.disObjArry = selectedOptions;
    setOperationLabel("选择目标库表")
  };
  const loadData = (selectedOptions) => {
    const info = selectedOptions[selectedOptions.length - 1];
    // targetOption.loading = true;
    // debugLog(" loadData info ",info);
    if (info.type == "tablesMenu") {
      // 请求表数据等待返回
      let database = null
      let tableName = null
      if (info.node.menuType == 'tablesMenu' || info.node.menuType == 'viewsMenu' || info.node.menuType == 'functionsMenu' || info.node.menuType == 'proceduresMenu' || info.node.menuType == 'sqlsMenu') {
        const databaseKey = utilsCutStringAtDash(info.node.key, -1);
        database = utilsFindNodeByKey(treeData, databaseKey)
      }
      else if (info.node.menuType == 'columnsMenu' || info.node.menuType == 'keysMenu' || info.node.menuType == 'indexsMenu') {
        const databaseKey = utilsCutStringAtDash(info.node.key, 2)
        database = utilsFindNodeByKey(treeData, databaseKey)
        const tableKey = utilsCutStringAtDash(info.node.key, -1);
        tableName = utilsFindNodeByKey(treeData, tableKey)
      }
      // 获取查询指令
      const sqlStr = getSQLConverter(protocolType, "getAll" + info.node.menuType, {
        database: database.title,
        tableName: tableName?.title
      })
      // debugLog(" sqlStr ",sqlStr)
      if (sqlStr) {
        webSocketSendData({
          "key": info.node.key,
          "retType": info.node.menuType,
          "data": sqlStr,
          "attr": {
            database: database.title,
            tableName: tableName?.title,
            timestamp: new Date().getTime(),
            sqlCommand: sqlStr,
          }
        });
      }
    }
    setOptions([...options]);
  };

  return (
    <div className="aceEditor-box w-full bg-gray-200 SQLDiffEditorPanel-FilterSelect">
      <div className="filterSqlEditor-left">
        <div className="icon"><AppstoreOutlined /></div>
        <div className="text">源库表</div>
        <div className="input">
          <Cascader
            showCheckedStrategy={Cascader.SHOW_CHILD}
            defaultValue={defaultValue}
            loadData={loadData}
            options={options}
            onChange={onChangeSrc}
            onFocus={() => {
                setOperationLabel("选择源库表")
              }
            }
            multiple
            maxTagCount="responsive"
            size='small'
            placeholder="请选择源库表"
          />
        </div>
      </div>
      <div className='filterSqlEditor-right'>
        <div className="icon"><AppstoreOutlined /></div>
        <div className="text">目标库表</div>
        <div className="input">
          <Cascader
            loadData={loadData}
            options={options}
            onChange={onChangeDis}
            showCheckedStrategy={Cascader.SHOW_CHILD}
            onFocus={() => {
                setOperationLabel("选择目标库表")
              }
            }
            multiple
            maxTagCount="responsive"
            size='small'
            placeholder="请选择目标库表"
          />
        </div>
      </div>
    </div>
  );
}

export default FilterSqlEditor;
