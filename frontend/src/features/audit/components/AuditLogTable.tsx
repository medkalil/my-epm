import { Table, Tag, Tooltip, Typography } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { useMemo } from 'react';
import type { AuditAction, AuditLog, AuditResource } from '../types/audit.types';

const ACTION_COLOR: Record<AuditAction, string> = {
  CREATE: 'green',
  UPDATE: 'blue',
  DELETE: 'red',
  MOVE: 'purple',
  LOGIN: 'cyan',
  LOGOUT: 'magenta',
  SWITCH: 'gold',
};

const RESOURCE_COLOR: Record<AuditResource, string> = {
  AUTH: 'default',
  ORGANIZATION: 'gold',
  MEMBER: 'geekblue',
  PROJECT: 'volcano',
  TASK: 'blue',
  USER: 'cyan',
  OTHER: 'default',
};

interface AuditLogTableProps {
  logs?: AuditLog[];
  loading: boolean;
  total: number;
  page: number;
  size: number;
  onPageChange: (page: number, size: number) => void;
}

function actionLabel(action: string): string {
  return action
    .toLowerCase()
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

export function AuditLogTable({
  logs,
  loading,
  total,
  page,
  size,
  onPageChange,
}: AuditLogTableProps) {
  const columns = useMemo<ColumnsType<AuditLog>>(
    () => [
      {
        title: 'Timestamp',
        dataIndex: 'createdAt',
        width: 176,
        render: (value: string) => (
          <Typography.Text style={{ whiteSpace: 'nowrap' }}>
            {new Date(value).toLocaleString()}
          </Typography.Text>
        ),
      },
      {
        title: 'Actor',
        dataIndex: 'actor',
        render: (actor: string) => <Typography.Text strong>{actor}</Typography.Text>,
      },
      {
        title: 'Action',
        dataIndex: 'action',
        render: (action: AuditAction) => (
          <Tag color={ACTION_COLOR[action]}>{actionLabel(action)}</Tag>
        ),
      },
      {
        title: 'Resource',
        dataIndex: 'resource',
        render: (_: unknown, record: AuditLog) => (
          <span>
            <Tag color={RESOURCE_COLOR[record.resource]}>{record.resource}</Tag>
            {record.resourceId != null && (
              <Typography.Text type="secondary">#{record.resourceId}</Typography.Text>
            )}
          </span>
        ),
      },
      {
        title: 'Request',
        dataIndex: 'path',
        ellipse: true,
        render: (_: unknown, record: AuditLog) => (
          <Tooltip title={record.path}>
            <Typography.Text code style={{ fontSize: 12 }}>
              {record.httpMethod} {record.path}
            </Typography.Text>
          </Tooltip>
        ),
      },
      {
        title: 'Status',
        dataIndex: 'statusCode',
        width: 90,
        render: (_: unknown, record: AuditLog) =>
          record.success ? (
            <Tag color="success">{record.statusCode}</Tag>
          ) : (
            <Tooltip title={record.errorMessage}>
              <Tag color="error">{record.statusCode}</Tag>
            </Tooltip>
          ),
      },
      {
        title: 'Duration',
        dataIndex: 'durationMs',
        width: 90,
        render: (duration: number | null) =>
          duration != null ? `${duration} ms` : '-',
      },
      {
        title: 'IP',
        dataIndex: 'ipAddress',
        width: 130,
        render: (ip: string | null) => (ip ? <Typography.Text>{ip}</Typography.Text> : '-'),
      },
    ],
    [],
  );

  return (
    <Table
      rowKey="id"
      loading={loading}
      columns={columns}
      dataSource={logs ?? []}
      scroll={{ x: 1100 }}
      pagination={{
        current: page + 1,
        pageSize: size,
        total,
        showSizeChanger: true,
        pageSizeOptions: [10, 20, 50, 100],
        onChange: onPageChange,
        showTotal: (t) => `${t} events`,
      }}
      locale={{ emptyText: 'No audit events recorded yet' }}
    />
  );
}