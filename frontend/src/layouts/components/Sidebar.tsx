import { Layout, Menu, Typography, Tag, Space, Avatar, Button } from 'antd';
import type { MenuProps } from 'antd';
import {
  DashboardOutlined,
  ProjectOutlined,
  CheckSquareOutlined,
  TeamOutlined,
  SettingOutlined,
  SafetyCertificateOutlined,
  ApartmentOutlined,
  LogoutOutlined,
  DownOutlined,
} from '@ant-design/icons';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ROUTES } from '@/routes/paths';
import { useOrgStore } from '@/stores/orgStore';
import { useAuthStore } from '@/stores/authStore';

const { Text } = Typography;

interface SidebarProps {
  collapsed: boolean;
  onOpenOrgSwitch?: () => void;
}

export function Sidebar({ collapsed, onOpenOrgSwitch }: SidebarProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const activeOrganization = useOrgStore((state) => state.activeOrganization);
  const user = useAuthStore((state) => state.user);
  const clearAuth = useAuthStore((state) => state.clear);
  const clearOrg = useOrgStore((state) => state.clear);

  const orgId = activeOrganization?.id;

  const handleLogout = () => {
    clearAuth();
    clearOrg();
    navigate(ROUTES.login);
  };

  const menuItems: Required<MenuProps>['items'] = [
    {
      type: 'group',
      label: collapsed ? null : <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: 0.8, color: '#64748b' }}>OPERATIONS</span>,
      children: [
        {
          key: ROUTES.dashboard,
          icon: <DashboardOutlined />,
          label: <Link to={ROUTES.dashboard}>Overview</Link>,
        },
        {
          key: ROUTES.projects.base,
          icon: <ProjectOutlined />,
          label: (
            <Link to={ROUTES.projects.base} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>Projects</span>
              {!collapsed && <Tag color="blue" style={{ fontSize: 10, borderRadius: 10, padding: '0 6px', margin: 0 }}>Active</Tag>}
            </Link>
          ),
        },
        {
          key: ROUTES.tasks.base,
          icon: <CheckSquareOutlined />,
          label: <Link to={ROUTES.tasks.base}>Tasks &amp; Boards</Link>,
        },
        {
          key: orgId ? ROUTES.organizations.team(orgId) : '/team',
          icon: <TeamOutlined />,
          label: (
            <Link to={orgId ? ROUTES.organizations.team(orgId) : ROUTES.dashboard} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>Team &amp; Access</span>
              {!collapsed && <Tag color="geekblue" style={{ fontSize: 9, borderRadius: 4, padding: '0 4px', margin: 0 }}>RBAC</Tag>}
            </Link>
          ),
        },
      ],
    },
    {
      type: 'group',
      label: collapsed ? null : <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: 0.8, color: '#64748b' }}>ADMINISTRATION</span>,
      children: [
        {
          key: orgId ? ROUTES.organizations.settings(orgId) : '/settings',
          icon: <SettingOutlined />,
          label: <Link to={orgId ? ROUTES.organizations.settings(orgId) : ROUTES.dashboard}>Org Settings</Link>,
        },
        {
          key: orgId ? ROUTES.organizations.security(orgId) : '/security',
          icon: <SafetyCertificateOutlined />,
          label: <Link to={orgId ? ROUTES.organizations.security(orgId) : ROUTES.dashboard}>API &amp; Audit Logs</Link>,
        },
      ],
    },
  ];

  return (
    <Layout.Sider
      width={250}
      collapsed={collapsed}
      collapsible
      trigger={null}
      className="app-sider"
      style={{
        background: '#ffffff',
        borderRight: '1px solid #e2e8f0',
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        position: 'sticky',
        top: 0,
        left: 0,
        zIndex: 100,
      }}
    >
      {/* Brand Header */}
      <div
        style={{
          padding: '18px 20px',
          borderBottom: '1px solid #f1f5f9',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: 10,
        }}
        onClick={() => navigate(ROUTES.dashboard)}
      >
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
            flexShrink: 0,
          }}
        >
          <ApartmentOutlined style={{ fontSize: 18 }} />
        </div>
        {!collapsed && (
          <div style={{ overflow: 'hidden' }}>
            <Text strong style={{ fontSize: 14, color: '#0f172a', display: 'block', lineHeight: 1.2 }}>
              MY-EPM
            </Text>
          </div>
        )}
      </div>

      {/* Active Org Context Switcher Bar */}
      {!collapsed && (
        <div style={{ padding: '12px 14px 4px' }}>
          <div
            style={{
              background: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: 10,
              padding: '8px 12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              cursor: 'pointer',
            }}
            onClick={onOpenOrgSwitch}
          >
            <Space size={8} style={{ overflow: 'hidden' }}>
              <div
                style={{
                  width: 26,
                  height: 26,
                  borderRadius: 6,
                  background: '#1677FF',
                  color: '#fff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 12,
                  fontWeight: 700,
                  flexShrink: 0,
                }}
              >
                {activeOrganization?.name ? activeOrganization.name.charAt(0).toUpperCase() : 'O'}
              </div>
              <div style={{ overflow: 'hidden' }}>
                <Text strong style={{ fontSize: 12, display: 'block', textOverflow: 'ellipsis', whiteSpace: 'nowrap', overflow: 'hidden' }}>
                  {activeOrganization?.name || 'No Organization'}
                </Text>
                <Text type="secondary" style={{ fontSize: 10 }}>
                  /{activeOrganization?.slug || 'none'}
                </Text>
              </div>
            </Space>
            <DownOutlined style={{ fontSize: 10, color: '#94a3b8' }} />
          </div>
        </div>
      )}

      {/* Nav Menu */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '8px 6px' }}>
        <Menu
          mode="inline"
          selectedKeys={[location.pathname]}
          items={menuItems}
          style={{ borderRight: 'none' }}
        />
      </div>

      {/* Bottom User Profile Section */}
      <div
        style={{
          borderTop: '1px solid #f1f5f9',
          padding: '12px 16px',
          background: '#fafafa',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Space size={10} style={{ overflow: 'hidden' }}>
            <Avatar style={{ background: '#1677FF', flexShrink: 0 }}>
              {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
            </Avatar>
            {!collapsed && (
              <div style={{ overflow: 'hidden' }}>
                <Text strong style={{ fontSize: 12, display: 'block', textOverflow: 'ellipsis', whiteSpace: 'nowrap', overflow: 'hidden' }}>
                  {user?.name || user?.username || 'Admin User'}
                </Text>
                <Text type="secondary" style={{ fontSize: 10 }}>
                  Global Admin
                </Text>
              </div>
            )}
          </Space>
          <Button
            type="text"
            icon={<LogoutOutlined style={{ color: '#ef4444' }} />}
            onClick={handleLogout}
            title="Log out"
            size="small"
          />
        </div>
      </div>
    </Layout.Sider>
  );
}