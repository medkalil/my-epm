import { Card, Typography } from 'antd';
import { Link } from 'react-router-dom';
import { ROUTES } from '@/routes/paths';
import type { Task } from '../types/task.types';
import { StatusTag, PriorityTag } from '@/components/ui/StatusTags';

export function TaskCard({ task }: { task: Task }) {
  return (
    <Link to={ROUTES.tasks.detail(task.id)}>
      <Card hoverable size="small">
        <Typography.Paragraph
          ellipsis={{ rows: 1 }}
          strong
          style={{ marginTop: 0, marginBottom: 4 }}
        >
          {task.title}
        </Typography.Paragraph>
        <Typography.Paragraph
          type="secondary"
          ellipsis={{ rows: 2 }}
          style={{ fontSize: 12, marginBottom: 8, minHeight: 32 }}
        >
          {task.description || 'No description'}
        </Typography.Paragraph>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <StatusTag status={task.status} />
          {task.priority && <PriorityTag priority={task.priority} />}
        </div>
      </Card>
    </Link>
  );
}