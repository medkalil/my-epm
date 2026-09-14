import { Tag } from 'antd';
import { TaskStatus, TaskPriority, OrgRole } from '@/types/common';
import { CheckCircleOutlined, ClockCircleOutlined, PlayCircleOutlined } from '@ant-design/icons';

const STATUS_META: Record<
  TaskStatus,
  { color: string; icon: React.ReactNode; label: string }
> = {
  [TaskStatus.TODO]: {
    color: 'default',
    icon: <ClockCircleOutlined />,
    label: 'To Do',
  },
  [TaskStatus.IN_PROGRESS]: {
    color: 'processing',
    icon: <PlayCircleOutlined />,
    label: 'In Progress',
  },
  [TaskStatus.IN_REVIEW]: {
    color: 'warning',
    icon: <ClockCircleOutlined />,
    label: 'In Review',
  },
  [TaskStatus.DONE]: {
    color: 'success',
    icon: <CheckCircleOutlined />,
    label: 'Done',
  },
};

const PRIORITY_COLOR: Record<TaskPriority, string> = {
  [TaskPriority.LOW]: 'default',
  [TaskPriority.MEDIUM]: 'blue',
  [TaskPriority.HIGH]: 'orange',
  [TaskPriority.URGENT]: 'red',
};

const ROLE_COLOR: Record<OrgRole, string> = {
  [OrgRole.OWNER]: 'gold',
  [OrgRole.ADMIN]: 'volcano',
  [OrgRole.MEMBER]: 'blue',
  [OrgRole.GUEST]: 'default',
};

interface StatusTagProps {
  status: TaskStatus;
}

export function StatusTag({ status }: StatusTagProps) {
  const meta = STATUS_META[status];
  return (
    <Tag color={meta.color} icon={meta.icon}>
      {meta.label}
    </Tag>
  );
}

interface PriorityTagProps {
  priority: TaskPriority;
}

export function PriorityTag({ priority }: PriorityTagProps) {
  return <Tag color={PRIORITY_COLOR[priority]}>{priority}</Tag>;
}

interface RoleTagProps {
  role: OrgRole;
}

export function RoleTag({ role }: RoleTagProps) {
  return <Tag color={ROLE_COLOR[role]}>{role}</Tag>;
}