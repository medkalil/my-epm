import { useParams } from 'react-router-dom';
import { Card, Descriptions, Tag } from 'antd';
import { PageHeader } from '@/components/ui/PageHeader';
import { useQuery } from '@tanstack/react-query';
import { organizationService } from '@/services/organization.service';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

export default function OrgSettingsPage() {
  const { id } = useParams<{ id: string }>();
  const orgId = Number(id);

  const { data: org, isLoading } = useQuery({
    queryKey: ['organizations', orgId],
    queryFn: () => organizationService.getById(orgId),
    enabled: !!orgId,
  });

  if (isLoading) return <LoadingSpinner />;
  if (!org) return null;

  return (
    <div>
      <PageHeader
        title="Organization Settings"
        subtitle={`Manage ${org.name}`}
      />
      <Card>
        <Descriptions column={1} bordered>
          <Descriptions.Item label="Name">{org.name}</Descriptions.Item>
          <Descriptions.Item label="Slug">
            <Tag>/{org.slug}</Tag>
          </Descriptions.Item>
          <Descriptions.Item label="Owner">
            User #{org.ownerId}
          </Descriptions.Item>
          <Descriptions.Item label="Created at">
            {new Date(org.createdAt).toLocaleString()}
          </Descriptions.Item>
          <Descriptions.Item label="Last updated">
            {new Date(org.updatedAt).toLocaleString()}
          </Descriptions.Item>
        </Descriptions>
      </Card>
    </div>
  );
}