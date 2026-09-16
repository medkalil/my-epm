import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Button,
  Form,
  Input,
  Card,
  Typography,
  Space,
  Checkbox,
  Divider,
  Tag,
  App,
} from 'antd';
import {
  UserOutlined,
  LockOutlined,
  BankOutlined,
  LoginOutlined,
} from '@ant-design/icons';
import { Link } from 'react-router-dom';
import { loginSchema, type LoginFormValues } from '../schemas/auth.schema';
import { useLoginMutation } from '../api/auth.queries';
import { getApiErrorMessage } from '@/lib/axios';
import { ROUTES } from '@/routes/paths';

const { Title, Text } = Typography;

export function LoginForm() {
  const { message } = App.useApp();
  const loginMutation = useLoginMutation();

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: '',
      password: '',
      rememberSession: true,
    },
  });

  const onSubmit = async (values: LoginFormValues) => {
    try {
      await loginMutation.mutateAsync({
        username: values.username,
        password: values.password,
      });
      message.success('Signed in successfully');
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
      <div style={{ marginBottom: 24 }}>
        <Tag color="blue" style={{ marginBottom: 8, fontSize: 11 }}>
          ● Enterprise Single Sign-On
        </Tag>
        <Title level={3} style={{ margin: 0, color: '#0f172a', fontWeight: 700 }}>
          Sign in to your account
        </Title>
        <Text type="secondary" style={{ fontSize: 13 }}>
          Enter your enterprise credentials to access your tenant workspace.
        </Text>
      </div>

      <Form layout="vertical" onFinish={handleSubmit(onSubmit)}>
        {/* Corporate Email / Username */}
        <Form.Item
          label={<span style={{ fontWeight: 600, fontSize: 13 }}>Corporate Email / Username</span>}
          validateStatus={errors.username ? 'error' : ''}
          help={errors.username?.message}
          style={{ marginBottom: 16 }}
        >
          <Controller
            control={control}
            name="username"
            render={({ field }) => (
              <Input
                prefix={<UserOutlined style={{ color: '#94a3b8' }} />}
                placeholder="e.g. architect@fintech-core.internal or username"
                size="large"
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
              <span style={{ fontWeight: 600, fontSize: 13 }}>Password</span>
            </div>
          }
          validateStatus={errors.password ? 'error' : ''}
          help={errors.password?.message}
          style={{ marginBottom: 16 }}
        >
          <Controller
            control={control}
            name="password"
            render={({ field }) => (
              <Input.Password
                prefix={<LockOutlined style={{ color: '#94a3b8' }} />}
                placeholder="••••••••••••"
                size="large"
                autoComplete="current-password"
                {...field}
              />
            )}
          />
            <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', padding: '10px' }}>
              <a style={{ fontSize: 12, color: '#1677FF' }}>Forgot password?</a>
            </div>
        </Form.Item>

        <Form.Item style={{ marginBottom: 20 }}>
          <Controller
            control={control}
            name="rememberSession"
            render={({ field: { value, onChange } }) => (
              <Checkbox checked={value} onChange={(e) => onChange(e.target.checked)}>
                <span style={{ fontSize: 13 }}>Remember session</span>
              </Checkbox>
            )}
          />
        </Form.Item>

        <Button
          type="primary"
          htmlType="submit"
          size="large"
          block
          icon={<LoginOutlined />}
          loading={loginMutation.isPending}
          style={{ height: 44, fontWeight: 600, borderRadius: 8 }}
        >
          Sign In
        </Button>
      </Form>

      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginTop: 24,
          paddingTop: 16,
          borderTop: '1px solid #f1f5f9',
          fontSize: 13,
        }}
      >
        <span style={{ color: '#64748b' }}>
          Don&apos;t have an account?{' '}
          <Link to={ROUTES.register} style={{ color: '#1677FF', fontWeight: 600 }}>
            Sign Up Free
          </Link>
        </span>
        <Link to={ROUTES.register} style={{ color: '#64748b', fontSize: 12 }}>
          Join with Slug →
        </Link>
      </div>
    </Card>
  );
}