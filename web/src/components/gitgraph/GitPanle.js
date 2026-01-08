import { Button, Select, Space } from 'antd';
import 'antd/es/button/style/css'; // 为 Button 组件引入样式
import 'antd/es/drawer/style/css';
import 'antd/es/select/style/css';
import 'antd/es/space/style/css';
import i18next from 'i18next';
import { React, useEffect, useState } from 'react';
import gitApi from "../../api/git";
import { debugLog } from "../../common/logger";
import './App.css';
import GitGraphWidget from './components/GitGraphWidget';
import GitTagModal from './components/GitTagModal';
const api = gitApi;

const GitPanle = ({id}) => {

  const [OPTIONS,setOPTIONS] = useState(['Apples', 'Nails', 'Bananas', 'Helicopters',
    'Apples1', 'Nails1', 'Bananas1', 'Helicopters1'
  ])
  const [open, setOpen] = useState(false);
  const [selectedItems, setSelectedItems] = useState([]);
  const [filteredOptions, setFilteredOptions] = useState([]);
  const [branchOptions, setBranchOptions] = useState([]);
  const [branchTmp, setBranchTmp] = useState([]);
  const [allBranchesHistory,  setAllBranchesHistory] = useState([]);


  useEffect(() => {
    // let isMounted = true;  // 标志位，确认组件是否已挂载
  
    const fetchData = async () => {
      if (id) {
        debugLog("##id ", id);
        let allBranches = await api.allBranches(id);
        // branches 添加一个空的全部
       
        const branches = allBranches
          .filter(branch => !branch.includes('remotes/origin/'))
          .map(branch => {
            let cleanedBranch = branch.replace('* ', '');
            return {
              value: cleanedBranch,
              label: cleanedBranch
            };
          });
        branches.unshift({value: '', label: i18next.t('gitPanle.bar.branch.optionAll')});
        setBranchOptions(branches);
  
         await api.allBranchesHistory(id).then(res =>{
          debugLog("allBranchHistory ", res);
          setAllBranchesHistory(res);
        });

 
      }
    };
  
    fetchData();
  
    return () => {
      // isMounted = false;  // 在组件卸载时，将标志位设置为 false
    };
  }, [id]);  // 这里依赖 `id`，而不是空数组
  
  useEffect(() => {
    // 在组件挂载后调用
    const filteredOptions = OPTIONS.filter(option => !selectedItems.includes(option));
    debugLog('filteredOptions ### :', filteredOptions);
    // this.setState({ filteredOptions });
  }, [selectedItems]);

  const handleChange = async (value) => {
    debugLog(`selected ${value}`);
    if(value){
      await api.branchHistory(id,value).then(res=>{
        setAllBranchesHistory(res); 
      })
    } else {
      await api.allBranchesHistory(id).then(res =>{
        setAllBranchesHistory(res)
      })
    }
  };
  const showDrawer = () => {
    debugLog('showDrawer');
    setOpen(true)
  };

  const onClose = () => {
    setOpen(false)
  };

  const  setSelectedStructItems = (selectedStructItems) => {
    // this.setState({ selectedStructItems });
    // 假设您有一个过滤逻辑
    // const filteredOptions = this.state.OPTIONS.filter(option => !this.state.selectedItems.includes(option));
    // debugLog('filteredOptions ### :', filteredOptions);
    // this.setState({ filteredOptions });
  };
 
  const  setSelectedStructDataItems = (selectedStructDataItems) => {
    // this.setState({ selectedStructDataItems });
    // 假设您有一个过滤逻辑
    // const filteredOptions = this.state.OPTIONS.filter(option => !this.state.selectedItems.includes(option));
    // debugLog('filteredOptions ### :', filteredOptions);
    // this.setState({ filteredOptions });
  };
  // componentDidMount() {
  //   this.state.filteredOptions = this.state.OPTIONS;
  // }
  const [isBranchModalOpen, setIsBranchModalOpen] = useState(false);
  const [isTagModalOpen, setIsTagModalOpen] = useState(false);
  const [nodeId,setNodeId] = useState(null)
  const showBranchModal = () => {
    setIsBranchModalOpen(true);
  };
  const handleBranchOk = () => {
    setIsBranchModalOpen(false);
  };
  const handleBranchCancel = () => {
    setIsBranchModalOpen(false);
  };

  const showTagModal = () => {
    setIsTagModalOpen(true);
  };
  const handleTagOk = () => {
    setIsTagModalOpen(false);
  };
  const handleTagCancel = () => {
    setIsTagModalOpen(false);
  };

  const onFinish = (values) => {
    debugLog('Success:', values);
  };
  const onFinishFailed = (errorInfo) => {
    debugLog('Failed:', errorInfo);
  };

  return (
      <div className="app-box">
        <Space align='left' className='top-bar-box'>
          {i18next.t('gitPanle.bar.branch')}:
          <Select
            align='left'
            defaultValue=""
            size='small'
            style={{ width: 220 }}
            onChange={handleChange}
            options={branchOptions}
          />
          <Button size='small' onClick={showTagModal}>{i18next.t('gitPanle.bar.newlabel')}</Button>
          {/* <Space>远程仓库地址:<Alert style={{ padding: '0 10px' }} message="http://gitlab.chusentech.com/chusen/next-dbm" type="info" /></Space> */}
          {/* <Button size='small' onClick={showBranchModal}>新建分支</Button> */}
          {/* <Button size='small' onClick={showDrawer}>版本规则配置</Button> */}
          {/* <Space>DB资产:<Alert style={{ padding: '0 10px' }} message="next-dbm" type="info" /></Space> */}
         
          {/* <Button size='small' onClick={showDrawer}>仓库地址</Button> */}
        </Space>

        <GitGraphWidget id={id} allBranchHistory={allBranchesHistory} setNodeId={setNodeId}/>
        <GitTagModal
            id={id}
            shortId={nodeId}
            visible={isTagModalOpen}
            handleCancel={handleTagCancel}
            handleOk={handleTagOk}
        />
 

        {/* <Modal title="创建Tag" className={'GitGraph'} open={isTagModalOpen} onOk={handleTagOk} onCancel={handleTagCancel}>
          <Form name="basic"
                labelCol={{ span: 4 }}
                wrapperCol={{ span: 16 }}
                style={{ maxWidth: 600 }}
                initialValues={{
                  remember: true,
                }}
                onFinish={onFinish}
                onFinishFailed={onFinishFailed}
                autoComplete="off"
              >
                <Form.Item
                  label="Tag名称"
                  name="name"
                  rules={[
                    {
                      required: true,
                      message: '请输入Tag名称',
                    },
                  ]}
                >
                  <Input />
                </Form.Item>
                <Form.Item
                  label="信息"
                  name="message"
                  rules={[
                    {
                      required: true,
                      message: '请输入提交信息',
                    },
                  ]}
                >
                   <Input.TextArea showCount maxLength={100} />
                </Form.Item>
              </Form>
        </Modal> */}

        {/* <Modal title="创建分支" className={'GitGraph'} open={isBranchModalOpen} onOk={handleBranchOk} onCancel={handleBranchCancel}>
          <Form name="basic"
                labelCol={{ span: 4 }}
                wrapperCol={{ span: 16 }}
                style={{ maxWidth: 600 }}
                initialValues={{
                  remember: true,
                }}
                onFinish={onFinish}
                onFinishFailed={onFinishFailed}
                autoComplete="off"
              >
                <Form.Item
                  label="名称"
                  name="name"
                  rules={[
                    {
                      required: true,
                      message: '请输入分支名称',
                    },
                  ]}
                >
                  <Input />
                </Form.Item>
          </Form>
        </Modal>
        <Modal title="版本规则配置"
          className={'GitGraph'}
          placement="right" 
          onCancel={onClose} 
          open={open}
          extra={
            <Space>
              <Button onClick={onClose} size='small' >取消</Button>
              <Button type="primary" onClick={onClose} size='small' >
                保存
              </Button>
            </Space>
          }
          >
 
          <Form  name="basic"
            labelCol={{ span: 6, }}
            wrapperCol={{  span: 16, }}
            initialValues={{  remember: true, }}
            onFinish={onFinish}
            onFinishFailed={onFinishFailed}
            autoComplete="off"
          >
            <Form.Item
              label="表结构版本"
              name="username">
                <Select
                  allowClear
                  showSearch
                  mode="multiple"
                  placeholder="请选择表结构版本"
                  value={selectedItems}
                  onChange={setSelectedItems}
                  style={{ width: '100%' }}
                  options={filteredOptions?.map(item => ({
                    value: item,
                    label: item,
                  }))}
                />
            </Form.Item>

            <Form.Item
              label="表数据版本"
              name="password">
                <Select
                  allowClear
                  showSearch
                  mode="multiple"
                  placeholder="请选择表数据版本"
                  value={selectedItems}
                  onChange={setSelectedItems}
                  style={{ width: '100%' }}
                  options={filteredOptions?.map(item => ({
                    value: item,
                    label: item,
                  }))}
                />
            </Form.Item>

            <Form.Item
              label="Sqls数据版本"
              name="password">
                <Select
                  allowClear
                  showSearch
                  mode="multiple"
                  placeholder="请选择Sqls结果数据版本"
                  value={selectedItems}
                  onChange={setSelectedItems}
                  style={{ width: '100%' }}
                  options={filteredOptions?.map(item => ({
                    value: item,
                    label: item,
                  }))}
                />
            </Form.Item>
          </Form>

        </Modal> */}
      </div>
    );
 
}

export default GitPanle;
