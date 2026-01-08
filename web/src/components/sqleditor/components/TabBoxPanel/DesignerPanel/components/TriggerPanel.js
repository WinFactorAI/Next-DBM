import { HolderOutlined } from '@ant-design/icons';
import { DndContext } from '@dnd-kit/core';
import { restrictToVerticalAxis } from '@dnd-kit/modifiers';
import {
  arrayMove,
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Button, Checkbox, Form, Input, InputNumber, Popconfirm, Select, Space, Table, Typography } from 'antd';
import React, { forwardRef, useContext, useEffect, useImperativeHandle, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import MonacoEditor from 'react-monaco-editor';
import SplitPane from 'react-split-pane';
import { debugLog } from "../../../../../../common/logger";
import { VisibilityContext } from '../../../Utils/visibilityProvider';

const RowContext = React.createContext({});
const DragHandle = () => {
  const { setActivatorNodeRef, listeners } = useContext(RowContext);
  return (
    <Button
      type="text"
      size="small"
      icon={<HolderOutlined />}
      style={{
        cursor: 'move',
      }}
      ref={setActivatorNodeRef}
      {...listeners}
    />
  );
};

const Row = (props) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    setActivatorNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: props['data-row-key'],
  });
  const style = {
    ...props.style,
    transform: CSS.Translate.toString(transform),
    transition,
    ...(isDragging
      ? {
        position: 'relative',
        zIndex: 9999,
      }
      : {}),
  };
  const contextValue = useMemo(
    () => ({
      setActivatorNodeRef,
      listeners,
    }),
    [setActivatorNodeRef, listeners],
  );
  return (
    <RowContext.Provider value={contextValue}>
      <tr {...props} ref={setNodeRef} style={style} {...attributes} />
    </RowContext.Provider>
  );
};
const TriggerPanel = forwardRef((props, ref) => {
  // debugLog(" initialData ",initialData)
  const {
    getDist,
    percentToPx
  } = useContext(VisibilityContext);
  const [form] = Form.useForm();
  const [triggerSql, setTriggerSql] = useState('');
  const [dataSource, setDataSource] = useState([]);
  useEffect(() => {
    debugLog(" initialData ", props.triggerData)
    setDataSource(props.triggerData)
  }, [props.triggerData])

  const onDragEnd = ({ active, over }) => {
    if (active.id !== over?.id) {
      setDataSource((prevState) => {
        const activeIndex = prevState.findIndex((record) => record.key === active?.id);
        const overIndex = prevState.findIndex((record) => record.key === over?.id);
        return arrayMove(prevState, activeIndex, overIndex);
      });
    }
  };
  const handleChange = (value) => {
    debugLog(`selected ${value}`);
  };


  // const [data, setData] = useState(initialData);
  const [editingKey, setEditingKey] = useState('');
  const isEditing = (record) => record.key === editingKey;
  const columns = [
    {
      key: 'sort',
      align: 'center',
      width: 40,
      render: () => <DragHandle />,
    },
    {
      title: '名',
      dataIndex: 'name',
      inputType: 'text',
      editable: true,
      width: 220,
    },
    {
      title: '时间',
      dataIndex: 'triggerTimeType',
      inputType: 'select',
      distType: 'TriggerTimeType',
      editable: true,
      width: 220,
    },
    {
      title: '事件',
      dataIndex: 'triggerActionType',
      inputType: 'select',
      distType: 'TriggerActionType',
      editable: true,
    },
    {
      title: '操作',
      dataIndex: 'operation',
      width: 150,
      render: (_, record) => {
        const editable = isEditing(record);
        return editable ? (
          <Space>
            <Typography.Link
              onClick={() => save(record.key)}
            >
              保存
            </Typography.Link>
            <Popconfirm title="确定取消编辑?"
              okText='确定'
              cancelText='取消'
              onConfirm={cancel}>
              <a>取消</a>
            </Popconfirm>
            <Popconfirm title="确定取消吗?"
              okText='确定'
              cancelText='取消'
              onConfirm={() => del(record)}>
              <Typography.Link type='danger' onClick={event => { event.stopPropagation() }}>
                删除
              </Typography.Link>
            </Popconfirm>
          </Space>
        ) : (
          <Space>
            <Typography.Link disabled={editingKey !== ''} onClick={event => edit(record, event)}>
              编辑
            </Typography.Link>
            <Popconfirm title="确定取消吗?"
              okText='确定'
              cancelText='取消'
              onConfirm={() => del(record)}>
              <Typography.Link disabled={editingKey !== ''} type='danger' onClick={event => { event.stopPropagation() }}>
                删除
              </Typography.Link>
            </Popconfirm>
          </Space>
        );
      },
    },
  ];

  useImperativeHandle(ref, () => ({
    add: (record) => {
      if (editingKey && dataSource.length > 0) {
        toast.error('请先完成添加操作');
        return
      }
      setDataSource(prevState => [...prevState, record])
      form.setFieldsValue({
        name: '',
        triggerTimeType: '',
        triggerActionType: '',
        sql: '',
        ...record,
      });
      setEditingKey(record.key);
      onSelectChange(record, selectedRowKey !== record.key, null);
    }
  }));

  // 选择行
  const [selectedRowKey, setSelectedRowKey] = useState(null);
  const [selectedRow, setSelectedRow] = useState(null);
  const [targgerSql, setTarggerSql] = useState(null);

  // 获取选择行查询对应的属性
  useEffect(() => {
    if (selectedRowKey) {
      dataSource.filter(item => item.key === selectedRowKey).map(item => {
        setSelectedRow(item)
        setTarggerSql(item.sql)
      })
    } else {
      setSelectedRow(null)
      setTarggerSql(null)
    }
  }, [selectedRowKey])

  useEffect(() => {
    // 当 dataSource 更新时，检查 selectedRow 是否需要更新
    const updatedRow = dataSource.find(item => item.key === selectedRowKey);
    setSelectedRow(updatedRow);
  }, [dataSource]);

  useEffect(() => {

  }, [targgerSql]);
  const handleBlur = () => {
    const newData = [...dataSource];
    const index = newData.findIndex((item) => selectedRow.key === item.key);
    if (index > -1) {
      const item = newData[index];
      newData.splice(index, 1, {
        ...item,
        sql: targgerSql,
      });
      props.updateData(newData)
    }
  };
  const edit = (record, event) => {
    event.stopPropagation()
    form.setFieldsValue({
      name: '',
      triggerTimeType: '',
      triggerActionType: '',
      sql: '',
      ...record,
    });
    setEditingKey(record.key);
  };
  const cancel = () => {
    setEditingKey('');
  };
  const save = async (key) => {
    try {
      const row = await form.validateFields();
      const newData = [...dataSource];
      const index = newData.findIndex((item) => key === item.key);
      if (index > -1) {
        const item = newData[index];
        // 特殊处理checkbox 数据
        // columns.map((columnsItem) => {
        //   if(columnsItem.inputType === 'checkbox'){
        //     row[`${columnsItem.dataIndex}`] = item[`${columnsItem.dataIndex}`]
        //   }
        // })
        newData.splice(index, 1, {
          ...item,
          ...row,
        });
        debugLog(" save newData", newData)
        debugLog(" save newData[index]", newData[index])
        setDataSource(newData)
        setEditingKey('');
        props.updateData(newData)
      } else {
        newData.push(row);
        setDataSource(newData)
        setEditingKey('');
        props.updateData(newData)
      }

    } catch (errInfo) {
      debugLog('Validate Failed:', errInfo);
    }
  };
  const del = (record) => {
    //删除行
    const newData = dataSource.filter((item) => item.key !== record.key);
    setDataSource(newData)
    props.updateData(newData)
  };
  const EditableCell = ({
    editing,
    dataIndex,
    title,
    inputType,
    record,
    index,
    width,
    distType,
    rules,
    children,
    ...restProps
  }) => {
    // 更新form 数据
    const handleChange = (event, dataIndex, form) => {
      const { value } = event.target;
      form.setFieldsValue({
        [dataIndex]: value,
      });
    };

    return (
      <td {...restProps}>
        {editing ? (
          <div>
            {inputType === 'number' &&
              <Form.Item name={dataIndex} rules={rules} style={{ margin: 0, }}>
                <InputNumber defaultValue={record[`${dataIndex}`]} onChange={(value) => handleChange({ target: { value } }, dataIndex, form)} size='small' style={{ width: width, }} allowClear />
              </Form.Item>
            }

            {inputType === 'text' &&
              <Form.Item name={dataIndex} rules={rules} style={{ margin: 0, }}>
                <Input defaultValue={record[`${dataIndex}`]} onChange={(e) => handleChange(e, dataIndex, form)} size='small' style={{ width: width, }} allowClear />
              </Form.Item>
            }
            {inputType === 'select' &&
              <Form.Item name={dataIndex} rules={rules} style={{ margin: 0, }}>
                <Select defaultValue={record[`${dataIndex}`]} size='small'
                  showSearch
                  style={{ width: width }}
                  // onChange={handleChange} 
                  onChange={(value) => handleChange({ target: { value } }, dataIndex, form)}
                  options={getDist(distType)}
                  optionFilterProp="label"
                  filterSort={(optionA, optionB) =>
                    (optionA?.label ?? '').toLowerCase().localeCompare((optionB?.label ?? '').toLowerCase())
                  }
                  allowClear />
              </Form.Item>
            }
            {inputType === 'checkbox' &&
              <Form.Item valuePropName="checked" name={dataIndex} rules={rules} style={{ margin: 0, }}>
                <Checkbox size='small'
                  checked={record[`${dataIndex}`]}
                  onChange={(e) => handleChange({ target: { value: e.target.checked } }, dataIndex, form)}
                // onChange={handleCheckboxChange}
                >{record[`${dataIndex}`]}</Checkbox>
              </Form.Item>
            }
          </div>
        ) : (
          children
        )}
      </td>
    );
  };

  const mergedColumns = columns.map((col) => {
    // debugLog(" col ",col)
    if (!col.editable) {
      return col;
    }

    return {
      ...col,
      onCell: (record) => ({
        record,
        inputType: col.inputType,
        dataIndex: col.dataIndex,
        title: col.title,
        with: col.width,
        distType: col.distType,
        col: col,
        rules: col.rules,
        editing: isEditing(record),
      }),
    };
  });

  //选择行 if (selectedRowKey === record.key) 
  const onSelectChange = (record, selected) => {
    if (selected) {
      setSelectedRowKey(record.key);
      setSelectedRow(record)
    } else {
      setSelectedRowKey(null);
      setSelectedRow(null);
    }
    debugLog(" selectedRow ", selectedRow)
  };

  const onRow = record => {
    return {
      onClick: event => {
        if (!editingKey) {
          // 阻止默认的行选择行为
          event.stopPropagation();
          onSelectChange(record, selectedRowKey !== record.key, null);
        }
      },
    };
  };
  //  底部编辑器
  const editableRef = React.createRef();
  const tableRef = React.createRef();
  const change = (size) => {
    localStorage.setItem('splitTriggerPanelSQLEditorPos', size);
    debugLog(" size ", size)
    const Hhight = window.innerHeight;
    const firstPaneHeight = percentToPx(size[0], Hhight);
    const threadPaneHeight = percentToPx(size[1], Hhight);
    debugLog(" firstPaneHeight ", firstPaneHeight)
    debugLog(" threadPaneHeight ", threadPaneHeight)
    if (tableRef.current) {
      tableRef.current.style.height = `${firstPaneHeight}px`;
    }
    if (editableRef.current) {
      editableRef.current.style.height = `${threadPaneHeight - 140}px`;
    }
  }

  useEffect(() => {
    const size = localStorage.getItem('splitTriggerPanelSQLEditorPos')
    if (size) {
      const Hhight = window.innerHeight;
      const firstPaneHeight = percentToPx(size.split(',')[0], Hhight);
      const threadPaneHeight = percentToPx(size.split(',')[1], Hhight);
      debugLog(" firstPaneHeight ", firstPaneHeight)
      debugLog(" threadPaneHeight ", threadPaneHeight)
      tableRef.current.style.height = `${firstPaneHeight}px`;
      editableRef.current.style.height = `${threadPaneHeight - 140}px`;
    } else {
      localStorage.setItem('splitTriggerPanelSQLEditorPos', ['20%', '80%']);
    }
  }, [props.initialData]);

  const editorOptions = {
    // 不显示迷你地图
    minimap: {
      enabled: false
    },
    // 启用SQL语法高亮和关键字提示
    language: 'text',
    autoClosingBrackets: 'always',
    quickSuggestions: true,
    suggestOnTriggerCharacters: true,
    // 启用自动完成功能
    autoClosingBrackets: true,
    autoClosingQuotes: true,
    automaticLayout: true,
    quickSuggestions: {
      strings: true,
      other: true,
      comments: false
    },
    readOnly: false,
    // 其他选项...
  };
  const [theme, setTheme] = useState(localStorage.getItem('theme'));
      useEffect(() => {
          const updateTheme = () => {
              let theme = localStorage.getItem('theme');
              setTheme(theme)
          };
          updateTheme();
          const intervalId = setInterval(updateTheme, 3000);
          return () => clearInterval(intervalId);
  }, []);
  return (
    <SplitPane
      className="height100vh1"
      split="horizontal"
      initialSize={'40%,60%'}
      onChange={change} >
      <div ref={tableRef} initialSize={'40%'} minSize="160px" maxSize="80%" style={{ overflow: 'auto' }}>
        <Form form={form} component={false}>
          <DndContext modifiers={[restrictToVerticalAxis]} onDragEnd={onDragEnd}>
            <SortableContext items={dataSource?.map((i) => i.key)} strategy={verticalListSortingStrategy}>
              <Table
                rowKey="key"
                components={{
                  body: {
                    row: Row,
                    cell: EditableCell,
                  },
                }}
                columns={mergedColumns}
                dataSource={dataSource}
                rowClassName="editable-row"
                size='small'
                rowSelection={{
                  selectedRowKeys: [selectedRowKey],
                  onChange: (selectedRowKeys, selectedRows) => {
                    setSelectedRowKey(selectedRowKeys[0]);
                  },
                }}
                onRow={onRow}
                pagination={false}
              // scroll={{ y: tableHeight }} 
              // pagination={{
              //   onChange: cancel,
              // }}
              />
            </SortableContext>
          </DndContext>
        </Form>
      </div>
      <div ref={editableRef} initialSize={'60%'} minSize="320px" className='trigger-panel-editor' >
        <div className='ml-1 title'>触发器语句</div>
        {selectedRow != null && <MonacoEditor
          width="100%"
          height="100%"
          theme={ theme === 'dark' ? 'vs-dark' : 'vs'}  
          language="sql"
          options={editorOptions}
          value={targgerSql}
          onChange={newValue => {
            setTarggerSql(newValue)
            handleBlur()
          }}
        // editorDidMount={editorDidMountHandle}
        />}
      </div>
    </SplitPane>
  );
});
export default TriggerPanel;