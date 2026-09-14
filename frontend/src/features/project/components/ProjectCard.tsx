import { Card, Typography } from 'antd';
import { Link } from 'react-router-dom';
import { ROUTES } from '@/routes/paths';
import dayjs from 'dayjs';
import type { Project } from '../types/project.types';

export function ProjectCard({ project }: { project: Project }) {
  return (
    <Link to={ROUTES.projects.detail(project.id)}>
      <Card hoverable style={{ height: '100%' }}>
        <Typography.Title level={5} ellipsis={{ rows: 1 }} style={{ marginTop: 0 }}>
          {project.name}
        </Typography.Title>
        <Typography.Paragraph
          type="secondary"
          ellipsis={{ rows: 2 }}
          style={{ minHeight: 44, marginBottom: 8 }}
        >
          {project.description || 'No description'}
        </Typography.Paragraph>
        <Typography.Text type="secondary" style={{ fontSize: 12 }}>
          Created {dayjs(project.createdAt).format('MMM D, YYYY')}
        </Typography.Text>
      </Card>
    </Link>
  );
}