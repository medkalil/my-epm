import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button, Form, Input, Card, Typography, Space, App } from 'antd';
import { UserOutlined, LockOutlined, MailOutlined } from '@ant-design/icons';
import { Link } from 'react-router-dom';
import { registerSchema, type RegisterFormValues } from '../schemas/auth.schema';
import { useRegisterMutation } from '../api/auth.queries';
import { getApiErrorMessage } from '@/lib/axios';
import { ROUTES } from '@/routes/paths';

export function RegisterForm() {
  const { message } = App.useApp();
  const registerMutation = useRegisterMutation();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: { name: '', email: '', password: '', confirmPassword: '' },
  });

  const onSubmit = async ({ confirmPassword: _confirm, ...values }: RegisterFormValues) => {
    try {
      await registerMutation.mutateAsync(values);
      message.success('Account created. Please sign in.');
    } catch (error) {
      message.error(getApiErrorMessage(error));
    }
  };

  return (
    <Card style={{ width: 400, boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}>
      <Space direction="vertical" size={4} style={{ width: '100%', textAlign: 'center', marginBottom: 24 }}>
        <Typography.Title level={3} style={{ margin: 0 }}>
          Create your account
        </Typography.Title>
        <Typography.Text type="secondary">Start managing your projects today</Typography.Text>
      </Space>

      <Form layout="vertical" onFinish={handleSubmit(onSubmit)}>
        <Form.Item
          label="Username"
          validateStatus={errors.name ? 'error' : ''}
          help={errors.name?.message}
        >
          <Input
            prefix={<UserOutlined />}
            placeholder="Choose a username"
            autoComplete="username"
            {...register('name')}
          />
        </Form.Item>

        <Form.Item
          label="Email"
          validateStatus={errors.email ? 'error' : ''}
          help={errors.email?.message}
        >
          <Input
            prefix={<MailOutlined />}
            placeholder="Email (optional)"
            autoComplete="email"
            {...register('email')}
          />
        </Form.Item>

        <Form.Item
          label="Password"
          validateStatus={errors.password ? 'error' : ''}
          help={errors.password?.message}
        >
          <Input.Password
            prefix={<LockOutlined />}
            placeholder="At least 6 characters"
            autoComplete="new-password"
            {...register('password')}
          />
        </Form.Item>

        <Form.Item
          label="Confirm password"
          validateStatus={errors.confirmPassword ? 'error' : ''}
          help={errors.confirmPassword?.message}
        >
          <Input.Password
            prefix={<LockOutlined />}
            placeholder="Repeat your password"
            autoComplete="new-password"
            {...register('confirmPassword')}
          />
        </Form.Item>

        <Button
          type="primary"
          htmlType="submit"
          block
          loading={registerMutation.isPending}
        >
          Create account
        </Button>
      </Form>

      <Typography.Paragraph style={{ textAlign: 'center', marginTop: 16, marginBottom: 0 }}>
        Already registered? <Link to={ROUTES.login}>Sign in</Link>
      </Typography.Paragraph>
    </Card>
  );
}