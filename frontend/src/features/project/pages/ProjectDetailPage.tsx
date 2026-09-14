import { useParams } from 'react-router-dom';
import { Card, Descriptions, Typography } from 'antd';
import { Link } from 'react-router-dom';
import { PageHeader } from '@/components/ui/PageHeader';
import { useProject } from '../api/project.queries';
import { useOrgStore } from '@/stores/orgStore';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { ROUTES } from '@/routes/paths';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { useDeleteProject } from '../api/project.queries';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function ProjectDetailPage() {
  const { id } = useParams<{ id: string }>();
  const projectId = Number(id);
  const activeOrganization = useOrgStore((state) => state.activeOrganization);
  const orgId = activeOrganization?.id;
  const navigate = useNavigate();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const deleteMutation = useDeleteProject(orgId!);

  const { data: project, isLoading } = useProject(projectId, orgId);

  if (isLoading) return <LoadingSpinner />;
  if (!project) return null;

  return (
    <div>
      <PageHeader
        title={project.name}
        subtitle={project.description || 'Project overview'}
        actions={
          <Link to={ROUTES.projects.base}>← Back to projects</Link>
        }
      />
      <Card>
        <Descriptions column={2} bordered>
          <Descriptions.Item label="Name">{project.name}</Descriptions.Item>
          <Descriptions.Item label="Organization">
            {activeOrganization?.name}
          </Descriptions.Item>
          <Descriptions.Item label="Description" span={2}>
            {project.description || '—'}
          </Descriptions.Item>
          <Descriptions.Item label="Created">
            {new Date(project.createdAt).toLocaleString()}
          </Descriptions.Item>
          <Descriptions.Item label="Last updated">
            {new Date(project.updatedAt).toLocaleString()}
          </Descriptions.Item>
        </Descriptions>
      </Card>

      <Typography.Text
        type="danger"
        style={{ cursor: 'pointer', marginTop: 16, display: 'inline-block' }}
        onClick={() => setConfirmOpen(true)}
      >
        Delete this project
      </Typography.Text>

      <ConfirmDialog
        open={confirmOpen}
        title={`Delete project "${project.name}"?`}
        content="This will permanently delete the project and all associated tasks."
        okText="Delete project"
        onConfirm={async () => {
          await deleteMutation.mutateAsync(projectId);
          navigate(ROUTES.projects.base);
        }}
        onCancel={() => setConfirmOpen(false)}
      />
    </div>
  );
}