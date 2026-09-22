import { Card, Typography, Tag, Progress, Avatar, Tooltip, Dropdown, Button, Space } from 'antd';
import {
  MoreOutlined,
  UserOutlined,
  UsergroupAddOutlined,
  DeleteOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  SyncOutlined,
} from '@ant-design/icons';
import type { MenuProps } from 'antd';
import type { Project, ProjectStatus } from '../types/project.types';
import type { OrganizationMember } from '@/features/organization/types/organization.types';

interface ProjectCardProps {
  project: Project;
  orgMembers?: OrganizationMember[];
  progressPercent?: number;
  onManageMembers: (project: Project) => void;
  onUpdateStatus: (project: Project, status: ProjectStatus) => void;
  onDelete: (project: Project) => void;
}

const statusConfig: Record<
  ProjectStatus,
  { label: string; color: string; bg: string; icon: React.ReactNode }
> = {
  IN_PROGRESS: {
    label: 'In Progress',
    color: '#1890ff',
    bg: '#e6f7ff',
    icon: <SyncOutlined spin />,
  },
  IN_REVIEW: {
    label: 'In Review',
    color: '#fa8c16',
    bg: '#fff7e6',
    icon: <ClockCircleOutlined />,
  },
  COMPLETED: {
    label: 'Completed',
    color: '#52c41a',
    bg: '#f6ffed',
    icon: <CheckCircleOutlined />,
  },
};

export function ProjectCard({
  project,
  orgMembers = [],
  progressPercent,
  onManageMembers,
  onUpdateStatus,
  onDelete,
}: ProjectCardProps) {
  const currentStatus = project.status || 'IN_PROGRESS';
  const statusMeta = statusConfig[currentStatus] || statusConfig.IN_PROGRESS;

  // Map memberIds to orgMember details
  const assignedMembers = (project.memberIds ?? []).map((userId) => {
    const found = orgMembers.find((m) => m.userId === userId);
    return {
      userId,
      name: found?.user?.name ?? `User #${userId}`,
    };
  });

  // Derived progress percentage for visual polish based on status
  const percent =
    progressPercent ??
    (currentStatus === 'COMPLETED' ? 100 : currentStatus === 'IN_REVIEW' ? 85 : 45);

  const menuItems: MenuProps['items'] = [
    {
      key: 'manage-members',
      label: 'Manage Contributors',
      icon: <UsergroupAddOutlined />,
      onClick: () => onManageMembers(project),
    },
    {
      type: 'divider',
    },
    {
      key: 'status-header',
      label: 'Change Status',
      type: 'group',
      children: [
        {
          key: 'set-in-progress',
          label: 'Set In Progress',
          disabled: currentStatus === 'IN_PROGRESS',
          onClick: () => onUpdateStatus(project, 'IN_PROGRESS'),
        },
        {
          key: 'set-in-review',
          label: 'Set In Review',
          disabled: currentStatus === 'IN_REVIEW',
          onClick: () => onUpdateStatus(project, 'IN_REVIEW'),
        },
        {
          key: 'set-completed',
          label: 'Set Completed',
          disabled: currentStatus === 'COMPLETED',
          onClick: () => onUpdateStatus(project, 'COMPLETED'),
        },
      ],
    },
    {
      type: 'divider',
    },
    {
      key: 'delete',
      danger: true,
      label: 'Delete Project',
      icon: <DeleteOutlined />,
      onClick: () => onDelete(project),
    },
  ];

  return (
    <Card
      hoverable
      style={{
        borderRadius: 12,
        border: '1px solid #f0f0f0',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
      }}
      bodyStyle={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        padding: 20,
      }}
    >
      {/* Card Header: Code/Badge & Actions */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
        <Space size={8}>
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: 8,
              backgroundColor: '#f5f5f5',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 700,
              fontSize: 12,
              color: '#595959',
            }}
          >
            P{project.id}
          </div>
          <div>
            <Tag
              color={statusMeta.color}
              style={{
                borderRadius: 12,
                padding: '1px 10px',
                fontWeight: 500,
                fontSize: 12,
                border: 'none',
              }}
            >
              {statusMeta.label}
            </Tag>
          </div>
        </Space>

        <Dropdown menu={{ items: menuItems }} trigger={['click']}>
          <Button type="text" shape="circle" icon={<MoreOutlined />} />
        </Dropdown>
      </div>

      {/* Title and description */}
      <div style={{ flex: 1, marginBottom: 16 }}>
        <Typography.Title
          level={5}
          style={{ margin: '0 0 6px 0', fontSize: 16, fontWeight: 600, color: '#141414' }}
          ellipsis={{ rows: 1 }}
        >
          {project.name}
        </Typography.Title>
        <Typography.Paragraph
          type="secondary"
          ellipsis={{ rows: 2 }}
          style={{ fontSize: 13, marginBottom: 0, minHeight: 38 }}
        >
          {project.description || 'No description provided.'}
        </Typography.Paragraph>
      </div>

      {/* Progress */}
      <div style={{ marginBottom: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
          <Typography.Text type="secondary" style={{ fontSize: 12 }}>
            Velocity / Health
          </Typography.Text>
          <Typography.Text strong style={{ fontSize: 12 }}>
            {percent}%
          </Typography.Text>
        </div>
        <Progress
          percent={percent}
          showInfo={false}
          strokeColor={currentStatus === 'COMPLETED' ? '#52c41a' : '#1890ff'}
          size="small"
        />
      </div>

      {/* Footer: Contributors & Quick Action */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          paddingTop: 12,
          borderTop: '1px solid #f5f5f5',
        }}
      >
        <Avatar.Group
          maxCount={3}
          maxStyle={{ color: '#f56a00', backgroundColor: '#fde3cf', fontSize: 12 }}
        >
          {assignedMembers.length > 0 ? (
            assignedMembers.map((m) => (
              <Tooltip key={m.userId} title={m.name} placement="top">
                <Avatar
                  style={{ backgroundColor: '#1890ff', fontSize: 12 }}
                  icon={<UserOutlined />}
                >
                  {m.name.charAt(0).toUpperCase()}
                </Avatar>
              </Tooltip>
            ))
          ) : (
            <Tooltip title="No contributors assigned yet">
              <Avatar style={{ backgroundColor: '#f0f0f0', color: '#bfbfbf', fontSize: 12 }} icon={<UserOutlined />} />
            </Tooltip>
          )}
        </Avatar.Group>

        <Button
          type="link"
          size="small"
          icon={<UsergroupAddOutlined />}
          onClick={() => onManageMembers(project)}
          style={{ padding: 0, fontSize: 12 }}
        >
          {assignedMembers.length > 0 ? `${assignedMembers.length} Members` : 'Assign'}
        </Button>
      </div>
    </Card>
  );
}