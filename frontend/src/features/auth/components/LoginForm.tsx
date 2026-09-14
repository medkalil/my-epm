import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button, Form, Input, Card, Typography, Space, App } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { Link } from 'react-router-dom';
import { loginSchema, type LoginFormValues } from '../schemas/auth.schema';
import { useLoginMutation } from '../api/auth.queries';
import { getApiErrorMessage } from '@/lib/axios';
import { ROUTES } from '@/routes/paths';

export function LoginForm() {
  const { message } = App.useApp();
  const loginMutation = useLoginMutation();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { name: '', password: '' },
  });

  const onSubmit = async (values: LoginFormValues) => {
    try {
      console.log("aaaaaaaaaaaaaaaaaaa")
      await loginMutation.mutateAsync(values);
    } catch (error) {
      message.error(getApiErrorMessage(error));
    }
  };

  return (
    <Card style={{ width: 400, boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}>
      <Space direction="vertical" size={4} style={{ width: '100%', textAlign: 'center', marginBottom: 24 }}>
        <Typography.Title level={3} style={{ margin: 0 }}>
          Welcome back
        </Typography.Title>
        <Typography.Text type="secondary">Sign in to MY-EPM</Typography.Text>
      </Space>

      <Form layout="vertical" onFinish={handleSubmit(onSubmit)}>
        <Form.Item
          label="Username"
          validateStatus={errors.name ? 'error' : ''}
          help={errors.name?.message}
        >
          <Input
            prefix={<UserOutlined />}
            placeholder="Enter your username"
            autoComplete="username"
            {...register('name')}
          />
        </Form.Item>

        <Form.Item
          label="Password"
          validateStatus={errors.password ? 'error' : ''}
          help={errors.password?.message}
        >
          <Input.Password
            prefix={<LockOutlined />}
            placeholder="Enter your password"
            autoComplete="current-password"
            {...register('password')}
          />
        </Form.Item>

        <Button
          type="primary"
          htmlType="submit"
          block
          loading={loginMutation.isPending}
        >
          Sign in
        </Button>
      </Form>

      <Typography.Paragraph style={{ textAlign: 'center', marginTop: 16, marginBottom: 0 }}>
        Don&apos;t have an account? <Link to={ROUTES.register}>Register</Link>
      </Typography.Paragraph>
    </Card>
  );
}