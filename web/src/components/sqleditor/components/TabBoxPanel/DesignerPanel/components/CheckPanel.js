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

const CheckPanel = forwardRef((props, ref) => {
  // debugLog(" initialData ",initialData)
  const { 
    SQL_EDIT_MODE,
    getDist
   } = useContext(VisibilityContext);
  

  const [dataSource, setDataSource] = useState([]);
  useEffect(() => {
    debugLog(" initialData " ,props.checkData )
    setDataSource(props.checkData)
  },[props.checkData])
  
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
  
  const [form] = Form.useForm();
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
      width: 220,
    },
    {
      title: '表达式',
      dataIndex: 'type',
      inputType: 'select',
      distType:'ColumnsType',
      editable:true,
      width: 340,
    },
    {
      title: '不强制实施',
      dataIndex: 'len',
      inputType: 'number',
      editable:true,
    },
    {
      title: '操作',
      dataIndex: 'operation',
      width: 100,
      render: (_, record) => {
        const editable = isEditing(record);
        return editable ? (
          <span>
            <Typography.Link
              onClick={() => save(record.key)}
              style={{ marginRight: 8, }}
            >
              保存
            </Typography.Link>
            <Popconfirm title="确定取消编辑?" 
              okText='确定'
              cancelText='取消'
              onConfirm={cancel}>
              <a>取消</a>
            </Popconfirm>
          </span>
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
        name: '',
        type:'',
        len: 0,
        port:0,
        isNull:false,
        isKey:false,
        remark: '',
        ...record,
      });
      setEditingKey(record.key);
    }
  }));

  const edit = (record) => {
    form.setFieldsValue({
      name: '',
      type:'',
      len: 0,
      port:0,
      isNull:false,
      isKey:false,
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
        columns.map((columnsItem) => {
          if(columnsItem.inputType === 'checkbox'){
            row[`${columnsItem.dataIndex}`] = item[`${columnsItem.dataIndex}`]
          }
        })
        newData.splice(index, 1, {
          ...item,
          ...row,
        });
        debugLog(" save newData" ,newData)
        // setData(newData);
        setDataSource(newData)
        setEditingKey('');
        props.updateData(newData)
      } else {
        newData.push(row);
        // setData(newData);
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
    distType,
    children,
    ...restProps
  }) => {

    const handleCheckboxChange = (e) => {
      const checked = e.target.checked;    
      const newData = dataSource.map(item =>
        item.key === record.key ? { ...item, [dataIndex]: checked } : item
      );
      setDataSource(newData);
    };

    return (
      <td {...restProps}>
        {editing ? (
          <Form.Item
            name={dataIndex}
            style={{ margin: 0, }}>

            {inputType === 'number' && <InputNumber size='small' style={{ width: width, }}/>}
            {inputType === 'text' && <Input size='small' style={{ width: width, }}/>}
            {inputType === 'select' && <Select  size='small' defaultValue="" 
              showSearch
              style={{ width: width }} 
              onChange={handleChange} 
              options={getDist(distType)} 
              optionFilterProp="label"
              filterSort={(optionA, optionB) =>
                (optionA?.label ?? '').toLowerCase().localeCompare((optionB?.label ?? '').toLowerCase())
              }
            />}
            {inputType === 'checkbox' && <Checkbox size='small' 
              checked={record[`${dataIndex}`]}
              onChange={handleCheckboxChange}/>}
          </Form.Item>
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
        editing: isEditing(record),
      }),
    };
  });
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
export default CheckPanel;