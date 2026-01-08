import { Form, Input, Modal, Table, Transfer } from "antd";
import i18next from 'i18next';
import difference from 'lodash/difference';
import { useEffect, useState } from 'react';
import triggerCommandApi from "../../api/trigger-command";
import triggerCommandGroupApi from "../../api/trigger-command-group";
import triggerCommandGroupMembersApi from "../../api/trigger-command-group-members";
const api = triggerCommandGroupApi;
const { TextArea } = Input;
const TableTransfer = ({ leftColumns, rightColumns, ...restProps }) => (
  <Transfer {...restProps}>
    {({
      direction,
      filteredItems,
      onItemSelectAll,
      onItemSelect,
      selectedKeys: listSelectedKeys,
      disabled: listDisabled,
    }) => {
      const columns = direction === 'left' ? leftColumns : rightColumns;
      const rowSelection = {
        getCheckboxProps: (item) => ({
          disabled: listDisabled || item.disabled,
        }),
        onSelectAll(selected, selectedRows) {
          const treeSelectedKeys = selectedRows
            .filter((item) => !item.disabled)
            .map(({ key }) => key);
          const diffKeys = selected
            ? difference(treeSelectedKeys, listSelectedKeys)
            : difference(listSelectedKeys, treeSelectedKeys);
          onItemSelectAll(diffKeys, selected);
        },
        onSelect({ key }, selected) {
          onItemSelect(key, selected);
        },
        selectedRowKeys: listSelectedKeys,
      };
      return (
        <Table
          rowSelection={rowSelection}
          columns={columns}
          dataSource={filteredItems}
          size="small"
          style={{
            pointerEvents: listDisabled ? 'none' : undefined,
          }}
          onRow={({ key, disabled: itemDisabled }) => ({
            onClick: () => {
              if (itemDisabled || listDisabled) return;
              onItemSelect(key, !listSelectedKeys.includes(key));
            },
          })}
        />
      );
    }}
  </Transfer>
);

const SensitiveCommandModal = ({
  visible,
  handleOk,
  handleCancel,
  confirmLoading,
  id,
  worker,
}) => {
  const [targetKeys, setTargetKeys] = useState([]);
  const [disabled, setDisabled] = useState(false);
  const [mockData, setMockData] = useState([]);
  const [form] = Form.useForm();

  const formItemLayout = {
    labelCol: { span: 2 },
    wrapperCol: { span: 20 },
  };

  const leftTableColumns = [
    {
      dataIndex: 'title',
      title: i18next.t('triggerCommandGroup.modal.label.name'),
    },
    // {
    //   dataIndex: 'tag',
    //   title: 'Tag',
    //   render: (tag) => <Tag>{tag}</Tag>,
    // },
    {
      dataIndex: 'description',
      title: i18next.t('triggerCommandGroup.modal.table.column.description'),
    },
  ];
  const rightTableColumns = [
    {
      dataIndex: 'title',
      title: i18next.t('triggerCommandGroup.modal.table.column.title'),
    },
    // {
    //     dataIndex: 'tag',
    //     title: 'Tag',
    //     render: (tag) => <Tag>{tag}</Tag>,
    // },
    {
      dataIndex: 'description',
      title: i18next.t('triggerCommandGroup.modal.table.column.description'),
    },
  ];


  // 获取选中的触发命令
  const getSelectCommandIs = async (size) => {
    if (id) {
      let queryParams = {
        pageIndex: 1,
        pageSize: size,
        commandGroupId: id,
      };
      await triggerCommandGroupMembersApi.getPaging(queryParams).then((res) => {
        const commandIds = res.items.map((item) => item.commandId);
        form.setFieldsValue({
          commandIds: commandIds
        });
        setTargetKeys(commandIds);
      })
    }
  }

  // 获取可选触发命令
  const getSCommands = async () => {
    await triggerCommandApi.getAll().then((res) => {
      const transformedData = res.map((item, i) => ({
        key: item.id,
        title: item.name || `content${i + 1}`,
        description: item.content || `description of content${i + 1}`,
        tag: item.tag || `Tag${i % 3}`,
      }));
      setMockData(transformedData);
      setTargetKeys([]);
      getSelectCommandIs(transformedData.length)
    });
  };

  useEffect(() => {
    const getItem = async () => {
      let data = await api.getById(id);
      if (data) {
        form.setFieldsValue(data);
        getSCommands();
      }
    };

    if (visible) {
      if (id) {
        getItem();
      } else {
        form.setFieldsValue({});
        getSCommands();
      }
    } else {
      form.resetFields();
    }
  }, [visible, id, worker, form]);

  

  return (
    <Modal
      width={'60%'}
      title={id ? i18next.t('triggerCommandGroup.modal.title.update') : i18next.t('triggerCommandGroup.modal.title.create')}
      visible={visible}
      maskClosable={false}
      destroyOnClose={true}
      onOk={() => {
        form
          .validateFields()
          .then(async (values) => {
            let ok = await handleOk(values);
            if (ok) {
              form.resetFields();
            }
          });
      }}
      onCancel={() => {
        form.resetFields();
        handleCancel();
      }}
      confirmLoading={confirmLoading}
      okText={i18next.t('triggerCommandGroup.modal.button.ok')}
      cancelText={i18next.t('triggerCommandGroup.modal.button.cancel')}
    >
      <Form form={form} {...formItemLayout}>
        <Form.Item name="id" noStyle>
          <Input hidden={true} />
        </Form.Item>

        <Form.Item label={i18next.t('triggerCommandGroup.modal.label.name')} name="name" rules={[{ required: true, message: i18next.t('triggerCommandGroup.modal.message.name.required') }]}>
          <Input placeholder={i18next.t('triggerCommandGroup.modal.placeholder.name')} />
        </Form.Item>

        <Form.Item label={i18next.t('triggerCommandGroup.modal.label.content')} name="content" rules={[{ required: true, message: i18next.t('triggerCommandGroup.modal.message.content.required') }]}>
          <TextArea autoSize={{ minRows: 5, maxRows: 10 }} placeholder={i18next.t('triggerCommandGroup.modal.placeholder.content')} />
        </Form.Item>

        <Form.Item label={i18next.t('triggerCommandGroup.modal.label.commandIds')} name="commandIds" rules={[{ required: true, message: i18next.t('triggerCommandGroup.modal.message.commandIds.required') }]}>
          <TableTransfer
            dataSource={mockData}
            targetKeys={targetKeys}
            disabled={disabled}
            showSearch={true}
            onChange={setTargetKeys}
            filterOption={(inputValue, item) =>
              item.title.indexOf(inputValue) !== -1 || item.tag.indexOf(inputValue) !== -1
            }
            leftColumns={leftTableColumns}
            rightColumns={rightTableColumns}
          />
        </Form.Item>
 
      </Form>
    </Modal>
  );
};

export default SensitiveCommandModal;
