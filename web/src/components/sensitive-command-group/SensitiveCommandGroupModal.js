import { Form, Input, Modal, Select, Table, Transfer } from "antd";
import i18next from 'i18next';
import difference from 'lodash/difference';
import { useEffect, useState } from 'react';
import sensitiveCommandApi from "../../api/sensitive-command";
import sensitiveCommandGroupApi from "../../api/sensitive-command-group";
import sensitiveCommandGroupMembersApi from "../../api/sensitive-command-group-members";
const api = sensitiveCommandGroupApi;
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
      title: i18next.t('sensitiveCommandGroup.modal.label.name'),
    },
    {
      dataIndex: 'description',
      title: i18next.t('sensitiveCommandGroup.modal.table.column.description'),
    },
  ];
  const rightTableColumns = [
    {
      dataIndex: 'title',
      title: i18next.t('sensitiveCommandGroup.modal.table.column.title'),
    },
    {
      dataIndex: 'description',
      title: i18next.t('sensitiveCommandGroup.modal.table.column.description'),
    },
  ];

  const getSelectCommandIs = async (size) => {
    if (id) {
      let queryParams = {
        pageIndex: 1,
        pageSize: size,
        commandGroupId: id,
      };
      await sensitiveCommandGroupMembersApi.getPaging(queryParams).then((res) => {
        const commandIds = res.items.map((item) => item.commandId);
        form.setFieldsValue({
          commandIds: commandIds
        });
        setTargetKeys(commandIds);
      })
    }
  }

  const getSCommands = async () => {
    await sensitiveCommandApi.getAll().then((res) => {
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

  const [webhookOptions, setWebhookOptions] = useState([]);
  const getWebhookOptions = async (action) => {
    // let params = {
    //   pageIndex: 1,
    //   pageSize: 100,
    //   serviceType: "sensitive",
    // }
    // const res = await webhookApi.getPaging(params);

    // const items = Array.isArray(res?.items) ? res.items : [];
    // console.log(" webhook items 3", items)
    // setWebhookOptions(items)
  }
  useEffect(() => {
    getWebhookOptions()
  }, []);

  return (
    <Modal
      width={'60%'}
      title={id ? i18next.t('sensitiveCommandGroup.modal.title.update') : i18next.t('sensitiveCommandGroup.modal.title.create')}
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
      okText={i18next.t('sensitiveCommandGroup.modal.button.ok')}
      cancelText={i18next.t('sensitiveCommandGroup.modal.button.cancel')}
    >
      <Form form={form} {...formItemLayout}>
        <Form.Item name="id" noStyle>
          <Input hidden={true} />
        </Form.Item>

        <Form.Item label={i18next.t('sensitiveCommandGroup.modal.label.name')} name="name" rules={[{ required: true, message: i18next.t('sensitiveCommandGroup.modal.message.name.required') }]}>
          <Input placeholder={i18next.t('sensitiveCommandGroup.modal.placeholder.name')} />
        </Form.Item>

        <Form.Item label={i18next.t('sensitiveCommandGroup.modal.label.content')} name="content" rules={[{ required: true, message: i18next.t('sensitiveCommandGroup.modal.message.content.required') }]}>
          <TextArea autoSize={{ minRows: 5, maxRows: 10 }} placeholder={i18next.t('sensitiveCommandGroup.modal.placeholder.content')} />
        </Form.Item>

        <Form.Item label={i18next.t('sensitiveCommandGroup.modal.label.commandIds')} name="commandIds" rules={[{ required: true, message: i18next.t('sensitiveCommandGroup.modal.message.commandIds.required') }]}>
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
        <Form.Item label={i18next.t('build.modal.tabs.webhook.label')} name='webhookId'>
          <Select
            placeholder={i18next.t('webhook.form.placeholder.actions')}
            options={webhookOptions?.map(item => ({ value: item.id, label: item.name }))}
            allowClear
          />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default SensitiveCommandModal;
