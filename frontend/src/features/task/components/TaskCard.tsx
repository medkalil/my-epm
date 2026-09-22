import { Card, Typography, Dropdown, Avatar, Space, Tag } from 'antd';
import type { MenuProps } from 'antd';
import { Link } from 'react-router-dom';
import { ROUTES } from '@/routes/paths';
import { MoreOutlined, FolderOutlined, UserOutlined } from '@ant-design/icons';
import type { Task } from '../types/task.types';
import { StatusTag, PriorityTag } from '@/components/ui/StatusTags';

interface TaskCardProps {
  task: Task;
  projectName?: string;
  onEdit?: (task: Task) => void;
  onDelete?: (task: Task) => void;
}

export function TaskCard({ task, projectName, onEdit, onDelete }: TaskCardProps) {
  const menuItems: MenuProps['items'] = [];
  if (onEdit) {
    menuItems.push({ key: 'edit', label: 'Edit task', onClick: () => onEdit(task) });
  }
  if (onDelete) {
    menuItems.push({ key: 'delete', label: 'Delete task', danger: true, onClick: () => onDelete(task) });
  }

  const assigneeName = task.affectedUserName ?? (task.affectedUser ? task.affectedUser.name : undefined);

  return (
    <Card
      size="small"
      style={{ borderRadius: 10, boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}
      bodyStyle={{ padding: '10px 12px' }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          gap: 8,
        }}
      >
        <Space size={6} align="start">
          <Tag color="geekblue" style={{ margin: 0, fontSize: 10 }}>
            EPM-{task.id}
          </Tag>
          <Link to={ROUTES.tasks.detail(task.id)}>
            <Typography.Text
              strong
              style={{ fontSize: 13, color: '#0f172a', display: 'block', lineHeight: '20px' }}
            >
              {task.title}
            </Typography.Text>
          </Link>
        </Space>
        {menuItems.length > 0 && (
          <Dropdown menu={{ items: menuItems }} trigger={['click']} placement="bottomRight">
            <MoreOutlined style={{ cursor: 'pointer', color: '#8c8c8c', padding: 2 }} />
          </Dropdown>
        )}
      </div>

      {task.description && (
        <Typography.Paragraph
          type="secondary"
          ellipsis={{ rows: 2 }}
          style={{ fontSize: 12, margin: '6px 0 0', minHeight: 18 }}
        >
          {task.description}
        </Typography.Paragraph>
      )}

      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginTop: 10,
        }}
      >
        <Space size={4} wrap>
          {task.status && <StatusTag status={task.status} />}
          {task.priority && <PriorityTag priority={task.priority} />}
        </Space>
        <Space size={8}>
          {projectName && (
            <Tag icon={<FolderOutlined />} style={{ fontSize: 10, margin: 0 }}>
              <Link to={ROUTES.projects.detail(task.projectId)} style={{ color: 'inherit' }}>
                {projectName}
              </Link>
            </Tag>
          )}
          {assigneeName ? (
            <Avatar
              size={20}
              style={{ backgroundColor: '#1677FF', fontSize: 10, fontWeight: 600 }}
            >
              {assigneeName.charAt(0).toUpperCase()}
            </Avatar>
          ) : (
            <Avatar size={20} icon={<UserOutlined />} style={{ backgroundColor: '#d9d9d9' }} />
          )}
        </Space>
      </div>
    </Card>
  );
}