import { HolderOutlined, PlusOutlined } from '@ant-design/icons';
import { DndContext } from '@dnd-kit/core';
import { restrictToVerticalAxis } from '@dnd-kit/modifiers';
import {
  arrayMove,
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Button, Checkbox, Divider, Form, Input, InputNumber, Popconfirm, Select, Space, Table, Typography } from 'antd';
import React, { forwardRef, useContext, useEffect, useImperativeHandle, useMemo, useRef, useState } from 'react';
import toast from 'react-hot-toast';
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
const IndexPanel = forwardRef((props, ref) => {
  // debugLog(" initialData ",initialData)
  const {
    // SQL_EDIT_MODE,
    // tableTreePanelSize,
    // propertiesPanelSize,
    getDist,
    percentToPx
  } = useContext(VisibilityContext);

  const [form] = Form.useForm();
  const [IndexPanelAttr, setIndexPanelAttr] = useState(getDist('IndexPanelAttr'))

  const [dataSource, setDataSource] = useState([]);
  useEffect(() => {
    debugLog(" initialData ", props.indexData)
    setDataSource(props.indexData)
  }, [props.indexData])

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
      title: '字段',
      dataIndex: 'fileds',
      inputType: 'select',
      distType: 'props.fieldData',
      mode: 'multiple',
      editable: true,
      width: 300,
      render: (fields, record) => (
        <div>
          {Array.isArray(fields) ? (
            fields.map((field, index) => (
              <span key={index}>{field}{index !== fields.length - 1 ? ', ' : ''}</span>
            ))
          ) : (
            <span>{fields}</span>
          )}
        </div>
      ),
    },
    {
      title: '索引类型',
      dataIndex: 'indexType',
      inputType: 'select',
      distType: 'IndexType',
      editable: true,
      width: 200,
    },
    {
      title: '索引方法',
      dataIndex: 'indexFunction',
      inputType: 'select',
      distType: 'IndexFunction',
      editable: true,
      width: 100,
    },
    {
      title: '注释',
      dataIndex: 'remark',
      inputType: 'text',
      editable: true
    },
    {
      title: '操作',
      dataIndex: 'operation',
      width: 150,
      render: (_, record) => {
        const editable = isEditing(record);
        return editable ? (
          <Space>
            <Typography.Link onClick={() => save(record.key)}>
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
        fileds: [],
        indexType: '',
        indexFunction: '',
        remark: '',
        ...record,
      });
      setEditingKey(record.key);
      onSelectChange(record, selectedRowKey !== record.key, null);
    }
  }));

  // 选择行
  const [selectedRowKey, setSelectedRowKey] = useState(null);
  const [selectedRow, setSelectedRow] = useState(null);
  const edit = (record, event) => {
    event.stopPropagation()
    form.setFieldsValue({
      name: '',
      fileds: [],
      indexType: '',
      indexFunction: '',
      remark: '',
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
    mode,
    col,
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
                  mode={mode}
                  showSearch
                  style={{ width: width }}
                  // onChange={handleChange} 
                  onChange={(value) => handleChange({ target: { value } }, dataIndex, form)}
                  options={getSelectOptions(col)}
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
        mode: col.mode ? col.mode : '',
        col: col,
        rules: col.rules,
        editing: isEditing(record),
      }),
    };
  });


  const formItemLayout = {
    labelCol: {
      xs: {
        span: 24,
      },
      sm: {
        span: 2,
      },
    },
    wrapperCol: {
      xs: {
        span: 24,
      },
      sm: {
        span: 4,
      },
    },
  };

  //处理级联特殊处理。
  const getSelectOptions = (record) => {
    debugLog(" record ", record)
    // 查询Filed数据
    if (record.distType === 'props.fieldData') {
      debugLog(" props.fieldData ", props.fieldData)
      return props.fieldData.map(item => ({
        value: item.name,
        label: item.name + " - " + item.comment,
      }))
    } else {
      //获取字典dist
      return getDist(record.distType)
    }
  }

  //选择行
  const onSelectChange = (record, selected) => {
    if (selected) {
      setSelectedRowKey(record.key);
      setSelectedRow(record)
    } else if (selectedRowKey === record.key) {
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
  const attrRef = React.createRef();
  const tableRef = React.createRef();
  const change = (size) => {
    localStorage.setItem('splitIndexPanelAttrPos', size);
    debugLog(" size ", size)
    const Hhight = window.innerHeight;
    const firstPaneHeight = percentToPx(size[0], Hhight);
    const threadPaneHeight = percentToPx(size[1], Hhight);
    debugLog(" firstPaneHeight ", firstPaneHeight)
    debugLog(" threadPaneHeight ", threadPaneHeight)
    if (tableRef.current) {
      tableRef.current.style.height = `${firstPaneHeight}px`;
    }
    if (attrRef.current) {
      attrRef.current.style.height = `${threadPaneHeight - 140}px`;
    }
  }

  useEffect(() => {
    const size = localStorage.getItem('splitIndexPanelAttrPos')
    if (size) {
      const Hhight = window.innerHeight;
      const firstPaneHeight = percentToPx(size.split(',')[0], Hhight);
      const threadPaneHeight = percentToPx(size.split(',')[1], Hhight);
      debugLog(" firstPaneHeight ", firstPaneHeight)
      debugLog(" threadPaneHeight ", threadPaneHeight)
      tableRef.current.style.height = `${firstPaneHeight}px`;
      attrRef.current.style.height = `${threadPaneHeight - 140}px`;
    } else {
      localStorage.setItem('splitIndexPanelAttrPos', ['20%', '80%']);
    }
  }, [props.initialData]);

  // 枚举选择效果
  let index = 0;
  const [items, setItems] = useState([]);
  const [name, setName] = useState('');
  const inputRef = useRef(null);
  const onNameChange = (event) => {
    setName(event.target.value);
  };
  const addItem = (e) => {
    e.preventDefault();
    setItems([...items, name || `New item ${index++}`]);
    setName('');
    setTimeout(() => {
      inputRef.current?.focus();
    }, 0);
  };

  const handleInputChange = (value) => {
    debugLog(`Value changed for  :`, value);
    // 在这里处理值的变化，例如更新状态或执行其他操作
  };
  return (
    <SplitPane
      className="height100vh1"
      split="horizontal"
      initialSize={'40%,60%'}
      onChange={change} >
      <div ref={tableRef} initialSize={'40%'} minSize="160px" maxSize="80%" style={{overflow: 'auto'}}>
        <Form form={form} component={false}>
          <DndContext modifiers={[restrictToVerticalAxis]} onDragEnd={onDragEnd}>

            <SortableContext items={dataSource.map((i) => i.key)} strategy={verticalListSortingStrategy}>
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
                size='small'
                // scroll={{ y: props.currentHeight-400 }} 
                pagination={false}
                rowSelection={{
                  selectedRowKeys: [selectedRowKey],
                  onChange: (selectedRowKeys, selectedRows) => {
                    setSelectedRowKey(selectedRowKeys[0]);
                  },
                }}
                onRow={onRow}
              />
            </SortableContext>

          </DndContext>
        </Form>
      </div>
      <div ref={attrRef} initialSize={'60%'} minSize="320px" className='trigger-panel-editor' >
        <div className='ml-1 title'>索引扩展</div>
        <Form form={form} {...formItemLayout} component={false}>
          {selectedRowKey && IndexPanelAttr?.map((attrObj, index) => {
            const handleInputChange = (value) => {
              debugLog(`Value changed for  selectedRow :`, selectedRow);
              debugLog(`Value changed for ${attrObj.label} ${attrObj.distType} :`, value);
              setSelectedRow({
                ...selectedRow,
                [attrObj.distType]: value,
              });

              const newData = [...dataSource];
              const index = newData.findIndex((item) => selectedRow.key === item.key);
              if (index > -1) {
                const item = newData[index];
                newData.splice(index, 1, {
                  ...item,
                  [attrObj.distType]: value,
                });
                debugLog(" save newData", newData)
                // setData(newData);
                setDataSource(newData)
                props.updateData(newData)
              }

              // 在这里处理值的变化，例如更新状态或执行其他操作
            };
            const getValue = () => {
              if (selectedRow) {
                debugLog(`selectedRow[attrObj.distType] for ${attrObj.label} ${attrObj.distType} :`, selectedRow[attrObj.distType])
                return selectedRow[attrObj.distType];
              } else {
                return '';
              }
            }

            const getOptions = (distType) => {
              // 根据 distType 获取选项列表的逻辑，可以通过 API 请求或其他方式获取
              return getDist(distType)
            };
            // 级联获取options
            const getFilteredOptions = (distType, dependencyValue) => {
              debugLog(`getFilteredOptions for   :`, dependencyValue);
              if (dependencyValue) {
                const options = getDist(distType, { charset: dependencyValue });
                return options
              }
              return []
            };

            if (attrObj.type === 'select') {
              return (
                <Form.Item key={index} label={attrObj.label} className="form-item-spacing" >
                  <Select options={attrObj.levelDistType
                    ? getFilteredOptions(attrObj.distType, selectedRow ? selectedRow[attrObj.levelDistType] : '')
                    : getOptions(attrObj.distType)}
                    placeholder={attrObj.placeholder}
                    onChange={handleInputChange}
                    value={getValue()}
                    allowClear size='small' />
                </Form.Item>
              );
            }
            else if (attrObj.type === 'text') {
              return (
                <Form.Item key={index} label={attrObj.label} className="form-item-spacing" >
                  <Input placeholder={attrObj.placeholder}
                    onChange={(e) => handleInputChange(e.target.value)}
                    value={getValue()}
                    allowClear size='small' />
                </Form.Item>
              );
            }
            else if (attrObj.type === 'number') {
              return (
                <Form.Item key={index} label={attrObj.label} className="form-item-spacing" >
                  <InputNumber placeholder={attrObj.placeholder}
                    onChange={handleInputChange}
                    value={getValue()}
                    size='small' />
                </Form.Item>
              );
            }
            else if (attrObj.type === 'checkbox') {
              return (
                <Form.Item key={index} label={attrObj.label} className="form-item-spacing" >
                  <Checkbox placeholder={attrObj.placeholder}
                    onChange={(e) => handleInputChange(e.target.checked)}
                    checked={getValue()}
                    size='small' />
                </Form.Item>
              );
            }
            else if (attrObj.type === 'selectAdd') {
              return (
                <Form.Item key={index} label={attrObj.label} className="form-item-spacing" >
                  <Select mode="multiple" placeholder={attrObj.placeholder}
                    onChange={handleInputChange}
                    value={getValue()}
                    allowClear size='small'
                    dropdownRender={(menu) => (
                      <>
                        {menu}
                        <Divider style={{ margin: '8px 0', }} />
                        <Space style={{ padding: '0 8px 4px', }}>
                          <Input
                            allowClear
                            placeholder={attrObj.placeholder}
                            value={name}
                            onChange={onNameChange}
                            onKeyDown={(e) => e.stopPropagation()}
                            size='small'
                          />
                          <Button type="text" icon={<PlusOutlined />} onClick={addItem} size='small'>
                            添加
                          </Button>
                        </Space>
                      </>
                    )}
                    options={items.map((item) => ({
                      label: item,
                      value: item,
                    }))}
                  />
                </Form.Item>
              )
            };
            return null;
          }
          )}
        </Form>
      </div>
    </SplitPane>
  );
});
export default IndexPanel;