import { Button, Row, Col } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { useState } from 'react';
import { PageHeader } from '@/components/ui/PageHeader';
import { ProjectCard } from '../components/ProjectCard';
import { CreateProjectModal } from '../components/CreateProjectModal';
import { useProjects } from '../api/project.queries';
import { EmptyState } from '@/components/ui/EmptyState';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { useOrgStore } from '@/stores/orgStore';

export default function ProjectListPage() {
  const [modalOpen, setModalOpen] = useState(false);
  const activeOrganization = useOrgStore((state) => state.activeOrganization);
  const { data, isLoading } = useProjects();

  if (!activeOrganization) {
    return (
      <EmptyState
        description="Select an organization from the header to view projects"
        actionLabel="Create organization"
        onAction={() => undefined}
      />
    );
  }

  if (isLoading) return <LoadingSpinner />;

  const projects = data?.content ?? [];

  return (
    <div>
      <PageHeader
        title="Projects"
        subtitle={`${activeOrganization.name}`}
        actions={
          <Button type="primary" icon={<PlusOutlined />} onClick={() => setModalOpen(true)}>
            New project
          </Button>
        }
      />

      {projects.length === 0 ? (
        <EmptyState
          description="No projects in this workspace yet"
          actionLabel="Create your first project"
          onAction={() => setModalOpen(true)}
        />
      ) : (
        <Row gutter={[16, 16]}>
          {projects.map((project) => (
            <Col xs={24} sm={12} lg={8} key={project.id}>
              <ProjectCard project={project} />
            </Col>
          ))}
        </Row>
      )}

      <CreateProjectModal open={modalOpen} onClose={() => setModalOpen(false)} />
    </div>
  );
}