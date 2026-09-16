import { Card, Steps, Typography, Tag, Space, Row, Col } from 'antd';
import {
  SafetyCertificateOutlined,
  CheckCircleOutlined,
  ApartmentOutlined,
  ProjectOutlined,
  TeamOutlined,
  RocketOutlined,
  CustomerServiceOutlined,
} from '@ant-design/icons';
import { CreateOrganizationForm } from '../components/CreateOrganizationForm';

const { Title, Text, Paragraph } = Typography;

export default function OrgCreatePage() {
  const steps = [
    {
      title: 'STEP 1 · ACTIVE',
      description: 'Organization & Workspace',
      icon: <ApartmentOutlined />,
    },
    {
      title: 'STEP 2',
      description: 'Projects & Workspaces',
      icon: <ProjectOutlined />,
    },
    {
      title: 'STEP 3',
      description: 'Invite Team & Roles',
      icon: <TeamOutlined />,
    },
    {
      title: 'STEP 4',
      description: 'Complete & Launch',
      icon: <RocketOutlined />,
    },
  ];

  return (
    <div style={{ maxWidth: 1200, margin: '24px auto 60px', padding: '0 24px' }}>
      {/* Context Badge */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 16,
        }}
      >
        <div>
          <Tag color="blue" style={{ fontSize: 11, fontWeight: 700 }}>
            TENANT-PROVISIONING-STAGE
          </Tag>
          <Title level={3} style={{ margin: '4px 0 0', fontWeight: 700 }}>
            Organization Boundary Provisioning
          </Title>
        </div>
        <Tag color="processing">● Ready for setup</Tag>
      </div>

      {/* Stepper Wizard Bar */}
      <Card
        style={{
          borderRadius: 12,
          border: '1px solid #e2e8f0',
          marginBottom: 28,
          background: '#ffffff',
        }}
        bodyStyle={{ padding: '16px 24px' }}
      >
        <Steps current={0} items={steps} />
      </Card>

      {/* Two Column Layout: Form + Summary Panel */}
      <Row gutter={[28, 28]}>
        {/* Left / Main Form */}
        <Col xs={24} lg={16}>
          <CreateOrganizationForm />
        </Col>

        {/* Right / Setup Summary Panel */}
        <Col xs={24} lg={8}>
          <Space direction="vertical" size={20} style={{ width: '100%' }}>
            {/* Setup Summary Card */}
            <Card
              title={
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Text strong style={{ fontSize: 13 }}>
                    Organization Setup Summary
                  </Text>
                  <Tag color="green">ACTIVE</Tag>
                </div>
              }
              style={{ borderRadius: 16, border: '1px solid #e2e8f0' }}
              bodyStyle={{ padding: 20 }}
            >
              <Space direction="vertical" size={14} style={{ width: '100%' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    Selected Plan
                  </Text>
                  <Text strong style={{ fontSize: 12 }}>
                    Free (Full Access) ✓
                  </Text>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    Security
                  </Text>
                  <Text strong style={{ fontSize: 12 }}>
                    Multi-Tenant Data Isolation 🛡
                  </Text>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    Seats &amp; Collaborators
                  </Text>
                  <Text strong style={{ fontSize: 12 }}>
                    Unlimited
                  </Text>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    Compliance
                  </Text>
                  <Text strong style={{ fontSize: 12 }}>
                    SOC-2 Type II Certified
                  </Text>
                </div>

                <div
                  style={{
                    background: '#eff6ff',
                    padding: '10px 12px',
                    borderRadius: 8,
                    marginTop: 8,
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Text strong style={{ fontSize: 11, color: '#1e40af' }}>
                      Configuration Readiness
                    </Text>
                    <Text strong style={{ fontSize: 11, color: '#1677FF' }}>
                      100% Ready
                    </Text>
                  </div>
                  <Text type="secondary" style={{ fontSize: 10, color: '#3b82f6', display: 'block', marginTop: 2 }}>
                    All security and data isolation boundaries verified.
                  </Text>
                </div>
              </Space>
            </Card>

            {/* Security Guarantee Checklist Card */}
            <Card
              title={
                <Space>
                  <SafetyCertificateOutlined style={{ color: '#1677FF' }} />
                  <Text strong style={{ fontSize: 13 }}>
                    Security Guarantee
                  </Text>
                </Space>
              }
              style={{ borderRadius: 16, border: '1px solid #e2e8f0' }}
              bodyStyle={{ padding: 20 }}
            >
              <Space direction="vertical" size={10} style={{ width: '100%' }}>
                <Text style={{ fontSize: 12, color: '#334155' }}>
                  <CheckCircleOutlined style={{ color: '#10b981', marginRight: 6 }} />
                  Strict Organization Boundary
                </Text>
                <Text style={{ fontSize: 12, color: '#334155' }}>
                  <CheckCircleOutlined style={{ color: '#10b981', marginRight: 6 }} />
                  Role-Based Access Controls (RBAC)
                </Text>
                <Text style={{ fontSize: 12, color: '#334155' }}>
                  <CheckCircleOutlined style={{ color: '#10b981', marginRight: 6 }} />
                  Automated Daily Backups
                </Text>
                <Paragraph type="secondary" style={{ fontSize: 11, marginTop: 8, marginBottom: 0 }}>
                  Enterprise boundary policies prevent unauthorized external access and isolate all
                  tenant organization records.
                </Paragraph>
              </Space>
            </Card>

            {/* Help Card */}
            <Card
              style={{
                borderRadius: 16,
                border: '1px solid #e2e8f0',
                background: '#f8fafc',
              }}
              bodyStyle={{ padding: 18 }}
            >
              <Space align="start">
                <CustomerServiceOutlined style={{ color: '#1677FF', fontSize: 20 }} />
                <div>
                  <Text strong style={{ fontSize: 12, display: 'block' }}>
                    Need Onboarding Assistance?
                  </Text>
                  <Text type="secondary" style={{ fontSize: 11 }}>
                    Our enterprise specialists are available 24/7 to guide your setup.
                  </Text>
                </div>
              </Space>
            </Card>
          </Space>
        </Col>
      </Row>
    </div>
  );
}