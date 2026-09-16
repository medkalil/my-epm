import { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Form,
  Input,
  Select,
  Button,
  Space,
  Switch,
  Typography,
  Card,
  Tag,
  Row,
  Col,
  App,
} from 'antd';
import {
  CheckCircleFilled,
  RightOutlined,
  SearchOutlined,
  BankOutlined,
} from '@ant-design/icons';
import {
  createOrganizationSchema,
  type CreateOrganizationFormValues,
} from '../schemas/organization.schema';
import { useCreateOrganization } from '../api/organization.queries';
import { organizationService } from '@/services/organization.service';
import { getApiErrorMessage } from '@/lib/axios';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '@/routes/paths';
import { useOrgStore } from '@/stores/orgStore';
import type { Organization } from '../types/organization.types';

const { Title, Text, Paragraph } = Typography;

export function CreateOrganizationForm() {
  const { message } = App.useApp();
  const navigate = useNavigate();
  const createMutation = useCreateOrganization();
  const setActiveOrganization = useOrgStore((state) => state.setActiveOrganization);
  const addOrganization = useOrgStore((state) => state.addOrganization);

  // State for Join Mode vs Create Mode
  const [isJoinMode, setIsJoinMode] = useState(false);
  const [searchSlug, setSearchSlug] = useState('');
  const [searching, setSearching] = useState(false);
  const [foundOrg, setFoundOrg] = useState<Organization | null>(null);

  const {
    control,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<CreateOrganizationFormValues>({
    resolver: zodResolver(createOrganizationSchema),
    defaultValues: {
      name: '',
      slug: '',
      description: '',
    },
  });

  const slug = watch('slug') || '';

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setValue('name', val);
    const generatedSlug = val
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
    setValue('slug', generatedSlug, { shouldValidate: true });
  };

  const onSubmit = async (values: CreateOrganizationFormValues) => {
    try {
      const org = await createMutation.mutateAsync({
        name: values.name,
        slug: values.slug,
      });
      message.success(`Organization "${org.name}" provisioned successfully!`);
      navigate(ROUTES.dashboard, { replace: true });
    } catch (error) {
      message.error(getApiErrorMessage(error));
    }
  };

  const handleSearchSlug = async () => {
    if (!searchSlug.trim()) return;
    setSearching(true);
    setFoundOrg(null);
    try {
      const org = await organizationService.getBySlug(searchSlug.trim());
      setFoundOrg(org);
    } catch (error) {
      message.error(getApiErrorMessage(error));
    } finally {
      setSearching(false);
    }
  };

  const handleSelectFoundOrg = (org: Organization) => {
    addOrganization(org);
    setActiveOrganization(org);
    message.success(`Connected to ${org.name}`);
    navigate(ROUTES.dashboard, { replace: true });
  };

  if (isJoinMode) {
    return (
      <Card
        style={{
          borderRadius: 16,
          border: '1px solid #e2e8f0',
          boxShadow: '0 10px 25px -5px rgba(15, 23, 42, 0.05)',
        }}
        bodyStyle={{ padding: 32 }}
      >
        <div style={{ marginBottom: 24 }}>
          <Tag color="purple" style={{ marginBottom: 8 }}>
            JOIN WORKSPACE
          </Tag>
          <Title level={3} style={{ margin: 0, fontWeight: 700 }}>
            Connect to an Existing Organization
          </Title>
          <Text type="secondary">
            Enter your company&apos;s unique workspace slug to look up and request membership.
          </Text>
        </div>

        <Space direction="vertical" size={16} style={{ width: '100%' }}>
          <Input.Search
            placeholder="e.g. acme-fintech"
            enterButton={
              <Button type="primary" icon={<SearchOutlined />} loading={searching}>
                Lookup Slug
              </Button>
            }
            size="large"
            value={searchSlug}
            onChange={(e) => setSearchSlug(e.target.value)}
            onSearch={handleSearchSlug}
          />

          {foundOrg && (
            <Card style={{ background: '#f8fafc', border: '1px solid #bfdbfe', borderRadius: 12 }}>
              <Space direction="vertical" size={8} style={{ width: '100%' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Space>
                    <BankOutlined style={{ fontSize: 20, color: '#1677FF' }} />
                    <Text strong style={{ fontSize: 16 }}>
                      {foundOrg.name}
                    </Text>
                  </Space>
                  <Tag color="green">Active Workspace</Tag>
                </div>
                <Text type="secondary" style={{ fontSize: 12 }}>
                  Slug: <code>{foundOrg.slug}</code>
                </Text>
                <Button
                  type="primary"
                  block
                  icon={<RightOutlined />}
                  onClick={() => handleSelectFoundOrg(foundOrg)}
                  style={{ marginTop: 8 }}
                >
                  Enter Workspace
                </Button>
              </Space>
            </Card>
          )}

          <div style={{ textAlign: 'center', marginTop: 16 }}>
            <Button type="link" onClick={() => setIsJoinMode(false)}>
              ← Back to Create New Organization
            </Button>
          </div>
        </Space>
      </Card>
    );
  }

  return (
    <Card
      style={{
        borderRadius: 16,
        border: '1px solid #e2e8f0',
        boxShadow: '0 10px 25px -5px rgba(15, 23, 42, 0.05)',
      }}
      bodyStyle={{ padding: 32 }}
    >
      <div style={{ marginBottom: 24 }}>
        <Title level={3} style={{ margin: 0, fontWeight: 700, color: '#0f172a' }}>
          Set Up Your Organization (Tenant Boundary)
        </Title>
        <Paragraph type="secondary" style={{ fontSize: 13, marginTop: 4 }}>
          Organizations act as strict security and data boundaries in MY-EPM. Your user profile
          will automatically receive the immutable <strong>OWNER</strong> scope with root audit
          authority.
        </Paragraph>
      </div>

      <Form layout="vertical" onFinish={handleSubmit(onSubmit)}>
        {/* Organization Name */}
        <Form.Item
          label={
            <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
              <span style={{ fontWeight: 600, fontSize: 13 }}>
                Organization Name <span style={{ color: '#ef4444' }}>*</span>
              </span>
              <Text type="secondary" style={{ fontSize: 11 }}>
                Displayed across shared tenant portals
              </Text>
            </div>
          }
          validateStatus={errors.name ? 'error' : ''}
          help={errors.name?.message}
          style={{ marginBottom: 16 }}
        >
          <Controller
            control={control}
            name="name"
            render={({ field }) => (
              <Input
                placeholder="e.g. Acme FinTech Corp"
                size="large"
                {...field}
                onChange={handleNameChange}
              />
            )}
          />
        </Form.Item>

        {/* Workspace URL / Slug */}
        <Form.Item
          label={
            <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
              <span style={{ fontWeight: 600, fontSize: 13 }}>
                Organization Workspace URL <span style={{ color: '#ef4444' }}>*</span>
              </span>
              {slug.length >= 2 && (
                <Tag color="success" icon={<CheckCircleFilled />}>
                  Available
                </Tag>
              )}
            </div>
          }
          validateStatus={errors.slug ? 'error' : ''}
          help={errors.slug?.message || 'Used for your organization workspace routing URL (e.g. acme-fintech)'}
          style={{ marginBottom: 16 }}
        >
          <Controller
            control={control}
            name="slug"
            render={({ field }) => (
              <Input
                addonBefore="https://my-epm.com/workspace/"
                placeholder="acme-corp"
                size="large"
                {...field}
              />
            )}
          />
        </Form.Item>

        {/* Timezone & Ledger Currency */}
        <Row gutter={16}>
          <Col xs={24} sm={12}>
            <Form.Item label={<span style={{ fontWeight: 600, fontSize: 12 }}>Base Reporting Timezone</span>}>
              <Select
                size="large"
                defaultValue="UTC"
                options={[
                  { label: 'UTC (Coordinated Universal Time +00:00)', value: 'UTC' },
                  { label: 'EST (Eastern Standard Time -05:00)', value: 'EST' },
                  { label: 'PST (Pacific Standard Time -08:00)', value: 'PST' },
                  { label: 'CET (Central European Time +01:00)', value: 'CET' },
                ]}
              />
            </Form.Item>
          </Col>
          <Col xs={24} sm={12}>
            <Form.Item label={<span style={{ fontWeight: 600, fontSize: 12 }}>Primary Ledger Currency</span>}>
              <Select
                size="large"
                defaultValue="USD"
                options={[
                  { label: 'USD ($) United States Dollar', value: 'USD' },
                  { label: 'EUR (€) Euro', value: 'EUR' },
                  { label: 'GBP (£) British Pound', value: 'GBP' },
                ]}
              />
            </Form.Item>
          </Col>
        </Row>

        {/* Free Plan Full Access Banner */}
        <div
          style={{
            background: '#f0fdf4',
            border: '1px solid #bbf7d0',
            borderRadius: 12,
            padding: '16px 20px',
            marginBottom: 20,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <div>
            <Space>
              <CheckCircleFilled style={{ color: '#16a34a', fontSize: 18 }} />
              <Text strong style={{ color: '#14532d', fontSize: 14 }}>
                Free Plan (Full Access)
              </Text>
              <Tag color="green">ALL FEATURES UNLOCKED</Tag>
            </Space>
            <Text type="secondary" style={{ display: 'block', marginTop: 4, fontSize: 12, color: '#15803d' }}>
              MY-EPM is 100% free with all enterprise features included (unlimited projects, team
              members, and workflows).
            </Text>
          </div>
          <Tag color="blue" style={{ padding: '4px 12px', fontSize: 12 }}>
            Unlimited Seats
          </Tag>
        </div>

        {/* Quick Invite Team Members */}
        <Form.Item
          label={
            <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
              <span style={{ fontWeight: 600, fontSize: 12 }}>Quick Invite Team Members</span>
              <Text type="secondary" style={{ fontSize: 11 }}>
                Optional during onboarding
              </Text>
            </div>
          }
          help="Default Role: MEMBER. Invitations will be sent immediately upon setup."
          style={{ marginBottom: 16 }}
        >
          <Select
            mode="tags"
            size="large"
            placeholder="sarah.c@acme-core.internal, alex.k@acme-core.internal..."
            options={[]}
          />
        </Form.Item>

        {/* Multi-Tenant Cross-Access Coexistence Toggle */}
        <div
          style={{
            background: '#f8fafc',
            border: '1px solid #e2e8f0',
            borderRadius: 12,
            padding: '14px 18px',
            marginBottom: 24,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <div>
            <Text strong style={{ fontSize: 13, display: 'block' }}>
              Multi-Tenant Cross-Access Coexistence
            </Text>
            <Text type="secondary" style={{ fontSize: 12 }}>
              Permit invited team members to seamlessly switch between multiple organization
              accounts with single sign-on.
            </Text>
          </div>
          <Switch defaultChecked />
        </div>

        <Button
          type="primary"
          htmlType="submit"
          size="large"
          block
          icon={<RightOutlined />}
          iconPosition="end"
          loading={createMutation.isPending}
          style={{ height: 48, fontWeight: 600, borderRadius: 8, fontSize: 15 }}
        >
          Continue to Projects &amp; Workspaces
        </Button>

        <div style={{ textAlign: 'center', marginTop: 16 }}>
          <Button type="link" onClick={() => setIsJoinMode(true)} style={{ fontSize: 12 }}>
            Looking to join an existing organization instead? Enter organization slug →
          </Button>
        </div>
      </Form>
    </Card>
  );
}