import { useParams } from 'react-router-dom';
import { Card, Descriptions, Tag, Typography } from 'antd';
import { PageHeader } from '@/components/ui/PageHeader';
import { useQuery } from '@tanstack/react-query';
import { organizationService } from '@/services/organization.service';
import { useOrganizationMembers } from '../api/organization.queries';
import { MemberTable } from '../components/MemberTable';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { ErrorState } from '@/components/ui/ErrorState';
import { getApiErrorMessage } from '@/lib/axios';

export default function OrgDetailPage() {
  const { id } = useParams<{ id: string }>();
  const orgId = Number(id);

  const orgQuery = useQuery({
    queryKey: ['organizations', orgId],
    queryFn: () => organizationService.getById(orgId),
    enabled: !!orgId,
  });

  const membersQuery = useOrganizationMembers(orgId);

  if (orgQuery.isLoading) return <LoadingSpinner />;
  if (orgQuery.isError) return <ErrorState message={getApiErrorMessage(orgQuery.error)} />;

  const org = orgQuery.data;
  if (!org) return null;

  return (
    <div>
      <PageHeader title={org.name} subtitle={`/${org.slug}`} />
      <Card>
        <Descriptions column={2}>
          <Descriptions.Item label="Name">{org.name}</Descriptions.Item>
          <Descriptions.Item label="Slug">
            <Tag>/{org.slug}</Tag>
          </Descriptions.Item>
          <Descriptions.Item label="Owner ID">{org.ownerId}</Descriptions.Item>
          <Descriptions.Item label="Created">
            {new Date(org.createdAt).toLocaleDateString()}
          </Descriptions.Item>
        </Descriptions>
      </Card>

      <Typography.Title level={4} style={{ marginTop: 24 }}>
        Members
      </Typography.Title>
      <MemberTable members={membersQuery.data ?? []} loading={membersQuery.isLoading} />
    </div>
  );
}