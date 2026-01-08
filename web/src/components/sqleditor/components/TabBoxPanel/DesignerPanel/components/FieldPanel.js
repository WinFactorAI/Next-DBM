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
const { Text } = Typography;
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

const FieldPanel = forwardRef((props, ref) => {

  const {
    SQL_EDIT_MODE,
    getDist,
    getColumnsType,
    percentToPx
  } = useContext(VisibilityContext);

  const [form] = Form.useForm(); // 获取表单实例

  const [dataSource, setDataSource] = useState([]);
  useEffect(() => {
    // debugLog(" props.fieldData " ,props.fieldData )
    setDataSource(props.fieldData)
  }, [props.fieldData])

  const onDragEnd = ({ active, over }) => {
    if (active.id !== over?.id) {
      setDataSource((prevState) => {
        const activeIndex = prevState.findIndex((record) => record.key === active?.id);
        const overIndex = prevState.findIndex((record) => record.key === over?.id);
        return arrayMove(prevState, activeIndex, overIndex);
      });
    }
  };
  const [columnsType, setColumnsType] = useState()
  const [selectedValue, setSelectedValue] = useState('');

  useEffect(() => {
    // 当 columnsType 更新时，恢复保存的表单数据
    // debugLog(" useEffect columnsType ",columnsType)
    setColumnsType(getColumnsType(form.getFieldValue(['type'])))
  }, [form.getFieldValue('type')]);

  // const [data, setData] = useState(fieldData);
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
      rules: [
        {
          required: true,
          message: `请输入字段名称!`,
        },
      ]
    },
    {
      title: '类型',
      dataIndex: 'type',
      inputType: 'select',
      distType: 'ColumnsType',
      editable: true,
      width: 180,
      rules: [
        {
          required: true,
          message: `请选择字段类型!`,
        },
      ]
    },
    {
      title: '长度',
      dataIndex: 'len',
      inputType: 'number',
      editable: true,
      width: 100,
    },
    {
      title: '小数点',
      dataIndex: 'port',
      inputType: 'number',
      editable: true,
      width: 100,
    },
    {
      title: '是否允许为空',
      dataIndex: 'isNull',
      inputType: 'checkbox',
      render: (isActive) => (isActive ? 'Y' : 'N'),
      editable: true,
      width: 120,
    },
    {
      title: '键',
      dataIndex: 'isPrimaryKey',
      inputType: 'checkbox',
      render: (isActive) => (isActive ? 'Y' : 'N'),
      editable: true,
      width: 100,
    },
    {
      title: '注释',
      dataIndex: 'comment',
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
            <Button type="link" size='small'
              onClick={() => save(record.key)}>
              保存
            </Button>
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
              <Button danger type="link" size='small' onClick={event => { event.stopPropagation() }}>
                删除
              </Button>
            </Popconfirm>
          </Space>
        ) : (
          <Space>
            <Button type="link" size='small' disabled={editingKey !== ''} onClick={event => edit(record, event)}>
              编辑
            </Button>
            <Popconfirm title="确定取消吗?"
              okText='确定'
              cancelText='取消'
              onConfirm={() => del(record)}>
              <Button danger type="link" size='small' disabled={editingKey !== ''} onClick={event => { event.stopPropagation() }}>
                删除
              </Button>
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
        name: 'eee',
        type: '',
        len: 0,
        port: 0,
        isNull: false,
        isPrimaryKey: false,
        comment: '',
        ...record,
      });
      setEditingKey(record.key);
      onSelectChange(record, selectedRowKey !== record.key, null);
    }
  }));

  // 选择行
  const [selectedRowKey, setSelectedRowKey] = useState(null);
  const [selectedRow, setSelectedRow] = useState(null);
  // 获取选择行查询对应的属性
  useEffect(() => {
    // debugLog(" useEffect selectedRowKey " ,selectedRowKey)
    if (selectedRowKey) {
      const item = dataSource.find(item => item.key === selectedRowKey);
      // debugLog(" item.type ",item)
      if (item) {
        const columnsTypeOptions = getColumnsType(item.type)
        // debugLog(" columnsTypeOptions ",columnsTypeOptions)
        setColumnsType(columnsTypeOptions)
      }
    } else {
      setColumnsType(null);
      setSelectedRow(null);
    }
  }, [selectedRowKey])
  const edit = (record, event) => {
    event.stopPropagation()
    // debugLog(" edit record ",record) 
    // 开始编辑某一行
    form.resetFields(); // 重置表单字段
    form.setFieldsValue(record); // 设置表单字段的初始值为当前行的数据

    form.setFieldsValue({
      name: '2',
      type: '',
      len: 0,
      port: 0,
      isNull: false,
      isPrimaryKey: false,
      comment: '',
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
      // debugLog(" save row" ,row)
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
        // debugLog(" save row" ,row)
        // debugLog(" save item" ,item)
        // debugLog(" save newData" ,newData)
        // setData(newData);
        setDataSource(newData)
        setEditingKey('');
        props.updateData(newData)
      } else {
        // debugLog("save row else row ",row)
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
  //选择行
  const onSelectChange = (record, selected) => {
    if (selected) {
      setSelectedRowKey(record.key);
      setSelectedRow(record)
    } else {
      setSelectedRowKey(null);
      setSelectedRow(null);
    }
    // debugLog(" selectedRow ",selectedRow)
  };

  const onRow = record => {
    return {
      onClick: event => {
        // 阻止默认的行选择行为
        if (!editingKey) {
          // 阻止默认的行选择行为
          event.stopPropagation();
          onSelectChange(record, selectedRowKey !== record.key);
        }
      },
    };
  };

  //  底部编辑器
  const attrRef = React.createRef();
  const tableRef = React.createRef();
  const change = (size) => {
    localStorage.setItem('splitFieldPanelAttrPos', size);
    // debugLog(" size ",size)
    const Hhight = window.innerHeight;
    const firstPaneHeight = percentToPx(size[0], Hhight);
    const threadPaneHeight = percentToPx(size[1], Hhight);
    // debugLog(" change firstPaneHeight ",firstPaneHeight)
    // debugLog(" change threadPaneHeight ",threadPaneHeight)  
    if (tableRef.current) {
      tableRef.current.style.height = `${firstPaneHeight}px`;
    }
    if (attrRef.current && threadPaneHeight > 318) {
      attrRef.current.style.height = `${threadPaneHeight - 140}px`;
    }
  }

  useEffect(() => {
    const size = localStorage.getItem('splitFieldPanelAttrPos')
    if (size) {
      const Hhight = window.innerHeight;
      const firstPaneHeight = percentToPx(size.split(',')[0], Hhight);
      const threadPaneHeight = percentToPx(size.split(',')[1], Hhight);
      // debugLog(" inint firstPaneHeight ",firstPaneHeight)
      // debugLog(" inint threadPaneHeight ",threadPaneHeight)  
      tableRef.current.style.height = `${firstPaneHeight}px`;
      attrRef.current.style.height = `${threadPaneHeight - 140}px`;
    } else {
      localStorage.setItem('splitFieldPanelAttrPos', ['20%', '80%']);
    }
  }, [props.fieldData]);

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



  return (
    <SplitPane
      className="height100vh1"
      split="horizontal"
      initialSize={'40%,60%'}
      onChange={change} >
      <div ref={tableRef} initialSize={'40%'} minSize="160px" maxSize="80%" style={{overflow: 'auto'}}>
    
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
                // scroll={{ y: props.currentHeight }} 
                // pagination={{
                //   onChange: cancel,
                // }}
                />
              </SortableContext>

            </DndContext>
          </Form>
 
      </div>
      <div initialSize={'60%'} minSize="320px"  ref={attrRef} className='trigger-panel-editor'>
     
          <div className='ml-1 title'>属性扩展</div>
          <Form form={form} {...formItemLayout} component={false}>
            {columnsType?.attrs?.map((attrObj, index) => {
              const handleInputChange = (value) => {
                // debugLog(`Value handleInputChange for  selectedRow :`, selectedRow);
                // debugLog(`Value handleInputChange for ${attrObj.label} ${attrObj.distType} :`, value);
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
                  // debugLog(" handleInputChange newData" ,newData)
                  // setData(newData);
                  // setDataSource(newData)
                  props.updateData(newData)
                }

                // 在这里处理值的变化，例如更新状态或执行其他操作
              };
              const getValue = () => {
                if (selectedRow) {
                  // debugLog(`selectedRow[attrObj.distType] for ${attrObj.label} ${attrObj.distType} :`,selectedRow[attrObj.distType] )
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
                // debugLog(`getFilteredOptions for   :`, dependencyValue);
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
                              ref={inputRef}
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
export default FieldPanel;