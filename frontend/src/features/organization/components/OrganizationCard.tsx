import { Card, Typography, Space, Button } from 'antd';
import { ApartmentOutlined } from '@ant-design/icons';
import { Link } from 'react-router-dom';
import { ROUTES } from '@/routes/paths';

export function OrganizationCard({
  id,
  name,
  slug,
  isActive,
}: {
  id: number;
  name: string;
  slug: string;
  isActive?: boolean;
}) {
  return (
    <Card hoverable>
      <Space direction="vertical" style={{ width: '100%' }}>
        <Space>
          <ApartmentOutlined style={{ fontSize: 24 }} />
          <div>
            <Typography.Text strong onClick={() => undefined}>
              {name}
            </Typography.Text>
            <br />
            <Typography.Text type="secondary">/{slug}</Typography.Text>
          </div>
        </Space>
        <Link to={ROUTES.organizations.settings(id)}>
          <Button size="small">Open settings</Button>
        </Link>
        {isActive && (
          <Typography.Text type="success" style={{ fontSize: 12 }}>
            ● Active workspace
          </Typography.Text>
        )}
      </Space>
    </Card>
  );
}