import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button, Form, Input, Card, Typography, Tag, App } from 'antd';
import { LockOutlined, RightOutlined, CheckCircleFilled } from '@ant-design/icons';
import {
  changePasswordSchema,
  type ChangePasswordFormValues,
} from '../schemas/auth.schema';
import { useChangePasswordMutation } from '../api/auth.queries';
import { getApiErrorMessage } from '@/lib/axios';

const { Title, Text } = Typography;

interface ChangePasswordFormProps {
  userId: number;
}

export function ChangePasswordForm({ userId }: ChangePasswordFormProps) {
  const { message } = App.useApp();
  const changePasswordMutation = useChangePasswordMutation();

  const {
    control,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<ChangePasswordFormValues>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: { currentPassword: '', newPassword: '', confirmPassword: '' },
  });

  const password = watch('newPassword') || '';
  const has8Chars = password.length >= 8;
  const hasUppercase = /[A-Z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSymbol = /[^A-Za-z0-9]/.test(password);
  const passwordStrengthScore =
    [has8Chars, hasUppercase, hasNumber, hasSymbol].filter(Boolean).length;

  const onSubmit = async (values: ChangePasswordFormValues) => {
    try {
      await changePasswordMutation.mutateAsync({
        userId,
        currentPassword: values.currentPassword,
        newPassword: values.newPassword,
      });
    } catch (error) {
      message.error(getApiErrorMessage(error));
    }
  };

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
          ● Set Your Password
        </Tag>
        <Title level={3} style={{ margin: 0, color: '#0f172a', fontWeight: 700 }}>
          Create a new password
        </Title>
        <Text type="secondary" style={{ fontSize: 13, display: 'block', marginTop: 4 }}>
          Your account was created with a temporary password. Please choose a
          permanent one before you continue.
        </Text>
      </div>

      <Form layout="vertical" onFinish={handleSubmit(onSubmit)}>
        <Form.Item
          label={
            <span style={{ fontWeight: 600, fontSize: 13 }}>
              Current Password <span style={{ color: '#ef4444' }}>*</span>
            </span>
          }
          validateStatus={errors.currentPassword ? 'error' : ''}
          help={errors.currentPassword?.message}
          style={{ marginBottom: 16 }}
        >
          <Controller
            control={control}
            name="currentPassword"
            render={({ field }) => (
              <Input.Password
                prefix={<LockOutlined style={{ color: '#94a3b8' }} />}
                placeholder="Temporary password"
                size="large"
                autoComplete="current-password"
                {...field}
              />
            )}
          />
        </Form.Item>

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
          loading={changePasswordMutation.isPending}
          style={{ height: 44, fontWeight: 600, borderRadius: 8 }}
        >
          Save Password
        </Button>
      </Form>

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
          After saving, sign in with your new password to continue.
        </Text>
      </div>
    </Card>
  );
}