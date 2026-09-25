import { useMemo, useState } from 'react';
import { Avatar, Button, Card, Popconfirm, Segmented, Space, Table, Tag, Typography } from 'antd';
import { CheckOutlined, ClockCircleOutlined, CloseOutlined } from '@ant-design/icons';
import type { TableProps } from 'antd';
import type { JoinRequest, JoinRequestStatus } from '../types/organization.types';
import { useApproveJoinRequest, useJoinRequests, useRejectJoinRequest } from '../api/organization.queries';
import { EmptyState } from '@/components/ui/EmptyState';

const STATUS_COLOR: Record<JoinRequestStatus, string> = {
  PENDING: 'gold',
  APPROVED: 'green',
  REJECTED: 'red',
};

interface JoinRequestsSectionProps {
  orgId: number;
}

export function JoinRequestsSection({ orgId }: JoinRequestsSectionProps) {
  const [statusFilter, setStatusFilter] = useState<JoinRequestStatus | 'ALL'>('ALL');
  const { data, isLoading } = useJoinRequests(orgId);
  const approveMutation = useApproveJoinRequest(orgId);
  const rejectMutation = useRejectJoinRequest(orgId);

  const requests = useMemo(() => {
    if (!data) return [];
    return statusFilter === 'ALL'
      ? data
      : data.filter((r) => r.status === statusFilter);
  }, [data, statusFilter]);

  const pendingCount = useMemo(
    () => (data ?? []).filter((r) => r.status === 'PENDING').length,
    [data],
  );

  const columns: TableProps<JoinRequest>['columns'] = [
    {
      title: 'Requester',
      key: 'requester',
      render: (_, record) => (
        <>
          <Avatar size="small" style={{ marginRight: 8 }}>
            {record.userName.charAt(0).toUpperCase() ?? '?'}
          </Avatar>
          <Typography.Text strong>{record.userName}</Typography.Text>
          {record.userEmail && (
            <Typography.Text type="secondary" style={{ marginLeft: 8 }}>
              {record.userEmail}
            </Typography.Text>
          )}
        </>
      ),
    },
    {
      title: 'Requested',
      dataIndex: 'requestedAt',
      key: 'requestedAt',
      render: (value: string) => new Date(value).toLocaleDateString(),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: JoinRequestStatus) => (
        <Tag color={STATUS_COLOR[status]}>{status}</Tag>
      ),
    },
    ...(statusFilter === 'ALL' || statusFilter === 'PENDING'
      ? [
          {
            title: 'Actions',
            key: 'actions',
            render: (_: unknown, record: JoinRequest) => {
              if (record.status !== 'PENDING') return null;
              return (
                <Space>
                  <Popconfirm
                    title="Approve this join request?"
                    description={`${record.userName} will be added as a MEMBER.`}
                    okText="Approve"
                    cancelText="Cancel"
                    onConfirm={() => approveMutation.mutate(record.id)}
                  >
                    <Button
                      size="small"
                      type="primary"
                      icon={<CheckOutlined />}
                      loading={approveMutation.isPending && approveMutation.variables === record.id}
                    >
                      Approve
                    </Button>
                  </Popconfirm>
                  <Popconfirm
                    title="Reject this join request?"
                    description={`${record.userName} won&apos;t be able to sign in while rejected.`}
                    okText="Reject"
                    cancelText="Cancel"
                    okButtonProps={{ danger: true }}
                    onConfirm={() => rejectMutation.mutate(record.id)}
                  >
                    <Button
                      size="small"
                      danger
                      icon={<CloseOutlined />}
                      loading={rejectMutation.isPending && rejectMutation.variables === record.id}
                    >
                      Reject
                    </Button>
                  </Popconfirm>
                </Space>
              );
            },
          },
        ]
      : []),
  ];

  return (
    <Card style={{ marginTop: 16 }}>
      <Space style={{ justifyContent: 'space-between', width: '100%', marginBottom: 8 }}>
        <Typography.Title level={5} style={{ margin: 0 }}>
          Join Requests
        </Typography.Title>
        {pendingCount > 0 && (
          <Tag color="gold" icon={<ClockCircleOutlined />}>
            {pendingCount} pending
          </Tag>
        )}
      </Space>
      <Typography.Paragraph type="secondary" style={{ marginTop: 4 }}>
        People who requested to join your organization will appear here. Approving adds them as a
        MEMBER and unlocks their sign-in.
      </Typography.Paragraph>

      <Segmented
        value={statusFilter}
        onChange={(value) => setStatusFilter(value as JoinRequestStatus | 'ALL')}
        options={['ALL', 'PENDING', 'APPROVED', 'REJECTED']}
        style={{ marginBottom: 16 }}
      />

      <Table<JoinRequest>
        rowKey="id"
        loading={isLoading}
        columns={columns}
        dataSource={requests}
        pagination={false}
        locale={{ emptyText: <EmptyState description="No join requests" /> }}
      />
    </Card>
  );
}