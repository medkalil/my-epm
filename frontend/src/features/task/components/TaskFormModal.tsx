import { Modal, Form, Input, Select } from 'antd';
import { useEffect } from 'react';
import { TaskStatus, TaskPriority } from '@/types/common';
import { useCreateTask, useUpdateTask } from '../api/task.queries';
import { useProjects } from '@/features/project/api/project.queries';
import { useOrganizationMembers } from '@/features/organization/api/organization.queries';
import { useOrgStore } from '@/stores/orgStore';
import type { Task } from '../types/task.types';

interface TaskFormModalProps {
  open: boolean;
  onClose: () => void;
  task?: Task;
  defaultStatus?: TaskStatus;
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

export function TaskFormModal({ open, onClose, task, defaultStatus, defaultProjectId }: TaskFormModalProps) {
  const [form] = Form.useForm();
  const createMutation = useCreateTask();
  const updateMutation = useUpdateTask();
  const { data: projectsData } = useProjects();
  const activeOrganization = useOrgStore((state) => state.activeOrganization);
  const activeOrgId = activeOrganization?.id;
  const { data: orgMembers = [] } = useOrganizationMembers(activeOrgId);

  const isEdit = !!task;

  const projectOptions = projectsData?.map((p) => ({ label: p.name, value: p.id })) ?? [];

  const assigneeOptions = orgMembers.map((m) => ({
    label: m.user?.name || `User #${m.userId}`,
    value: m.userId,
  }));

  useEffect(() => {
    if (!open) return;
    form.resetFields();
    if (task) {
      form.setFieldsValue({
        title: task.title,
        description: task.description,
        projectId: task.projectId,
        status: task.status,
        priority: task.priority ?? undefined,
        affectedUserId: task.affectedUserId,
      });
    } else {
      form.setFieldsValue({
        status: defaultStatus ?? TaskStatus.TODO,
        projectId: defaultProjectId,
      });
    }
  }, [open, form, task, defaultStatus, defaultProjectId]);

  const handleOk = async () => {
    const values = await form.validateFields();
    if (isEdit) {
      await updateMutation.mutateAsync({ id: task!.id, payload: values });
    } else {
      await createMutation.mutateAsync({ ...values, organizationId: activeOrgId });
    }
    onClose();
  };

  return (
    <Modal
      title={isEdit ? 'Edit task' : 'Create task'}
      open={open}
      onOk={handleOk}
      confirmLoading={isEdit ? updateMutation.isPending : createMutation.isPending}
      onCancel={onClose}
      okText={isEdit ? 'Save' : 'Create'}
      width={560}
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
          <Select placeholder="Select a project" options={projectOptions} showSearch optionFilterProp="label" />
        </Form.Item>
        <Form.Item name="status" label="Status" rules={[{ required: true, message: 'Select a status' }]}>
          <Select options={STATUS_OPTIONS} />
        </Form.Item>
        <Form.Item name="priority" label="Priority">
          <Select placeholder="Set priority" options={PRIORITY_OPTIONS} allowClear />
        </Form.Item>
        <Form.Item name="affectedUserId" label="Assignee">
          <Select
            placeholder="Assign to a workspace member"
            options={assigneeOptions}
            allowClear
            showSearch
            optionFilterProp="label"
          />
        </Form.Item>
      </Form>
    </Modal>
  );
}