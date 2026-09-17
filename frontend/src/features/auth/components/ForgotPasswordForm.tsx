import { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button, Form, Input, Card, Typography, Tag, App } from 'antd';
import { MailOutlined, RightOutlined, CheckCircleFilled, KeyOutlined } from '@ant-design/icons';
import { Link, useNavigate } from 'react-router-dom';
import {
  forgotPasswordSchema,
  type ForgotPasswordFormValues,
} from '../schemas/auth.schema';
import { useForgotPasswordMutation } from '../api/auth.queries';
import { getApiErrorMessage } from '@/lib/axios';
import { ROUTES } from '@/routes/paths';

const { Title, Text } = Typography;

export function ForgotPasswordForm() {
  const { message } = App.useApp();
  const navigate = useNavigate();
  const forgotPasswordMutation = useForgotPasswordMutation();
  const [submittedIdentifier, setSubmittedIdentifier] = useState<string | null>(null);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { identifier: '' },
  });

  const onSubmit = async (values: ForgotPasswordFormValues) => {
    try {
      await forgotPasswordMutation.mutateAsync({ identifier: values.identifier });
      setSubmittedIdentifier(values.identifier);
    } catch (error) {
      message.error(getApiErrorMessage(error));
    }
  };

  if (submittedIdentifier !== null) {
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
        <CheckCircleFilled style={{ fontSize: 48, color: '#16a34a', marginBottom: 16 }} />
        <Title level={3} style={{ margin: '0 0 8px', color: '#0f172a', fontWeight: 700 }}>
          Check your inbox
        </Title>
        <Text type="secondary" style={{ fontSize: 13, display: 'block', marginBottom: 20 }}>
          If an account exists for <strong>{submittedIdentifier}</strong>, a password reset link
          has been sent to its registered email address. The link expires in 30 minutes.
        </Text>
        <Button
          type="primary"
          size="large"
          block
          onClick={() => navigate(ROUTES.login)}
          style={{ height: 44, fontWeight: 600, borderRadius: 8 }}
        >
          Back to Sign In
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
          ● Account Recovery
        </Tag>
        <Title level={3} style={{ margin: 0, color: '#0f172a', fontWeight: 700 }}>
          Reset your password
        </Title>
        <Text type="secondary" style={{ fontSize: 13 }}>
          Enter your username or work email and we&apos;ll send you a password reset link.
        </Text>
      </div>

      <Form layout="vertical" onFinish={handleSubmit(onSubmit)}>
        <Form.Item
          label={
            <span style={{ fontWeight: 600, fontSize: 13 }}>
              Username or Email <span style={{ color: '#ef4444' }}>*</span>
            </span>
          }
          validateStatus={errors.identifier ? 'error' : ''}
          help={errors.identifier?.message}
          style={{ marginBottom: 20 }}
        >
          <Controller
            control={control}
            name="identifier"
            render={({ field }) => (
              <Input
                prefix={<MailOutlined style={{ color: '#94a3b8' }} />}
                placeholder="e.g. evance or e.vance@company.com"
                size="large"
                autoComplete="username"
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
          loading={forgotPasswordMutation.isPending}
          style={{ height: 44, fontWeight: 600, borderRadius: 8 }}
        >
          Send Reset Link
        </Button>
      </Form>

      <div style={{ textAlign: 'center', marginTop: 16, fontSize: 13 }}>
        <span style={{ color: '#64748b' }}>Remembered your password? </span>
        <Link to={ROUTES.login} style={{ color: '#1677FF', fontWeight: 600 }}>
          Sign In Instead →
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
        <KeyOutlined style={{ color: '#94a3b8', marginTop: 2 }} />
        <Text type="secondary" style={{ fontSize: 12 }}>
          For security, the reset link is valid for 30 minutes and can only be used once. If you
          didn&apos;t request this, you can safely ignore the email.
        </Text>
      </div>
    </Card>
  );
}