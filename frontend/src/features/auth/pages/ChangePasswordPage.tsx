import { Typography } from 'antd';
import { ApartmentOutlined } from '@ant-design/icons';
import { Link, Navigate, useLocation } from 'react-router-dom';
import { ChangePasswordForm } from '../components/ChangePasswordForm';
import { ROUTES } from '@/routes/paths';

const { Text } = Typography;

export default function ChangePasswordPage() {
  const location = useLocation();
  const state = location.state as { userId?: number } | null;
  const userId = state?.userId;

  if (typeof userId !== 'number') {
    return <Navigate to={ROUTES.login} replace />;
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#f1f5f9',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px 16px',
      }}
    >
      <div style={{ width: '100%', maxWidth: 480 }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 10,
            marginBottom: 24,
          }}
        >
          <Link to={ROUTES.home} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
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
              }}
            >
              <ApartmentOutlined style={{ fontSize: 18 }} />
            </div>
            <Text strong style={{ fontSize: 15, color: '#0f172a' }}>
              MY-EPM
            </Text>
          </Link>
        </div>
        <ChangePasswordForm userId={userId} />
      </div>
    </div>
  );
}