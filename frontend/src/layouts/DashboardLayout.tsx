import { useState } from 'react';
import { Layout } from 'antd';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { useMyOrganizations } from '@/features/organization/api/organization.queries';

const { Content } = Layout;

export function DashboardLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const [orgSwitchOpen, setOrgSwitchOpen] = useState(false);

  // Sync user's organizations in the background
  useMyOrganizations();

  return (
    <Layout style={{ minHeight: '100vh', background: '#f8fafc' }}>
      <Sidebar
        collapsed={collapsed}
        onOpenOrgSwitch={() => setOrgSwitchOpen(true)}
      />
      <Layout>
        <Header
          collapsed={collapsed}
          onToggle={() => setCollapsed(!collapsed)}
          orgSwitchOpen={orgSwitchOpen}
          onCloseOrgSwitch={() => setOrgSwitchOpen(false)}
        />
        <Content
          style={{
            padding: '24px 32px',
            background: '#f8fafc',
            minHeight: 'calc(100vh - 60px)',
          }}
        >
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
}