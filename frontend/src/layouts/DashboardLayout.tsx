import { Layout } from 'antd';
import { Outlet } from 'react-router-dom';
import { Sidebar } from '@/layouts/components/Sidebar';
import { Header } from '@/layouts/components/Header';
import { Breadcrumb } from '@/layouts/components/Breadcrumb';
import { ErrorBoundary } from '@/components/ui/ErrorBoundary';
import { useUiStore } from '@/stores/uiStore';

export function DashboardLayout() {
  const sidebarCollapsed = useUiStore((state) => state.sidebarCollapsed);
  const toggleSidebar = useUiStore((state) => state.toggleSidebar);

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sidebar collapsed={sidebarCollapsed} />
      <Layout>
        <Layout.Header style={{ padding: 0, position: 'sticky', top: 0, zIndex: 100 }}>
          <Header collapsed={sidebarCollapsed} onToggle={toggleSidebar} />
        </Layout.Header>
        <Breadcrumb />
        <Layout.Content style={{ padding: '16px 24px' }}>
          <ErrorBoundary>
            <Outlet />
          </ErrorBoundary>
        </Layout.Content>
      </Layout>
    </Layout>
  );
}