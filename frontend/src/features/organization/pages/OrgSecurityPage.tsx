import { useParams } from 'react-router-dom';
import { Card, Table, Tag, Typography } from 'antd';
import { PageHeader } from '@/components/ui/PageHeader';
import { useOrganizationMembers } from '../api/organization.queries';
import { RoleTag } from '@/components/ui/StatusTags';

export default function OrgSecurityPage() {
  const { id } = useParams<{ id: string }>();
  const orgId = Number(id);

  const { data } = useOrganizationMembers(orgId);
  const members = data ?? [];

  const roleDistribution = members.reduce<Record<string, number>>((acc, member) => {
    acc[member.role] = (acc[member.role] ?? 0) + 1;
    return acc;
  }, {});

  return (
    <div>
      <PageHeader
        title="Security & Audit Logs"
        subtitle="Organization security overview and activity"
      />

      <Card title="Security Overview" style={{ marginBottom: 16 }}>
        <Typography.Paragraph type="secondary">
          Organization-level security controls and audit activity. Review member access and roles to ensure compliance.
        </Typography.Paragraph>
        <Table
          rowKey="role"
          pagination={false}
          dataSource={Object.entries(roleDistribution).map(([role, count]) => ({
            role,
            count,
          }))}
          columns={[
            {
              title: 'Role',
              dataIndex: 'role',
              render: (role) => <RoleTag role={role} />,
            },
            {
              title: 'Count',
              dataIndex: 'count',
            },
          ]}
        />
      </Card>

      <Card title="Recent Activity" style={{ marginBottom: 16 }}>
        <Table
          rowKey="id"
          pagination={false}
          dataSource={[]}
          locale={{ emptyText: 'No activity recorded yet' }}
          columns={[
            { title: 'Action', dataIndex: 'action' },
            { title: 'User', dataIndex: 'user' },
            { title: 'Date', dataIndex: 'date' },
          ]}
        />
      </Card>

      <Card title="Permissions">
        <Table
          rowKey="key"
          pagination={false}
          dataSource={[
            { key: '1', role: 'OWNER', action: 'Full access to all resources, delete org', scope: 'Organization' },
            { key: '2', role: 'ADMIN', action: 'Manage members, projects, tasks', scope: 'Organization' },
            { key: '3', role: 'MEMBER', action: 'View, create and edit projects & tasks', scope: 'Project' },
            { key: '4', role: 'GUEST', action: 'Read-only access to assigned projects', scope: 'Project' },
          ]}
          columns={[
            { title: 'Role', dataIndex: 'role', render: (r) => <Tag>{r}</Tag> },
            { title: 'Action', dataIndex: 'action' },
            { title: 'Scope', dataIndex: 'scope' },
          ]}
        />
      </Card>
    </div>
  );
}