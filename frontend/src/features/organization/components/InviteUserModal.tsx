import { Modal, Form, Select, Input, App } from 'antd';
import { OrgRole } from '@/types/common';
import { useInviteUser } from '../api/organization.queries';
import { getApiErrorMessage } from '@/lib/axios';

interface InviteUserModalProps {
  open: boolean;
  orgId: number;
  onClose: () => void;
}

const ROLE_OPTIONS = [
  { label: 'Admin', value: OrgRole.ADMIN },
  { label: 'Member', value: OrgRole.MEMBER },
  { label: 'Guest', value: OrgRole.GUEST },
];

export function InviteUserModal({ open, orgId, onClose }: InviteUserModalProps) {
  const { message } = App.useApp();
  const [form] = Form.useForm();

  const inviteUserMutation = useInviteUser(orgId);

  const handleOk = async () => {
    const values = await form.validateFields();
    try {
      await inviteUserMutation.mutateAsync({
        fullName: values.fullName,
        email: values.email,
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
      title="Invite user"
      open={open}
      onOk={handleOk}
      onCancel={onClose}
      confirmLoading={inviteUserMutation.isPending}
      okText="Send invite"
    >
      <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
        <Form.Item
          name="fullName"
          label="Full name"
          rules={[
            { required: true, message: 'Full name is required' },
            { min: 2, message: 'Full name must be at least 2 characters' },
          ]}
        >
          <Input placeholder="Jane Doe" size="large" />
        </Form.Item>
        <Form.Item
          name="email"
          label="Email"
          rules={[
            { required: true, message: 'Email is required' },
            { type: 'email', message: 'Enter a valid email address' },
          ]}
        >
          <Input placeholder="jane@company.com" size="large" />
        </Form.Item>
        <Form.Item
          name="role"
          label="Role"
          initialValue={OrgRole.MEMBER}
          rules={[{ required: true, message: 'Select a role' }]}
        >
          <Select options={ROLE_OPTIONS} size="large" />
        </Form.Item>
      </Form>
    </Modal>
  );
}