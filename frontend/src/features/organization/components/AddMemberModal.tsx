import { Modal, Form, Select, App } from 'antd';
import { useQuery } from '@tanstack/react-query';
import { userService } from '@/services/user.service';
import { useState } from 'react';
import { OrgRole } from '@/types/common';
import { useAddMember } from '../api/organization.queries';
import { getApiErrorMessage } from '@/lib/axios';

interface AddMemberModalProps {
  open: boolean;
  orgId: number;
  onClose: () => void;
}

const ROLE_OPTIONS = [
  { label: 'Owner', value: OrgRole.OWNER },
  { label: 'Admin', value: OrgRole.ADMIN },
  { label: 'Member', value: OrgRole.MEMBER },
  { label: 'Guest', value: OrgRole.GUEST },
];

export function AddMemberModal({ open, orgId, onClose }: AddMemberModalProps) {
  const { message } = App.useApp();
  const [form] = Form.useForm();
  const [selectedUserId, setSelectedUserId] = useState<number | undefined>();

  const { data: usersData, isLoading: usersLoading } = useQuery({
    queryKey: ['users', 'options'],
    queryFn: () => userService.list({ page: 0, size: 100 }),
    enabled: open,
  });

  const addMemberMutation = useAddMember(orgId);

  const userOptions =
    usersData?.content.map((user) => ({
      label: user.name,
      value: user.id,
    })) ?? [];

  const handleOk = async () => {
    const values = await form.validateFields();
    try {
      await addMemberMutation.mutateAsync({
        userId: selectedUserId!,
        role: values.role,
      });
      form.resetFields();
      onClose();
    } catch (error) {
      message.error(getApiErrorMessage(error));
    }
  };

  return (
    <Modal
      title="Add team member"
      open={open}
      onOk={handleOk}
      onCancel={onClose}
      confirmLoading={addMemberMutation.isPending}
      okText="Invite member"
    >
      <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
        <Form.Item
          name="userId"
          label="Select a user"
          rules={[{ required: true, message: 'Select a user to invite' }]}
        >
          <Select
            loading={usersLoading}
            showSearch
            optionFilterProp="label"
            placeholder="Search by username"
            options={userOptions}
            value={selectedUserId}
            onChange={setSelectedUserId}
          />
        </Form.Item>
        <Form.Item
          name="role"
          label="Role"
          initialValue={OrgRole.MEMBER}
          rules={[{ required: true, message: 'Select a role' }]}
        >
          <Select options={ROLE_OPTIONS} />
        </Form.Item>
      </Form>
    </Modal>
  );
}