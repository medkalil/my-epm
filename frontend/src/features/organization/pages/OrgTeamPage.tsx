import { useParams } from 'react-router-dom';
import { Button, Card, Space, Typography } from 'antd';
import { UserAddOutlined } from '@ant-design/icons';
import { useState } from 'react';
import { PageHeader } from '@/components/ui/PageHeader';
import { MemberTable } from '../components/MemberTable';
import { AddMemberModal } from '../components/AddMemberModal';
import { useOrganizationMembers } from '../api/organization.queries';

export default function OrgTeamPage() {
  const { id } = useParams<{ id: string }>();
  const orgId = Number(id);
  const [modalOpen, setModalOpen] = useState(false);

  const { data, isLoading } = useOrganizationMembers(orgId);

  const members = data ?? [];

  return (
    <div>
      <PageHeader
        title="Team & Access"
        subtitle="Manage roles and access for your organization members"
        actions={
          <Button
            type="primary"
            icon={<UserAddOutlined />}
            onClick={() => setModalOpen(true)}
          >
            Add member
          </Button>
        }
      />

      <Card>
        <Typography.Title level={5} style={{ marginTop: 0 }}>
          Members
        </Typography.Title>
        <Typography.Paragraph type="secondary">
          {members.length} member{members.length !== 1 ? 's' : ''} in this workspace
        </Typography.Paragraph>
        <MemberTable members={members} loading={isLoading} />
      </Card>

      <Space direction="vertical" style={{ marginTop: 16 }}>
        <Typography.Text type="secondary">
          Roles: <Typography.Text strong>OWNER</Typography.Text> (full control) ·{' '}
          <Typography.Text strong>ADMIN</Typography.Text> (manage members) ·{' '}
          <Typography.Text strong>MEMBER</Typography.Text> (collaborate) ·{' '}
          <Typography.Text strong>GUEST</Typography.Text> (read-only access)
        </Typography.Text>
      </Space>

      <AddMemberModal
        open={modalOpen}
        orgId={orgId}
        onClose={() => setModalOpen(false)}
      />
    </div>
  );
}