import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { Button, Form, Input, Card, Typography, Tag, App } from 'antd';
import { LockOutlined, RightOutlined, CheckCircleFilled, WarningOutlined } from '@ant-design/icons';
import {
  resetPasswordSchema,
  type ResetPasswordFormValues,
} from '../schemas/auth.schema';
import { useResetPasswordMutation } from '../api/auth.queries';
import { getApiErrorMessage } from '@/lib/axios';
import { ROUTES } from '@/routes/paths';

const { Title, Text } = Typography;

export function ResetPasswordForm() {
  const { message } = App.useApp();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') ?? '';
  const resetPasswordMutation = useResetPasswordMutation();

  const {
    control,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { newPassword: '', confirmPassword: '' },
  });

  const password = watch('newPassword') || '';
  const has8Chars = password.length >= 8;
  const hasUppercase = /[A-Z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSymbol = /[^A-Za-z0-9]/.test(password);
  const passwordStrengthScore =
    [has8Chars, hasUppercase, hasNumber, hasSymbol].filter(Boolean).length;

  const onSubmit = async (values: ResetPasswordFormValues) => {
    try {
      await resetPasswordMutation.mutateAsync({
        token,
        newPassword: values.newPassword,
      });
      message.success('Password reset successfully. Please sign in with your new password.');
      navigate(ROUTES.login, { replace: true });
    } catch (error) {
      message.error(getApiErrorMessage(error));
    }
  };

  if (!token) {
    return (
      <Card
        style={{
          width: '100%',
          maxWidth: 480,
          borderRadius: 16,
          boxShadow: '0 10px 25px -5px rgba(15, 23, 42, 0.08)',
          border: '1px solid #e2e8f0',
          textAlign: 'center',
        }}
        bodyStyle={{ padding: 32 }}
      >
        <WarningOutlined style={{ fontSize: 48, color: '#d97706', marginBottom: 16 }} />
        <Title level={3} style={{ margin: '0 0 8px', color: '#0f172a', fontWeight: 700 }}>
          Invalid reset link
        </Title>
        <Text type="secondary" style={{ fontSize: 13, display: 'block', marginBottom: 20 }}>
          This link is missing its reset token. Request a new link to reset your password.
        </Text>
        <Button
          type="primary"
          size="large"
          block
          onClick={() => navigate(ROUTES.forgotPassword)}
          style={{ height: 44, fontWeight: 600, borderRadius: 8 }}
        >
          Request New Link
        </Button>
      </Card>
    );
  }

  return (
    <Card
      style={{
        width: '100%',
        maxWidth: 480,
        borderRadius: 16,
        boxShadow: '0 10px 25px -5px rgba(15, 23, 42, 0.08)',
        border: '1px solid #e2e8f0',
      }}
      bodyStyle={{ padding: 32 }}
    >
      <div style={{ marginBottom: 20 }}>
        <Tag color="blue" style={{ marginBottom: 8, fontSize: 11 }}>
          ● Set New Password
        </Tag>
        <Title level={3} style={{ margin: 0, color: '#0f172a', fontWeight: 700 }}>
          Choose a new password
        </Title>
        <Text type="secondary" style={{ fontSize: 13 }}>
          Your new password must be at least 6 characters. All active sessions will be signed out.
        </Text>
      </div>

      <Form layout="vertical" onFinish={handleSubmit(onSubmit)}>
        {/* New Password */}
        <Form.Item
          label={
            <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
              <span style={{ fontWeight: 600, fontSize: 13 }}>
                New Password <span style={{ color: '#ef4444' }}>*</span>
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
          validateStatus={errors.newPassword ? 'error' : ''}
          help={errors.newPassword?.message}
          style={{ marginBottom: 8 }}
        >
          <Controller
            control={control}
            name="newPassword"
            render={({ field }) => (
              <Input.Password
                prefix={<LockOutlined style={{ color: '#94a3b8' }} />}
                placeholder="••••••••••••"
                size="large"
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
            <span style={{ fontWeight: 600, fontSize: 13 }}>
              Confirm New Password <span style={{ color: '#ef4444' }}>*</span>
            </span>
          }
          validateStatus={errors.confirmPassword ? 'error' : ''}
          help={errors.confirmPassword?.message}
          style={{ marginBottom: 20 }}
        >
          <Controller
            control={control}
            name="confirmPassword"
            render={({ field }) => (
              <Input.Password
                prefix={<LockOutlined style={{ color: '#94a3b8' }} />}
                placeholder="Repeat new password"
                size="large"
                autoComplete="new-password"
                {...field}
              />
            )}
          />
        </Form.Item>

        <Button
          type="primary"
          htmlType="submit"
          size="large"
          block
          icon={<RightOutlined />}
          iconPosition="end"
          loading={resetPasswordMutation.isPending}
          style={{ height: 44, fontWeight: 600, borderRadius: 8 }}
        >
          Reset Password
        </Button>
      </Form>

      <div style={{ textAlign: 'center', marginTop: 16, fontSize: 13 }}>
        <Link to={ROUTES.login} style={{ color: '#1677FF', fontWeight: 600 }}>
          ← Back to Sign In
        </Link>
      </div>

      <div
        style={{
          marginTop: 20,
          paddingTop: 16,
          borderTop: '1px solid #f1f5f9',
          display: 'flex',
          gap: 8,
          alignItems: 'flex-start',
        }}
      >
        <CheckCircleFilled style={{ color: '#16a34a', marginTop: 2 }} />
        <Text type="secondary" style={{ fontSize: 12 }}>
          Once reset, any existing sessions will be invalidated and you will need to sign in again.
        </Text>
      </div>
    </Card>
  );
}