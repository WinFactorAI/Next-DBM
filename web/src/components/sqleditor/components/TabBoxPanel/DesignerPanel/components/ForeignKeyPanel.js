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
const ForeignKeyPanel = forwardRef((props, ref) => {
  // debugLog(" initialData ",initialData)
  const { 
    SQL_EDIT_MODE,
    getDist,
    databaseList,setDatabaseList,
    tableList,setTableList,
    columnList,setColumnList
  } = useContext(VisibilityContext);

  const [form] = Form.useForm();
  const [dataSource, setDataSource] = useState([]);
  useEffect(() => {
    debugLog(" initialData " ,props.keysData )
    setDataSource(props.keysData)
  },[props.keysData])

  const onDragEnd = ({ active, over }) => {
    if (active.id !== over?.id) {
      setDataSource((prevState) => {
        const activeIndex = prevState.findIndex((record) => record.key === active?.id);
        const overIndex = prevState.findIndex((record) => record.key === over?.id);
        return arrayMove(prevState, activeIndex, overIndex);
      });
    }
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
      editable:true,
    },
    {
      title: '字段',
      dataIndex: 'field',
      inputType: 'select',
      distType:'props.fieldData',
      mode:'multiple',
      editable:true,
    },
    {
      title: '被引用的数据库',
      dataIndex: 'database',
      inputType: 'select',
      distType:'visibilityContext.databaseList',
      editable:true,
    },
    {
      title: '被引用的表',
      dataIndex: 'table',
      inputType: 'select',
      distType:'visibilityContext.tableList',
      editable:true,
    },
    {
      title: '被引用的字段',
      dataIndex: 'columns',
      inputType: 'select',
      distType:'visibilityContext.columnList',
      mode:'multiple',
      editable:true,
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
      title: '删除时',
      dataIndex: 'deleteActions',
      inputType: 'select',
      distType:'ForeigenKeyAction',
      editable:true,
    },
    {
      title: '更新时',
      dataIndex: 'updateActions',
      inputType: 'select',
      distType:'ForeigenKeyAction',
      editable:true
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
              onClick={() => save(record.key)} >
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
                <Typography.Link type='danger' onClick={event => {event.stopPropagation()}}>
                  删除
                </Typography.Link>
            </Popconfirm>
          </Space>
        ) : (
            <Space>
              <Typography.Link disabled={editingKey !== ''} onClick={() => edit(record)}>
                编辑
              </Typography.Link>
              <Popconfirm title="确定取消吗?" 
                okText='确定'
                cancelText='取消'
                onConfirm={() => del(record)}>
                <Typography.Link disabled={editingKey !== ''} type='danger'>
                  删除
                </Typography.Link>
              </Popconfirm>
            </Space>
        );
      },
    },
  ];

  useImperativeHandle(ref, () => ({
    add : (record) => {
      if(editingKey && dataSource.length > 0){
        toast.error('请先完成添加操作');
        return
      }
      setDataSource(prevState => [...prevState, record])
      form.setFieldsValue({
        name:'',
        filed:'',
        table:'',
        columns:[],
        deleteActions:'',
        updateActions:'',
        ...record,
      });
      setEditingKey(record.key);
    }
  }));
  const edit = (record) => {
    form.setFieldsValue({
      name:'',
      filed:'',
      table:'',
      columns:[],
      deleteActions:'',
      updateActions:'',
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
        debugLog(" save newData" ,newData)
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
  const del = (record) =>{
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
              <InputNumber defaultValue={record[`${dataIndex}`]} onChange={(value) => handleChange({ target: { value } }, dataIndex, form)} size='small' style={{ width: width, }} allowClear/>
            </Form.Item>
          }
          
          {inputType === 'text' &&  
            <Form.Item  name={dataIndex} rules={rules} style={{ margin: 0, }}>
              <Input defaultValue={record[`${dataIndex}`]} onChange={(e) => handleChange(e, dataIndex, form)} size='small' style={{ width: width, }} allowClear/>
            </Form.Item>
          }
          {inputType === 'select' && 
            <Form.Item  name={dataIndex} rules={rules} style={{ margin: 0, }}>
              <Select defaultValue={record[`${dataIndex}`]} size='small'
              mode={mode}
              showSearch
              style={{ width: width }} 
              // onChange={handleChange} 
              onChange={(value) => handleChange({ target: { value } }, dataIndex, form)}
              options={getSelectOptions(col,record)} 
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
                onChange={(e) => handleChange({ target: { value: e.target.checked} }, dataIndex, form)}
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
        mode: col.mode,
        col:col,
        rules: col.rules,
        editing: isEditing(record),
      }),
    };
  });

  //处理级联特殊处理。
  const getSelectOptions = (col,record) => {
    debugLog(" col ",col)
    debugLog(" record ",record)
    // 查询Filed数据
    if(col.distType === 'props.fieldData'){
      debugLog(" props.fieldData ",props.fieldData)  
      return props.fieldData.map(item => ({
        value: item.name,
        label: item.name +" - " + item.comment,
      }))
    }else if(col.distType === 'visibilityContext.databaseList'){
      return databaseList
    }else if(col.distType === 'visibilityContext.tableList'){
      debugLog(" record.database " ,record.database)
      debugLog(" form.getFieldValue('database') " ,form.getFieldValue('database'))
      return  tableList.filter(item => item.database === form.getFieldValue('database'))
    }else if(col.distType === 'visibilityContext.columnList'){
      return  columnList.filter(item => item.table === form.getFieldValue('table'))
    } else {
      //获取字典dist
      return getDist(col.distType)
    }
  }
  return (
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
              scroll={{ y: props.currentHeight }} 
              pagination={false}
              // pagination={{
              //   onChange: cancel,
              // }}
            />
          </SortableContext>
 
      </DndContext>
    </Form>
  );
});
export default ForeignKeyPanel;