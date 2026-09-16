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
  Segmented,
  Checkbox,
  Tag,
  Alert,
  App,
} from 'antd';
import {
  UserOutlined,
  LockOutlined,
  MailOutlined,
  CheckCircleFilled,
  RightOutlined,
  ApartmentOutlined,
  TeamOutlined,
} from '@ant-design/icons';
import { Link, useNavigate } from 'react-router-dom';
import { registerSchema, type RegisterFormValues } from '../schemas/auth.schema';
import { useRegisterMutation } from '../api/auth.queries';
import { getApiErrorMessage } from '@/lib/axios';
import { ROUTES } from '@/routes/paths';

const { Title, Text } = Typography;

export function RegisterForm() {
  const { message } = App.useApp();
  const navigate = useNavigate();
  const registerMutation = useRegisterMutation();
  const [onboardingMode, setOnboardingMode] = useState<string>('create');

  const {
    control,
    handleSubmit,
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
    },
  });

  const password = watch('password') || '';
  const username = watch('username') || '';

  const has8Chars = password.length >= 8;
  const hasUppercase = /[A-Z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSymbol = /[^A-Za-z0-9]/.test(password);
  const passwordStrengthScore =
    [has8Chars, hasUppercase, hasNumber, hasSymbol].filter(Boolean).length;

  const onSubmit = async (values: RegisterFormValues) => {
    try {
      await registerMutation.mutateAsync({
        username: values.username,
        password: values.password,
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
        maxWidth: 520,
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
        <Text type="secondary" style={{ fontSize: 13 }}>
          Create a new organization to start the guided setup, or join your company&apos;s existing
          workspace.
        </Text>
      </div>

      {/* Mode Selector */}
      <Segmented
        block
        value={onboardingMode}
        onChange={(val) => {
          setOnboardingMode(val as string);
          if (val === 'join') {
            navigate(`${ROUTES.organizations.create}?mode=join`);
          }
        }}
        options={[
          {
            label: 'Create New Organization',
            value: 'create',
            icon: <ApartmentOutlined />,
          },
          {
            label: 'Join Existing via Slug',
            value: 'join',
            icon: <TeamOutlined />,
          },
        ]}
        style={{ marginBottom: 20, padding: 4 }}
      />

      <Alert
        message={
          <span style={{ fontSize: 12, color: '#1e40af' }}>
            <strong>Guided 3-Step Setup Wizard:</strong> Takes less than 2 minutes: define
            workspace, invite your team, and select project templates.
          </span>
        }
        type="info"
        showIcon
        style={{ marginBottom: 20, borderRadius: 8, background: '#eff6ff', border: '1px solid #bfdbfe' }}
      />

      <Form layout="vertical" onFinish={handleSubmit(onSubmit)}>
        {/* Full Name & Work Email in responsive row */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <Form.Item label={<span style={{ fontWeight: 600, fontSize: 12 }}>Full Name</span>} style={{ marginBottom: 12 }}>
            <Controller
              control={control}
              name="fullName"
              render={({ field }) => (
                <Input prefix={<UserOutlined style={{ color: '#94a3b8' }} />} placeholder="Elena Vance" {...field} />
              )}
            />
          </Form.Item>

          <Form.Item label={<span style={{ fontWeight: 600, fontSize: 12 }}>Work Email</span>} style={{ marginBottom: 12 }}>
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
          htmlType="submit"
          size="large"
          block
          icon={<RightOutlined />}
          iconPosition="end"
          loading={registerMutation.isPending}
          style={{ height: 44, fontWeight: 600, borderRadius: 8 }}
        >
          Start Free Organization Setup (Step 1 of 3)
        </Button>
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