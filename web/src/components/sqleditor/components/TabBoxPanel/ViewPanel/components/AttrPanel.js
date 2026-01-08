import { PlusOutlined } from '@ant-design/icons';
import { Button, Checkbox, Divider, Form, Input, InputNumber, Select, Space } from 'antd';
import React, { forwardRef, useContext, useEffect, useRef, useState } from 'react';
import { debugLog } from "../../../../../../common/logger";
import { VisibilityContext } from '../../../Utils/visibilityProvider';

const { Option } = Select;
const ViewAttrPanel = forwardRef((props, ref) => {
  const { 
    SQL_EDIT_MODE,
    getDist,
    getCharsets,
    getCollations
   } = useContext(VisibilityContext);
  
  const [form] = Form.useForm();
  const [dataSource, setDataSource] = useState(props.optionData);

  const [viewPanelAttr, setViewPanelAttr] = useState(getDist('ViewPanelAttr'));
 

  useEffect(() => {
    debugLog(" viewPanelAttr ",viewPanelAttr)
  },[viewPanelAttr])

  useEffect(() => {
    debugLog(" getDist('ViewPanelAttr') ",getDist('ViewPanelAttr'))
    setViewPanelAttr(getDist('ViewPanelAttr'))
  },[])

  const formItemLayout = {
    labelCol: {
      xs: {
        span: 24,
      },
      sm: {
        span: 3,
      },
    },
    wrapperCol: {
      xs: {
        span: 24,
      },
      sm: {
        span: 6,
      },
    },
  }; 
 
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
    <div className='mt-4'>
      <Form form={form} {...formItemLayout} component={false} >
        {/* <Form.Item className="form-item-spacing" label="引擎"  >
          <Select placeholder="请选择数据库引擎" 
              onChange={handleEnginesChange}
              // value={getValue()}
              allowClear size='small' 
              options={engines} />
        </Form.Item> */}

        {viewPanelAttr?.map((attrObj, index) => {
              const handleInputChange = (value) => {
                // debugLog(`Value changed for  selectedRow :`, selectedRow);
                debugLog(`Value changed for ${attrObj.label}   :`,  [attrObj.distType], value);
                // 在这里处理值的变化，例如更新状态或执行其他操作
                setDataSource({...dataSource,
                  [attrObj.distType]: value
                });
                const tpm = {...dataSource,
                  [attrObj.distType]: value
                };  
                props.updateData(tpm)
              };
              const getValue=() => {
                return dataSource[attrObj.distType]
              }
              const getOptions = (distType) => {
                // 根据 distType 获取选项列表的逻辑，可以通过 API 请求或其他方式获取
                return getDist(distType)
              };
              // 级联获取options
              const getFilteredOptions = (distType, dependencyValue) => {
                debugLog(`getFilteredOptions for   :`, dependencyValue);
                if(dependencyValue){
                  const options = getDist(distType,{charset:dependencyValue});
                  return options
                } 
                return []
              };
            
              
              if (attrObj.type === 'select') {
                return (
                    <Form.Item key={index} label={attrObj.label} className="form-item-spacing" >
                      <Select options={attrObj.levelDistType
                          ? getFilteredOptions(attrObj.distType, dataSource[attrObj.levelDistType])
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
                    <Checkbox  placeholder={attrObj.placeholder} 
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
                        <Divider style={{margin: '8px 0',}}/>
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
              return  null;
            }
          )}
      </Form>

    </div>
  );
});
export default ViewAttrPanel;