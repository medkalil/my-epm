import { Avatar, Table, Typography } from 'antd';
import type { TableProps } from 'antd';
import type { OrganizationMember } from '../types/organization.types';
import { RoleTag } from '@/components/ui/StatusTags';
import { EmptyState } from '@/components/ui/EmptyState';

export function MemberTable({ members, loading }: { members: OrganizationMember[]; loading: boolean }) {
  const columns: TableProps<OrganizationMember>['columns'] = [
    {
      title: 'Member',
      key: 'member',
      render: (_, record) => (
        <>
          <Avatar size="small" style={{ marginRight: 8 }}>
            {record.user?.name?.charAt(0).toUpperCase() ?? '?'}
          </Avatar>
          <Typography.Text strong>{record.user?.name ?? `User #${record.userId}`}</Typography.Text>
        </>
      ),
    },
    {
      title: 'Role',
      dataIndex: 'role',
      key: 'role',
      render: (role) => <RoleTag role={role} />,
    },
    {
      title: 'Status',
      dataIndex: 'active',
      key: 'active',
      render: (active: boolean) =>
        active ? (
          <Typography.Text type="success">Active</Typography.Text>
        ) : (
          <Typography.Text type="secondary">Inactive</Typography.Text>
        ),
    },
    {
      title: 'Joined',
      dataIndex: 'joinedAt',
      key: 'joinedAt',
      render: (value: string) => new Date(value).toLocaleDateString(),
    },
  ];

  return (
    <Table<OrganizationMember>
      rowKey="id"
      loading={loading}
      columns={columns}
      dataSource={members}
      pagination={false}
      locale={{ emptyText: <EmptyState description="No members yet" /> }}
    />
  );
}