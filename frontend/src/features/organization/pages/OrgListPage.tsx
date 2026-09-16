import { Button, Row, Col, Typography, Space } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { Link, useNavigate } from 'react-router-dom';
import { PageHeader } from '@/components/ui/PageHeader';
import { OrganizationCard } from '../components/OrganizationCard';
import { useMyOrganizations } from '../api/organization.queries';
import { useOrgStore } from '@/stores/orgStore';
import { ROUTES } from '@/routes/paths';
import { EmptyState } from '@/components/ui/EmptyState';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

export default function OrgListPage() {
  const navigate = useNavigate();
  const { data, isLoading } = useMyOrganizations();
  const activeOrganization = useOrgStore((state) => state.activeOrganization);

  if (isLoading) return <LoadingSpinner />;

  const organizations = data ?? [];

  return (
    <div>
      <PageHeader
        title="Organizations"
        subtitle="Manage your workspaces"
        actions={
          <Link to={ROUTES.organizations.create}>
            <Button type="primary" icon={<PlusOutlined />}>
              Create organization
            </Button>
          </Link>
        }
      />

      {organizations.length === 0 ? (
        <EmptyState
          description="You are not part of any organization yet"
          actionLabel="Create your first organization"
          onAction={() => navigate(ROUTES.organizations.create)}
        />
      ) : (
        <Row gutter={[16, 16]}>
          {organizations.map((org) => (
            <Col xs={24} sm={12} lg={8} key={org.id}>
              <OrganizationCard
                id={org.id}
                name={org.name}
                slug={org.slug}
                isActive={activeOrganization?.id === org.id}
              />
            </Col>
          ))}
        </Row>
      )}
      <Space direction="vertical" style={{ marginTop: 16, width: '100%' }}>
        <Typography.Text type="secondary">
          Need to create another workspace?{' '}
          <Link to={ROUTES.organizations.create}>Create organization</Link>
        </Typography.Text>
      </Space>
    </div>
  );
}