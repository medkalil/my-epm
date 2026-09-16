import { Outlet, Link } from 'react-router-dom';
import { Space, Typography, Tag, Card, Row, Col, Avatar } from 'antd';
import {
  ApartmentOutlined,
  LockOutlined,
  CheckCircleOutlined,
  CloudServerOutlined,
  SafetyCertificateOutlined,
} from '@ant-design/icons';
import { ROUTES } from '@/routes/paths';

const { Text, Title, Paragraph } = Typography;

export function AuthLayout() {
  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#f1f5f9',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: '24px 32px',
      }}
    >
      {/* Top Navbar */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          maxWidth: 1200,
          width: '100%',
          margin: '0 auto 24px',
        }}
      >
        <Link to={ROUTES.home} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: 8,
              background: '#1677FF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff',
            }}
          >
            <ApartmentOutlined style={{ fontSize: 18 }} />
          </div>
          <div>
            <Text strong style={{ fontSize: 15, color: '#0f172a' }}>
              MY-EPM
            </Text>
            <Tag color="blue" style={{ marginLeft: 6, fontSize: 10, padding: '0 4px' }}>
              MULTI-TENANT CORE
            </Tag>
          </div>
        </Link>

        <Tag
          icon={<LockOutlined />}
          color="default"
          style={{
            background: '#ffffff',
            border: '1px solid #cbd5e1',
            borderRadius: 6,
            padding: '4px 10px',
            fontSize: 12,
            color: '#475569',
          }}
        >
          Tenant-Isolated TLS 1.3
        </Tag>
      </div>

      {/* Main Center Content Grid */}
      <div
        style={{
          maxWidth: 1100,
          width: '100%',
          margin: '0 auto',
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Row gutter={[32, 32]} align="middle" style={{ width: '100%' }}>
          {/* Left / Form Area */}
          <Col xs={24} lg={13}>
            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <Outlet />
            </div>
          </Col>

          {/* Right / Enterprise Reliability Showcase */}
          <Col xs={24} lg={11}>
            <Card
              style={{
                background: '#ffffff',
                borderRadius: 16,
                border: '1px solid #e2e8f0',
                boxShadow: '0 10px 25px -5px rgba(15, 23, 42, 0.05)',
              }}
              bodyStyle={{ padding: 28 }}
            >
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: 16,
                }}
              >
                <Tag color="blue" icon={<CloudServerOutlined />}>
                  ENTERPRISE CLOUD
                </Tag>
                <Tag color="cyan">Always Free Access</Tag>
              </div>

              <Text
                type="secondary"
                style={{ fontSize: 11, fontWeight: 700, letterSpacing: 0.8, textTransform: 'uppercase' }}
              >
                Enterprise Reliability
              </Text>
              <Title level={4} style={{ margin: '4px 0 8px', color: '#0f172a' }}>
                Built for scale &amp; collaboration
              </Title>
              <Paragraph type="secondary" style={{ fontSize: 13, marginBottom: 20 }}>
                Reliable, frictionless workspace management with enterprise security and seamless
                single sign-on.
              </Paragraph>

              <Space direction="vertical" size={14} style={{ width: '100%' }}>
                <div
                  style={{
                    background: '#f8fafc',
                    padding: '12px 16px',
                    borderRadius: 8,
                    border: '1px solid #e2e8f0',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 2 }}>
                    <Text strong style={{ fontSize: 13 }}>
                      99.99% Uptime SLA
                    </Text>
                    <Tag color="green">Guaranteed</Tag>
                  </div>
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    Continuous high-availability infrastructure ensuring uninterrupted workspace operations.
                  </Text>
                </div>

                <div
                  style={{
                    background: '#f8fafc',
                    padding: '12px 16px',
                    borderRadius: 8,
                    border: '1px solid #e2e8f0',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 2 }}>
                    <Text strong style={{ fontSize: 13 }}>
                      Enterprise Data Protection
                    </Text>
                    <SafetyCertificateOutlined style={{ color: '#1677FF' }} />
                  </div>
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    End-to-end data encryption in transit and at rest with automated security controls.
                  </Text>
                </div>

                <div
                  style={{
                    background: '#f8fafc',
                    padding: '12px 16px',
                    borderRadius: 8,
                    border: '1px solid #e2e8f0',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 2 }}>
                    <Text strong style={{ fontSize: 13 }}>
                      Multi-Tenant Workspace Isolation
                    </Text>
                    <Tag color="blue">Dedicated</Tag>
                  </div>
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    Strict logical separation ensuring your team&apos;s assets and configs remain completely isolated.
                  </Text>
                </div>
              </Space>

              <div
                style={{
                  marginTop: 20,
                  paddingTop: 16,
                  borderTop: '1px solid #f1f5f9',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <Space>
                  <Avatar.Group size="small">
                    <Avatar style={{ background: '#1677FF' }}>KS</Avatar>
                    <Avatar style={{ background: '#52c41a' }}>JD</Avatar>
                    <Avatar style={{ background: '#722ed1' }}>+48</Avatar>
                  </Avatar.Group>
                  <div>
                    <Text strong style={{ fontSize: 11, display: 'block' }}>
                      Trusted by Enterprise Teams
                    </Text>
                    <Text type="secondary" style={{ fontSize: 10 }}>
                      No credit card required
                    </Text>
                  </div>
                </Space>
                <CheckCircleOutlined style={{ color: '#1677FF', fontSize: 18 }} />
              </div>
            </Card>
          </Col>
        </Row>
      </div>

      {/* Bottom Footer */}
      <div
        style={{
          maxWidth: 1200,
          width: '100%',
          margin: '24px auto 0',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderTop: '1px solid #e2e8f0',
          paddingTop: 16,
          flexWrap: 'wrap',
          gap: 12,
        }}
      >
        <Space size={16}>
          <Text type="secondary" style={{ fontSize: 12 }}>
            <SafetyCertificateOutlined style={{ color: '#1677FF', marginRight: 4 }} />
            SOC-2 Type II Certified
          </Text>
          <Text type="secondary" style={{ fontSize: 12 }}>
            <CheckCircleOutlined style={{ color: '#10b981', marginRight: 4 }} />
            ISO 27001 Compliant
          </Text>
        </Space>
        <Text type="secondary" style={{ fontSize: 12 }}>
          © {new Date().getFullYear()} MY-EPM Multi-Tenant Core
        </Text>
      </div>
    </div>
  );
}