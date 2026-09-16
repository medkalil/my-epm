import { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Button,
  Form,
  Input,
  Card,
  Typography,
  Space,
  Steps,
  Checkbox,
  Tag,
  App,
  Divider,
} from 'antd';
import {
  UserOutlined,
  LockOutlined,
  MailOutlined,
  CheckCircleFilled,
  RightOutlined,
  LeftOutlined,
  ApartmentOutlined,
  GlobalOutlined,
  ThunderboltOutlined,
} from '@ant-design/icons';
import { Link } from 'react-router-dom';
import {
  registerSchema,
  registerStep1Fields,
  type RegisterFormValues,
} from '../schemas/auth.schema';
import { useRegisterMutation } from '../api/auth.queries';
import { getApiErrorMessage } from '@/lib/axios';
import { ROUTES } from '@/routes/paths';

const { Title, Text } = Typography;

export function RegisterForm() {
  const { message } = App.useApp();
  const registerMutation = useRegisterMutation();
  const [current, setCurrent] = useState(0);

  const {
    control,
    handleSubmit,
    setValue,
    trigger,
    watch,
    formState: { errors },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      username: '',
      fullName: '',
      workEmail: '',
      password: '',
      confirmPassword: '',
      organizationName: '',
      organizationSlug: '',
    },
  });

  const password = watch('password') || '';
  const username = watch('username') || '';
  const organizationName = watch('organizationName') || '';

  const has8Chars = password.length >= 8;
  const hasUppercase = /[A-Z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSymbol = /[^A-Za-z0-9]/.test(password);
  const passwordStrengthScore =
    [has8Chars, hasUppercase, hasNumber, hasSymbol].filter(Boolean).length;

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setValue('organizationName', val);
    const generatedSlug = val
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
    setValue('organizationSlug', generatedSlug, { shouldValidate: true });
  };

  const handleNext = async () => {
    const valid = await trigger([...registerStep1Fields]);
    if (valid) setCurrent(1);
  };

  const onSubmit = async (values: RegisterFormValues) => {
    try {
      await registerMutation.mutateAsync({
        username: values.username,
        email: values.workEmail,
        fullName: values.fullName,
        password: values.password,
        organization: {
          name: values.organizationName,
          slug: values.organizationSlug,
        },
      });
      message.success('Account registered successfully! Welcome to MY-EPM.');
    } catch (error) {
      message.error(getApiErrorMessage(error));
    }
  };

  return (
    <Card
      style={{
        width: '100%',
        maxWidth: 560,
        borderRadius: 16,
        boxShadow: '0 10px 25px -5px rgba(15, 23, 42, 0.08)',
        border: '1px solid #e2e8f0',
      }}
      bodyStyle={{ padding: 32 }}
    >
      <div style={{ marginBottom: 20 }}>
        <Space style={{ justifyContent: 'space-between', width: '100%', marginBottom: 6 }}>
          <Tag color="blue" style={{ fontSize: 11 }}>
            ● Enterprise Workspace Setup
          </Tag>
          <Tag color="cyan">100% Free — No Credit Card Required</Tag>
        </Space>
        <Title level={3} style={{ margin: 0, color: '#0f172a', fontWeight: 700 }}>
          Get started with MY-EPM
        </Title>

        <Steps
          current={current}
          size="small"
          items={[
            { title: 'Account Details' },
            { title: 'Organization' },
          ]}
          style={{ marginTop: 16 }}
        />
      </div>

      <Form
        layout="vertical"
        onFinish={handleSubmit(onSubmit)}
        style={current === 0 ? undefined : { display: 'none' }}
      >
        {/* Full Name & Work Email in responsive row */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <Form.Item
            label={
              <span style={{ fontWeight: 600, fontSize: 12 }}>
                Full Name <span style={{ color: '#ef4444' }}>*</span>
              </span>
            }
            validateStatus={errors.fullName ? 'error' : ''}
            help={errors.fullName?.message}
            style={{ marginBottom: 12 }}
          >
            <Controller
              control={control}
              name="fullName"
              render={({ field }) => (
                <Input prefix={<UserOutlined style={{ color: '#94a3b8' }} />} placeholder="Elena Vance" {...field} />
              )}
            />
          </Form.Item>

          <Form.Item
            label={
              <span style={{ fontWeight: 600, fontSize: 12 }}>
                Work Email <span style={{ color: '#ef4444' }}>*</span>
              </span>
            }
            validateStatus={errors.workEmail ? 'error' : ''}
            help={errors.workEmail?.message}
            style={{ marginBottom: 12 }}
          >
            <Controller
              control={control}
              name="workEmail"
              render={({ field }) => (
                <Input prefix={<MailOutlined style={{ color: '#94a3b8' }} />} placeholder="e.vance@company.com" {...field} />
              )}
            />
          </Form.Item>
        </div>

        {/* Preferred Username */}
        <Form.Item
          label={
            <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
              <span style={{ fontWeight: 600, fontSize: 12 }}>
                Preferred Username <span style={{ color: '#ef4444' }}>*</span>
              </span>
              {username.length >= 3 && (
                <Tag color="success" icon={<CheckCircleFilled />}>
                  Available
                </Tag>
              )}
            </div>
          }
          validateStatus={errors.username ? 'error' : ''}
          help={errors.username?.message}
          style={{ marginBottom: 12 }}
        >
          <Controller
            control={control}
            name="username"
            render={({ field }) => (
              <Input
                prefix={<span style={{ color: '#94a3b8', marginRight: 4 }}>@</span>}
                placeholder="evance"
                autoComplete="username"
                {...field}
              />
            )}
          />
        </Form.Item>

        {/* Password */}
        <Form.Item
          label={
            <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
              <span style={{ fontWeight: 600, fontSize: 12 }}>
                Password <span style={{ color: '#ef4444' }}>*</span>
              </span>
              {password.length > 0 && (
                <Text
                  style={{
                    fontSize: 11,
                    color:
                      passwordStrengthScore <= 1
                        ? '#ef4444'
                        : passwordStrengthScore <= 3
                          ? '#f59e0b'
                          : '#16a34a',
                  }}
                >
                  Strength:{' '}
                  {passwordStrengthScore <= 1
                    ? 'Weak'
                    : passwordStrengthScore <= 3
                      ? 'Medium'
                      : 'Strong'}
                </Text>
              )}
            </div>
          }
          validateStatus={errors.password ? 'error' : ''}
          help={errors.password?.message}
          style={{ marginBottom: 8 }}
        >
          <Controller
            control={control}
            name="password"
            render={({ field }) => (
              <Input.Password
                prefix={<LockOutlined style={{ color: '#94a3b8' }} />}
                placeholder="••••••••••••"
                autoComplete="new-password"
                {...field}
              />
            )}
          />
        </Form.Item>

        {/* Password Strength Requirement Chips */}
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 12 }}>
          <Tag color={has8Chars ? 'success' : 'default'} style={{ fontSize: 11 }}>
            {has8Chars ? '✓' : '○'} 8+ chars
          </Tag>
          <Tag color={hasUppercase ? 'success' : 'default'} style={{ fontSize: 11 }}>
            {hasUppercase ? '✓' : '○'} Uppercase
          </Tag>
          <Tag color={hasNumber ? 'success' : 'default'} style={{ fontSize: 11 }}>
            {hasNumber ? '✓' : '○'} Number
          </Tag>
          <Tag color={hasSymbol ? 'success' : 'default'} style={{ fontSize: 11 }}>
            {hasSymbol ? '✓' : '○'} Symbol
          </Tag>
        </div>

        {/* Confirm Password */}
        <Form.Item
          label={
            <span style={{ fontWeight: 600, fontSize: 12 }}>
              Confirm Password <span style={{ color: '#ef4444' }}>*</span>
            </span>
          }
          validateStatus={errors.confirmPassword ? 'error' : ''}
          help={errors.confirmPassword?.message}
          style={{ marginBottom: 16 }}
        >
          <Controller
            control={control}
            name="confirmPassword"
            render={({ field }) => (
              <Input.Password
                prefix={<LockOutlined style={{ color: '#94a3b8' }} />}
                placeholder="Repeat password"
                autoComplete="new-password"
                {...field}
              />
            )}
          />
        </Form.Item>

        {/* Terms Agreement */}
        <Form.Item style={{ marginBottom: 20 }}>
          <Checkbox defaultChecked>
            <span style={{ fontSize: 12, color: '#475569' }}>
              I agree to the <a style={{ color: '#1677FF' }}>Master Services Agreement</a> and
              acknowledge the <a style={{ color: '#1677FF' }}>Privacy &amp; Data Security Policy</a>.
            </span>
          </Checkbox>
        </Form.Item>

        <Button
          type="primary"
          size="large"
          block
          icon={<RightOutlined />}
          iconPosition="end"
          onClick={handleNext}
          style={{ height: 44, fontWeight: 600, borderRadius: 8 }}
        >
          Continue — Set Up Organization
        </Button>
      </Form>

      <Form
        layout="vertical"
        onFinish={handleSubmit(onSubmit)}
        style={current === 1 ? undefined : { display: 'none' }}
      >
        <div style={{ marginBottom: 8 }}>
          <Space align="center" size={8}>
            <ApartmentOutlined style={{ color: '#1677FF', fontSize: 18 }} />
            <Text strong style={{ fontSize: 14 }}>
              Organization Workspace
            </Text>
          </Space>
          <Text type="secondary" style={{ display: 'block', marginTop: 2, fontSize: 12 }}>
            Your account is created together with an organization, and you will become its immutable
            <strong> OWNER</strong>.
          </Text>
        </div>

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
          validateStatus={errors.organizationName ? 'error' : ''}
          help={errors.organizationName?.message}
          style={{ marginBottom: 16 }}
        >
          <Controller
            control={control}
            name="organizationName"
            render={({ field }) => (
              <Input
                prefix={<ApartmentOutlined style={{ color: '#94a3b8' }} />}
                placeholder="e.g. Acme FinTech Corp"
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
                Workspace Slug <span style={{ color: '#ef4444' }}>*</span>
              </span>
              {organizationName.length >= 2 && (
                <Tag color="success" icon={<CheckCircleFilled />}>
                  Auto-generated
                </Tag>
              )}
            </div>
          }
          validateStatus={errors.organizationSlug ? 'error' : ''}
          help={errors.organizationSlug?.message || 'Routing slug used for your workspace URL (e.g. acme-fintech)'}
          style={{ marginBottom: 20 }}
        >
          <Controller
            control={control}
            name="organizationSlug"
            render={({ field }) => (
              <Input
                prefix={<GlobalOutlined style={{ color: '#94a3b8' }} />}
                addonBefore="my-epm.com/w/"
                placeholder="acme-fintech"
                {...field}
              />
            )}
          />
        </Form.Item>

        {/* Free Plan Full Access Banner */}
        <div
          style={{
            background: '#f0fdf4',
            border: '1px solid #bbf7d0',
            borderRadius: 12,
            padding: '12px 16px',
            marginBottom: 20,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <Space>
            <ThunderboltOutlined style={{ color: '#16a34a', fontSize: 16 }} />
            <Text strong style={{ color: '#14532d', fontSize: 13 }}>
              Free Plan (Full Access)
            </Text>
          </Space>
          <Tag color="green">ALL FEATURES UNLOCKED</Tag>
        </div>

        <Divider style={{ margin: '0 0 16px' }} />

        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <Button
            size="large"
            icon={<LeftOutlined />}
            disabled={registerMutation.isPending}
            style={{ height: 44, borderRadius: 8 }}
            onClick={() => setCurrent(0)}
          >
            Back
          </Button>
          <Button
            type="primary"
            htmlType="submit"
            size="large"
            block
            icon={<RightOutlined />}
            iconPosition="end"
            loading={registerMutation.isPending}
            style={{ height: 44, fontWeight: 600, borderRadius: 8 }}
          >
            Create Account &amp; Organization
          </Button>
        </div>
      </Form>

      <div style={{ textAlign: 'center', marginTop: 16, fontSize: 13 }}>
        <span style={{ color: '#64748b' }}>Already registered? </span>
        <Link to={ROUTES.login} style={{ color: '#1677FF', fontWeight: 600 }}>
          Sign In Instead →
        </Link>
      </div>
    </Card>
  );
}