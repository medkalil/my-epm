import { Modal, Form, Input, Select } from 'antd';
import { useEffect } from 'react';
import { useCreateProject } from '../api/project.queries';
import { useOrganizationMembers } from '@/features/organization/api/organization.queries';
import { useOrgStore } from '@/stores/orgStore';
import type { ProjectStatus } from '../types/project.types';

interface CreateProjectModalProps {
  open: boolean;
  onClose: () => void;
}

interface FormValues {
  name: string;
  description?: string;
  status: ProjectStatus;
  memberIds?: number[];
}

export function CreateProjectModal({ open, onClose }: CreateProjectModalProps) {
  const [form] = Form.useForm<FormValues>();
  const createMutation = useCreateProject();
  const activeOrg = useOrgStore((state) => state.activeOrganization);
  const { data: orgMembers = [] } = useOrganizationMembers(activeOrg?.id);

  useEffect(() => {
    if (open) {
      form.resetFields();
      form.setFieldsValue({ status: 'IN_PROGRESS' });
    }
  }, [open, form]);

  const handleOk = async () => {
    const values = await form.validateFields();
    await createMutation.mutateAsync({
      name: values.name,
      description: values.description,
      status: values.status,
      memberIds: values.memberIds,
    });
    onClose();
  };

  const memberOptions = orgMembers.map((m) => ({
    label: m.user?.name ? `${m.user.name} (${m.role})` : `User #${m.userId} (${m.role})`,
    value: m.userId,
  }));

  return (
    <Modal
      title="Create New Project"
      open={open}
      onOk={handleOk}
      confirmLoading={createMutation.isPending}
      onCancel={onClose}
      okText="Create Project"
      destroyOnClose
    >
      <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
        <Form.Item
          name="name"
          label="Project Name"
          rules={[{ required: true, message: 'Please enter a project name' }]}
        >
          <Input placeholder="e.g. Enterprise Cloud Migration" />
        </Form.Item>

        <Form.Item name="description" label="Description">
          <Input.TextArea
            rows={3}
            placeholder="Brief details about the project goals and scope..."
          />
        </Form.Item>

        <Form.Item
          name="status"
          label="Initial Status"
          rules={[{ required: true, message: 'Please select a status' }]}
          initialValue="IN_PROGRESS"
        >
          <Select
            options={[
              { label: 'In Progress', value: 'IN_PROGRESS' },
              { label: 'In Review', value: 'IN_REVIEW' },
              { label: 'Completed', value: 'COMPLETED' },
            ]}
          />
        </Form.Item>

        <Form.Item name="memberIds" label="Assign Contributors (Optional)">
          <Select
            mode="multiple"
            allowClear
            placeholder="Select workspace members to assign..."
            options={memberOptions}
          />
        </Form.Item>
      </Form>
    </Modal>
  );
}