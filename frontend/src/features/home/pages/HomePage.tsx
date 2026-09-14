import { Button, Layout, Space, Typography, Row, Col, Card } from 'antd';
import {
  LoginOutlined,
  RocketOutlined,
  TeamOutlined,
  SafetyCertificateOutlined,
  ProjectOutlined,
  CheckSquareOutlined,
} from '@ant-design/icons';
import { Link } from 'react-router-dom';
import { ROUTES } from '@/routes/paths';

const FEATURES = [
  {
    icon: <ProjectOutlined />,
    title: 'Project Management',
    description: 'Organize teams, scope projects, and track deliverables in one central workspace.',
  },
  {
    icon: <TeamOutlined />,
    title: 'Team Collaboration',
    description: 'Role-based access control for organizations with OWNER, ADMIN, MEMBER and GUEST roles.',
  },
  {
    icon: <CheckSquareOutlined />,
    title: 'Task Tracking',
    description: 'Full task lifecycle with priorities, assignments and status workflows.',
  },
  {
    icon: <SafetyCertificateOutlined />,
    title: 'Enterprise Security',
    description: 'JWT authentication, tenant isolation, refresh token rotation, and audit logs.',
  },
];

export default function HomePage() {
  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Layout.Header
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          background: 'transparent',
          position: 'sticky',
          top: 0,
          zIndex: 10,
        }}
      >
        <Typography.Title level={4} style={{ margin: 0, color: '#1e293b' }}>
          MY-EPM
        </Typography.Title>
        <Space>
          <Link to={ROUTES.login}>
            <Button icon={<LoginOutlined />}>Sign in</Button>
          </Link>
          <Link to={ROUTES.register}>
            <Button type="primary" icon={<RocketOutlined />}>
              Get started
            </Button>
          </Link>
        </Space>
      </Layout.Header>

      <Layout.Content style={{ flex: 1, padding: '40px 24px' }}>
        <div style={{ textAlign: 'center', maxWidth: 720, margin: '0 auto 64px' }}>
          <Typography.Title>
            Enterprise Project Management, <br />
            built for scale
          </Typography.Title>
          <Typography.Paragraph type="secondary" style={{ fontSize: 16 }}>
            MY-EPM is a multi-tenant, SaaS-ready platform for managing organizations, teams,
            projects, and tasks — with granular security and full tenant data isolation.
          </Typography.Paragraph>
          <Link to={ROUTES.register}>
            <Button type="primary" size="large" icon={<RocketOutlined />}>
              Create your organization
            </Button>
          </Link>
        </div>

        <Row gutter={[24, 24]} justify="center">
          {FEATURES.map((feature) => (
            <Col xs={24} sm={12} lg={6} key={feature.title}>
              <Card hoverable>
                <Space direction="vertical" size="small">
                  <span style={{ fontSize: 28 }}>{feature.icon}</span>
                  <Typography.Title level={5} style={{ margin: 0 }}>
                    {feature.title}
                  </Typography.Title>
                  <Typography.Text type="secondary">{feature.description}</Typography.Text>
                </Space>
              </Card>
            </Col>
          ))}
        </Row>
      </Layout.Content>

      <Layout.Footer style={{ textAlign: 'center' }}>
        MY-EPM ©{new Date().getFullYear()} · Enterprise Project Management Platform
      </Layout.Footer>
    </Layout>
  );
}