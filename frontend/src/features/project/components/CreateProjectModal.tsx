import { Modal, Form, Input } from 'antd';
import { useEffect } from 'react';
import { useCreateProject } from '../api/project.queries';

interface CreateProjectModalProps {
  open: boolean;
  onClose: () => void;
}

export function CreateProjectModal({ open, onClose }: CreateProjectModalProps) {
  const [form] = Form.useForm();
  const createMutation = useCreateProject();

  useEffect(() => {
    if (open) form.resetFields();
  }, [open, form]);

  const handleOk = async () => {
    const values = await form.validateFields();
    await createMutation.mutateAsync(values);
    onClose();
  };

  return (
    <Modal
      title="Create project"
      open={open}
      onOk={handleOk}
      confirmLoading={createMutation.isPending}
      onCancel={onClose}
      okText="Create"
    >
      <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
        <Form.Item
          name="name"
          label="Project name"
          rules={[{ required: true, message: 'Enter a project name' }]}
        >
          <Input placeholder="e.g. Website Redesign" />
        </Form.Item>
        <Form.Item name="description" label="Description (optional)">
          <Input.TextArea rows={3} placeholder="What is this project about?" />
        </Form.Item>
      </Form>
    </Modal>
  );
}