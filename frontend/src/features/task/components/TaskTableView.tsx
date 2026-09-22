import { Table, Tag, Avatar, Dropdown, Typography, Space, Button, Row, Col } from 'antd';
import { MoreOutlined } from '@ant-design/icons';
import type { ColumnsType, TableProps } from 'antd/es/table';
import { Link } from 'react-router-dom';
import { ROUTES } from '@/routes/paths';
import { useProjects } from '@/features/project/api/project.queries';
import { useOrganizationMembers } from '@/features/organization/api/organization.queries';
import { useOrgStore } from '@/stores/orgStore';
import { StatusTag, PriorityTag } from '@/components/ui/StatusTags';
import { EmptyState } from '@/components/ui/EmptyState';
import type { Task } from '../types/task.types';
import { TaskPriority } from '@/types/common';

interface TaskTableViewProps {
  tasks: Task[];
  onEdit: (task: Task) => void;
  onDelete: (task: Task) => void;
}

export function TaskTableView({ tasks, onEdit, onDelete }: TaskTableViewProps) {
  const { data: projectsData = [] } = useProjects();
  const activeOrganization = useOrgStore((state) => state.activeOrganization);
  const { data: orgMembers = [] } = useOrganizationMembers(activeOrganization?.id);

  const projectNameOf = new Map(projectsData.map((p) => [p.id, p.name]));
  const memberOf = new Map(orgMembers.map((m) => [m.userId, m.user?.name ?? `User #${m.userId}`]));

  const columns: ColumnsType<Task> = [
    {
      title: 'Task',
      key: 'task',
      render: (_, task) => (
        <Space direction="vertical" size={0}>
          <Typography.Text strong>
            <Link to={ROUTES.tasks.detail(task.id)}>{task.title}</Link>
          </Typography.Text>
          <Typography.Text type="secondary" style={{ fontSize: 11 }}>
            EPM-{task.id}
          </Typography.Text>
        </Space>
      ),
    },
    {
      title: 'Project',
      dataIndex: 'projectId',
      key: 'projectId',
      render: (projectId: number) =>
        projectNameOf.has(projectId) ? (
          <Tag color="blue" style={{ margin: 0 }}>
            {projectNameOf.get(projectId)}
          </Tag>
        ) : (
          <Typography.Text type="secondary">—</Typography.Text>
        ),
    },
    {
      title: 'Assignee',
      key: 'assignee',
      render: (_, task) => {
        const name = task.affectedUserName ?? (task.affectedUserId ? memberOf.get(task.affectedUserId) : undefined);
        if (!name) return <Typography.Text type="secondary">—</Typography.Text>;
        return (
          <Space size={6}>
            <Avatar size={22} style={{ backgroundColor: '#1677FF', fontSize: 10 }}>
              {name.charAt(0).toUpperCase()}
            </Avatar>
            <Typography.Text style={{ fontSize: 13 }}>{name}</Typography.Text>
          </Space>
        );
      },
    },
    {
      title: 'Priority',
      dataIndex: 'priority',
      key: 'priority',
      width: 100,
      render: (priority?: string) => (priority ? <PriorityTag priority={priority as TaskPriority} /> : null),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      width: 120,
      render: (status: Task['status']) => <StatusTag status={status} />,
    },
    {
      title: '',
      key: 'actions',
      width: 48,
      render: (_, task) => (
        <Dropdown
          menu={{
            items: [
              { key: 'edit', label: 'Edit task', onClick: () => onEdit(task) },
              { key: 'delete', label: 'Delete task', danger: true, onClick: () => onDelete(task) },
            ],
          }}
          trigger={['click']}
        >
          <Button type="text" size="small" icon={<MoreOutlined />} />
        </Dropdown>
      ),
    },
  ];

  const pagination: TableProps<Task>['pagination'] = {
    pageSize: 8,
    showSizeChanger: false,
    showTotal: (total) => `${total} tasks`,
  };

  if (tasks.length === 0) {
    return <EmptyState description="No tasks match your filters" />;
  }

  return (
    <Row justify="center">
      <Col span={24}>
        <Table
          rowKey="id"
          columns={columns}
          dataSource={tasks}
          pagination={pagination}
          size="small"
        />
      </Col>
    </Row>
  );
}