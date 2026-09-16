import {
  Button,
  Layout,
  Space,
  Typography,
  Row,
  Col,
  Card,
  Tag,
  Progress,
  Badge,
} from 'antd';
import {
  RocketOutlined,
  TeamOutlined,
  SafetyCertificateOutlined,
  ProjectOutlined,
  CheckCircleOutlined,
  ApartmentOutlined,
  DashboardOutlined,
  RightOutlined,
  ArrowUpOutlined,
  ThunderboltOutlined,
  CheckSquareOutlined,
} from '@ant-design/icons';
import { Link, Navigate } from 'react-router-dom';
import { ROUTES } from '@/routes/paths';
import { useAuthStore } from '@/stores';

const { Header, Content, Footer } = Layout;
const { Title, Text, Paragraph } = Typography;

const FEATURES = [
  {
    icon: <ApartmentOutlined style={{ fontSize: 24, color: '#1677FF' }} />,
    title: 'Multi-Workspace & Tenant Switching',
    subtitle: 'Unified Multi-Tenant Isolation',
    description:
      'Seamlessly switch between regional organizations, subsidiary workspaces, and dedicated business units with unified authentication and partitioned project data.',
    badge: 'Instant Organization Context Switching',
  },
  {
    icon: <SafetyCertificateOutlined style={{ fontSize: 24, color: '#1677FF' }} />,
    title: 'Role-Based Access & Governance',
    subtitle: 'Granular Permissions Matrix',
    description:
      'Granular enterprise permissions for Owners, Admins, Project Leads, and Guests. Protect sensitive project roadmaps and budget financials with audit-grade access controls.',
    badge: 'Deterministic Multi-Tier RBAC Policies',
  },
  {
    icon: <ProjectOutlined style={{ fontSize: 24, color: '#1677FF' }} />,
    title: 'Automated Milestone & Sprint Lifecycles',
    subtitle: 'Continuous Delivery Tracking',
    description:
      'Accelerate portfolio delivery with automated sprint workflows, cross-project dependencies, milestone sign-offs, and continuous delivery tracking.',
    badge: 'End-to-End Milestone Orchestration',
  },
  {
    icon: <DashboardOutlined style={{ fontSize: 24, color: '#1677FF' }} />,
    title: 'Executive Insights & Portfolio Telemetry',
    subtitle: 'Real-Time Utilization Forecast',
    description:
      'Real-time executive dashboards, resource utilization forecasting, sprint burndown metrics, and automated compliance audit reporting.',
    badge: 'Real-Time Execution Analytics',
  },
];

const METRICS = [
  {
    value: '99.99%',
    label: 'Multi-Tenant Availability SLA',
    description: 'Guaranteed high availability and isolated enterprise workspaces.',
    icon: <CheckCircleOutlined style={{ color: '#1677FF', fontSize: 24 }} />,
  },
  {
    value: '24ms',
    label: 'Real-Time Dashboard Latency',
    description: 'Sub-second portfolio queries and instant Gantt & Kanban updates.',
    icon: <ThunderboltOutlined style={{ color: '#1677FF', fontSize: 24 }} />,
  },
  {
    value: '500+',
    label: 'Enterprise Organizations',
    description: 'Managing strategic business portfolios and cross-functional teams.',
    icon: <TeamOutlined style={{ color: '#1677FF', fontSize: 24 }} />,
  },
  {
    value: '10M+',
    label: 'Tasks & Milestones Delivered',
    description: 'Orchestrated reliably across global enterprise deployments.',
    icon: <CheckSquareOutlined style={{ color: '#1677FF', fontSize: 24 }} />,
  },
];

const TESTIMONIALS = [
  {
    stars: 5,
    quote:
      'MY-EPM transformed how our global organization tracks multi-region initiatives. Having unified workspaces with strict governance eliminated cross-team confusion and saved our leadership hours in weekly reviews.',
    author: 'Kalil S.',
    role: 'VP of Product at Aaron FinTech',
    avatarBg: '#1677FF',
  },
  {
    stars: 5,
    quote:
      'The workspace switching and instant portfolio visibility allow our executive committee to monitor 40+ strategic projects in real time with total confidence.',
    author: 'Elena Rostova',
    role: 'Chief Operating Officer at CloudScale',
    avatarBg: '#52c41a',
  },
  {
    stars: 5,
    quote:
      'The cleanest task orchestration and cross-functional kanban pipelines we have used. Our team project delivery velocity increased by 38% in the first quarter.',
    author: 'Marcus Vance',
    role: 'Head of Delivery at NovaPay',
    avatarBg: '#722ed1',
  },
];

export default function HomePage() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  if (isAuthenticated) {
    return <Navigate to={ROUTES.dashboard} replace />;
  }

  return (
    <Layout style={{ minHeight: '100vh', background: '#f8fafc' }}>
      {/* Top Header */}
      <Header
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 1000,
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(8px)',
          borderBottom: '1px solid #e2e8f0',
          padding: '0 32px',
          height: 64,
        }}
      >
        <Space size={12} align="center">
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
              fontWeight: 'bold',
            }}
          >
            <ApartmentOutlined style={{ fontSize: 18 }} />
          </div>
          <div>
            <Text strong style={{ fontSize: 16, letterSpacing: -0.5, color: '#0f172a' }}>
              MY-EPM
            </Text>
          </div>
        </Space>

        <Space size={24} className="hidden md:flex">
          <a href="#features" style={{ color: '#475569', fontWeight: 500 }}>
            Features
          </a>
          <a href="#architecture" style={{ color: '#475569', fontWeight: 500 }}>
            Architecture
          </a>
          <a href="#testimonials" style={{ color: '#475569', fontWeight: 500 }}>
            Testimonials
          </a>
        </Space>

        <Space size={12}>
          <Link to={ROUTES.login}>
            <Button type="text" style={{ fontWeight: 500 }}>
              Sign In
            </Button>
          </Link>
          <Link to={ROUTES.register}>
            <Button type="primary" icon={<RocketOutlined />}>
              Get Started Free
            </Button>
          </Link>
        </Space>
      </Header>

      <Content style={{ padding: '0 24px' }}>
        {/* Hero Section */}
        <div style={{ maxWidth: 1200, margin: '60px auto 40px', textAlign: 'center' }}>
          <Tag
            color="processing"
            style={{
              padding: '6px 16px',
              borderRadius: 20,
              fontSize: 12,
              fontWeight: 600,
              letterSpacing: 0.5,
              textTransform: 'uppercase',
              marginBottom: 20,
              border: '1px solid #bfdbfe',
            }}
          >
            ✦ Enterprise Portfolio Governance & Multi-Tenant Workspaces
          </Tag>

          <Title
            style={{
              fontSize: 'clamp(32px, 5vw, 56px)',
              fontWeight: 800,
              lineHeight: 1.15,
              color: '#0f172a',
              marginBottom: 20,
              letterSpacing: -1,
            }}
          >
            Enterprise Project Portfolio Management Built for <br />
            <span style={{ color: '#1677FF' }}>Strategic Delivery</span>
          </Title>

          <Paragraph
            style={{
              fontSize: 18,
              color: '#64748b',
              maxWidth: 780,
              margin: '0 auto 32px',
              lineHeight: 1.6,
            }}
          >
            Align cross-functional teams, orchestrate high-impact initiatives, and streamline
            project workflows with enterprise-grade security and automated workspace isolation.
          </Paragraph>

          <Space size={16} wrap style={{ marginBottom: 48 }}>
            <Link to={ROUTES.register}>
              <Button
                type="primary"
                size="large"
                style={{
                  height: 48,
                  padding: '0 28px',
                  fontSize: 15,
                  fontWeight: 600,
                  borderRadius: 8,
                }}
              >
                Get Started Free <RightOutlined />
              </Button>
            </Link>
          </Space>

          {/* Simulated App Cockpit Mockup */}
          <Card
            style={{
              borderRadius: 16,
              boxShadow: '0 25px 50px -12px rgba(15, 23, 42, 0.15)',
              border: '1px solid #cbd5e1',
              background: '#ffffff',
              textAlign: 'left',
              overflow: 'hidden',
              marginBottom: 80,
            }}
            bodyStyle={{ padding: 24 }}
          >
            {/* Window Topbar */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                borderBottom: '1px solid #f1f5f9',
                paddingBottom: 16,
                marginBottom: 20,
              }}
            >
              <Space>
                <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#ef4444' }} />
                <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#f59e0b' }} />
                <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#10b981' }} />
                <Text strong style={{ marginLeft: 8, fontSize: 12, color: '#334155' }}>
                  Active Workspace: <span style={{ color: '#1677FF' }}>Acme Global Portfolio</span>
                </Text>
              </Space>
            </div>

            {/* KPI Cards inside Mockup */}
            <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
              <Col xs={24} sm={12} lg={6}>
                <Card size="small" style={{ background: '#f8fafc', border: '1px solid #e2e8f0' }}>
                  <Text type="secondary" style={{ fontSize: 11 }}>
                    Portfolio Health
                  </Text>
                  <Title level={4} style={{ margin: '4px 0 0', color: '#0f172a' }}>
                    94% On Track
                  </Title>
                  <Text style={{ fontSize: 11, color: '#16a34a' }}>
                    <ArrowUpOutlined /> +0.2% vs last quarter
                  </Text>
                </Card>
              </Col>
              <Col xs={24} sm={12} lg={6}>
                <Card size="small" style={{ background: '#f8fafc', border: '1px solid #e2e8f0' }}>
                  <Text type="secondary" style={{ fontSize: 11 }}>
                    Active Initiatives
                  </Text>
                  <Title level={4} style={{ margin: '4px 0 0', color: '#0f172a' }}>
                    38 Projects
                  </Title>
                  <Text type="secondary" style={{ fontSize: 11 }}>
                    Across 6 Divisions
                  </Text>
                </Card>
              </Col>
              <Col xs={24} sm={12} lg={6}>
                <Card size="small" style={{ background: '#f8fafc', border: '1px solid #e2e8f0' }}>
                  <Text type="secondary" style={{ fontSize: 11 }}>
                    Milestone Velocity
                  </Text>
                  <Title level={4} style={{ margin: '4px 0 0', color: '#0f172a' }}>
                    92% Delivered
                  </Title>
                  <Text style={{ fontSize: 11, color: '#1677FF' }}>On-time delivery</Text>
                </Card>
              </Col>
              <Col xs={24} sm={12} lg={6}>
                <Card size="small" style={{ background: '#f8fafc', border: '1px solid #e2e8f0' }}>
                  <Text type="secondary" style={{ fontSize: 11 }}>
                    Resource Allocation
                  </Text>
                  <Title level={4} style={{ margin: '4px 0 0', color: '#0f172a' }}>
                    88% Utilized
                  </Title>
                  <Text type="secondary" style={{ fontSize: 11 }}>
                    Balanced workloads
                  </Text>
                </Card>
              </Col>
            </Row>

            {/* Kanban Preview Lanes */}
            <Row gutter={[16, 16]}>
              <Col xs={24} md={8}>
                <Card size="small" title="Execution (3)" style={{ background: '#f1f5f9' }}>
                  <Card size="small" style={{ marginBottom: 8 }}>
                    <Tag color="blue">PRJ-104</Tag>
                    <Text strong style={{ fontSize: 12, display: 'block', margin: '4px 0' }}>
                      Global Payment Gateway Expansion
                    </Text>
                    <Progress percent={70} size="small" status="active" />
                  </Card>
                  <Card size="small">
                    <Tag color="cyan">PRJ-108</Tag>
                    <Text strong style={{ fontSize: 12, display: 'block', margin: '4px 0' }}>
                      Client Onboarding Workflow Automation
                    </Text>
                    <Progress percent={45} size="small" />
                  </Card>
                </Card>
              </Col>
              <Col xs={24} md={8}>
                <Card size="small" title="Review / Approval (2)" style={{ background: '#f1f5f9' }}>
                  <Card size="small" style={{ marginBottom: 8 }}>
                    <Tag color="purple">GOV-22</Tag>
                    <Text strong style={{ fontSize: 12, display: 'block', margin: '4px 0' }}>
                      Cross-Division Budget Allocation Review
                    </Text>
                    <Text type="secondary" style={{ fontSize: 11 }}>
                      Target: Leadership 100% Approved
                    </Text>
                  </Card>
                </Card>
              </Col>
              <Col xs={24} md={8}>
                <Card size="small" title="Completed (8)" style={{ background: '#f1f5f9' }}>
                  <Card size="small">
                    <Tag color="green">DEL-04</Tag>
                    <Text strong style={{ fontSize: 12, display: 'block', margin: '4px 0' }}>
                      Q3 Financial Settlement Engine Go-Live
                    </Text>
                    <Text style={{ fontSize: 11, color: '#16a34a' }}>
                      <CheckCircleOutlined /> Delivered · Global Ops
                    </Text>
                  </Card>
                </Card>
              </Col>
            </Row>
          </Card>
        </div>

        {/* Features Section */}
        <div id="features" style={{ maxWidth: 1200, margin: '0 auto 80px' }}>
          <div style={{ textAlign: 'center', marginBottom: 48 }}>
            <Tag color="blue" style={{ marginBottom: 12 }}>
              ENTERPRISE PORTFOLIO PLATFORM
            </Tag>
            <Title level={2} style={{ color: '#0f172a', margin: 0, fontWeight: 700 }}>
              Engineered for Modern SaaS Teams & High-Velocity Execution
            </Title>
            <Paragraph type="secondary" style={{ fontSize: 16, marginTop: 8 }}>
              MY-EPM merges multi-workspace project orchestration with enterprise governance,
              flexible Kanban workflows, and execution analytics.
            </Paragraph>
          </div>

          <Row gutter={[24, 24]}>
            {FEATURES.map((item) => (
              <Col xs={24} sm={12} key={item.title}>
                <Card
                  hoverable
                  style={{
                    height: '100%',
                    borderRadius: 12,
                    border: '1px solid #e2e8f0',
                  }}
                  bodyStyle={{ padding: 28 }}
                >
                  <Space direction="vertical" size="small" style={{ width: '100%' }}>
                    <div
                      style={{
                        width: 48,
                        height: 48,
                        borderRadius: 10,
                        background: '#eff6ff',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginBottom: 12,
                      }}
                    >
                      {item.icon}
                    </div>
                    <Title level={4} style={{ margin: 0, color: '#0f172a' }}>
                      {item.title}
                    </Title>
                    <Text type="secondary" strong style={{ fontSize: 12, color: '#1677FF' }}>
                      {item.subtitle}
                    </Text>
                    <Paragraph style={{ color: '#64748b', fontSize: 14, margin: '8px 0 16px' }}>
                      {item.description}
                    </Paragraph>
                    <Tag color="blue" style={{ borderRadius: 6, fontSize: 11, padding: '2px 8px' }}>
                      {item.badge}
                    </Tag>
                  </Space>
                </Card>
              </Col>
            ))}
          </Row>
        </div>

        {/* Telemetry / Scale Strip */}
        <div
          id="architecture"
          style={{
            background: '#ffffff',
            borderRadius: 16,
            border: '1px solid #e2e8f0',
            maxWidth: 1200,
            margin: '0 auto 80px',
            padding: '40px 32px',
          }}
        >
          <div style={{ textAlign: 'center', marginBottom: 32 }}>
            <Tag color="cyan">PERFORMANCE TELEMETRY</Tag>
            <Title level={3} style={{ margin: '8px 0 0' }}>
              Tested at Enterprise Scale, Built for Mission-Critical Delivery
            </Title>
          </div>
          <Row gutter={[32, 24]}>
            {METRICS.map((metric) => (
              <Col xs={24} sm={12} lg={6} key={metric.label}>
                <div style={{ textAlign: 'left', padding: '12px 16px' }}>
                  {metric.icon}
                  <Title level={2} style={{ color: '#0f172a', margin: '12px 0 4px', fontWeight: 800 }}>
                    {metric.value}
                  </Title>
                  <Text strong style={{ fontSize: 14, color: '#334155', display: 'block' }}>
                    {metric.label}
                  </Text>
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    {metric.description}
                  </Text>
                </div>
              </Col>
            ))}
          </Row>
        </div>

        {/* Testimonials */}
        <div id="testimonials" style={{ maxWidth: 1200, margin: '0 auto 80px' }}>
          <div style={{ textAlign: 'center', marginBottom: 40 }}>
            <Tag color="purple">CUSTOMER VALIDATIONS</Tag>
            <Title level={2} style={{ margin: '8px 0 0', fontWeight: 700 }}>
              Verified by Leading Engineering Teams
            </Title>
          </div>
          <Row gutter={[24, 24]}>
            {TESTIMONIALS.map((t) => (
              <Col xs={24} md={8} key={t.author}>
                <Card
                  style={{
                    height: '100%',
                    borderRadius: 12,
                    border: '1px solid #e2e8f0',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                  }}
                  bodyStyle={{ padding: 24 }}
                >
                  <div style={{ marginBottom: 20 }}>
                    <div style={{ color: '#f59e0b', marginBottom: 12 }}>★★★★★</div>
                    <Text style={{ fontSize: 14, color: '#334155', lineHeight: 1.6, fontStyle: 'italic' }}>
                      &ldquo;{t.quote}&rdquo;
                    </Text>
                  </div>
                  <Space align="center">
                    <div
                      style={{
                        width: 36,
                        height: 36,
                        borderRadius: '50%',
                        background: t.avatarBg,
                        color: '#fff',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 'bold',
                        fontSize: 13,
                      }}
                    >
                      {t.author.charAt(0)}
                    </div>
                    <div>
                      <Text strong style={{ fontSize: 13, display: 'block' }}>
                        {t.author}
                      </Text>
                      <Text type="secondary" style={{ fontSize: 11 }}>
                        {t.role}
                      </Text>
                    </div>
                  </Space>
                </Card>
              </Col>
            ))}
          </Row>
        </div>

        {/* CTA Conversion Banner */}
        <div
          style={{
            maxWidth: 1200,
            margin: '0 auto 80px',
            background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
            borderRadius: 20,
            padding: '60px 32px',
            textAlign: 'center',
            color: '#ffffff',
          }}
        >
          <Tag color="blue" style={{ marginBottom: 16 }}>
            ZERO-FRICTION DEPLOYMENT
          </Tag>
          <Title level={2} style={{ color: '#ffffff', margin: 0, fontWeight: 800 }}>
            Ready to accelerate your enterprise project delivery?
          </Title>
          <Paragraph style={{ color: '#94a3b8', fontSize: 16, maxWidth: 640, margin: '16px auto 32px' }}>
            Experience modern multi-tenant portfolio management, automated milestone workflows, and
            execution reporting today.
          </Paragraph>
          <Space size={16} wrap>
            <Link to={ROUTES.register}>
              <Button type="primary" size="large" style={{ height: 48, padding: '0 32px', fontWeight: 600 }}>
                Get Started Free
              </Button>
            </Link>
            <Link to={ROUTES.login}>
              <Button ghost size="large" style={{ height: 48, padding: '0 32px' }}>
                Schedule Enterprise Demo
              </Button>
            </Link>
          </Space>
          <div style={{ marginTop: 24 }}>
            <Space size={24} style={{ color: '#94a3b8', fontSize: 12 }}>
              <span>✓ 100% Free </span>
              <span>✓ No Credit Card Required</span>
              <span>✓ Instant API Access</span>
            </Space>
          </div>
        </div>
      </Content>

      {/* Footer */}
      <Footer
        style={{
          background: '#ffffff',
          borderTop: '1px solid #e2e8f0',
          padding: '40px 32px 24px',
        }}
      >
        <div
          style={{
            maxWidth: 1200,
            margin: '0 auto',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: 16,
          }}
        >
          <Space size={12}>
            <div
              style={{
                width: 24,
                height: 24,
                borderRadius: 6,
                background: '#1677FF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff',
                fontSize: 12,
              }}
            >
              <ApartmentOutlined />
            </div>
            <Text strong style={{ fontSize: 14 }}>
              MY-EPM
            </Text>
          </Space>

          <Space size={20}>
            <Badge status="success" text="All Systems Operational" />
            <Text type="secondary" style={{ fontSize: 12 }}>
              © {new Date().getFullYear()} MY-EPM Inc. All rights reserved.
            </Text>
          </Space>
        </div>
      </Footer>
    </Layout>
  );
}