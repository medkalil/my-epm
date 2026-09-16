import { Modal, Form, Input, Select } from 'antd';
import { useEffect } from 'react';
import { TaskStatus, TaskPriority } from '@/types/common';
import { useCreateTask } from '../api/task.queries';
import { useProjects } from '@/features/project/api/project.queries';

interface CreateTaskModalProps {
  open: boolean;
  onClose: () => void;
  defaultProjectId?: number;
}

const STATUS_OPTIONS = [
  { label: 'To Do', value: TaskStatus.TODO },
  { label: 'In Progress', value: TaskStatus.IN_PROGRESS },
  { label: 'In Review', value: TaskStatus.IN_REVIEW },
  { label: 'Done', value: TaskStatus.DONE },
];

const PRIORITY_OPTIONS = [
  { label: 'Low', value: TaskPriority.LOW },
  { label: 'Medium', value: TaskPriority.MEDIUM },
  { label: 'High', value: TaskPriority.HIGH },
  { label: 'Urgent', value: TaskPriority.URGENT },
];

export function CreateTaskModal({ open, onClose, defaultProjectId }: CreateTaskModalProps) {
  const [form] = Form.useForm();
  const createMutation = useCreateTask();
  const { data: projectsData } = useProjects();

  const projectOptions =
    projectsData?.map((p) => ({ label: p.name, value: p.id })) ?? [];

  useEffect(() => {
    if (open) {
      form.resetFields();
      if (defaultProjectId) form.setFieldsValue({ projectId: defaultProjectId });
    }
  }, [open, form, defaultProjectId]);

  const handleOk = async () => {
    const values = await form.validateFields();
    await createMutation.mutateAsync({ ...values, organizationId: 0 });
    onClose();
  };

  return (
    <Modal
      title="Create task"
      open={open}
      onOk={handleOk}
      confirmLoading={createMutation.isPending}
      onCancel={onClose}
      okText="Create"
      width={520}
    >
      <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
        <Form.Item
          name="title"
          label="Task title"
          rules={[{ required: true, message: 'Enter a task title' }]}
        >
          <Input placeholder="e.g. Implement login page" />
        </Form.Item>
        <Form.Item name="description" label="Description">
          <Input.TextArea rows={3} placeholder="Details about this task" />
        </Form.Item>
        <Form.Item
          name="projectId"
          label="Project"
          rules={[{ required: true, message: 'Select a project' }]}
        >
          <Select placeholder="Select a project" options={projectOptions} />
        </Form.Item>
        <Form.Item name="status" label="Status" initialValue={TaskStatus.TODO}>
          <Select options={STATUS_OPTIONS} />
        </Form.Item>
        <Form.Item name="priority" label="Priority">
          <Select placeholder="Set priority" options={PRIORITY_OPTIONS} allowClear />
        </Form.Item>
      </Form>
    </Modal>
  );
}