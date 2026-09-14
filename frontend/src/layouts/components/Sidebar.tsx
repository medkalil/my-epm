import { Layout, Menu, Typography } from 'antd';
import type { MenuProps } from 'antd';
import {
  DashboardOutlined,
  ProjectOutlined,
  CheckSquareOutlined,
  SafetyCertificateOutlined,
  ApartmentOutlined,
} from '@ant-design/icons';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ROUTES } from '@/routes/paths';
import { useOrgStore } from '@/stores/orgStore';
import { useAuthStore } from '@/stores/authStore';

interface SidebarProps {
  collapsed: boolean;
}

type MenuItem = Required<MenuProps>['items'][number];

export function Sidebar({ collapsed }: SidebarProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const activeOrganization = useOrgStore((state) => state.activeOrganization);
  const user = useAuthStore((state) => state.user);

  const orgId = activeOrganization?.id;

  const items: MenuItem[] = [
    { key: ROUTES.dashboard, icon: <DashboardOutlined />, label: <Link to={ROUTES.dashboard}>Dashboard</Link> },
    {
      key: ROUTES.projects.base,
      icon: <ProjectOutlined />,
      label: <Link to={ROUTES.projects.base}>Projects</Link>,
    },
    {
      key: ROUTES.tasks.base,
      icon: <CheckSquareOutlined />,
      label: <Link to={ROUTES.tasks.base}>Tasks</Link>,
    },
    orgId
      ? {
          key: 'organization',
          icon: <ApartmentOutlined />,
          label: 'Organization',
          children: [
            {
              key: ROUTES.organizations.settings(orgId),
              label: <Link to={ROUTES.organizations.settings(orgId)}>Settings</Link>,
            },
            {
              key: ROUTES.organizations.team(orgId),
              label: <Link to={ROUTES.organizations.team(orgId)}>Team & Access</Link>,
            },
            {
              key: ROUTES.organizations.security(orgId),
              icon: <SafetyCertificateOutlined />,
              label: <Link to={ROUTES.organizations.security(orgId)}>Security & Audit</Link>,
            },
          ],
        }
      : null,
  ];

  const selectedKeys = items?.some((item) => item?.key === location.pathname)
    ? [location.pathname]
    : [];

  return (
    <Layout.Sider
      width={240}
      collapsed={collapsed}
      collapsible
      trigger={null}
      theme="dark"
    >
      <div
        style={{
          height: 56,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#fff',
          cursor: 'pointer',
        }}
        onClick={() => navigate(ROUTES.dashboard)}
      >
        <Typography.Title level={5} style={{ color: '#fff', margin: 0 }}>
          {collapsed ? 'E' : 'MY-EPM'}
        </Typography.Title>
      </div>
      <Menu
        theme="dark"
        mode="inline"
        selectedKeys={selectedKeys}
        defaultOpenKeys={orgId ? ['organization'] : []}
        items={items}
        style={{ borderInlineEnd: 'none' }}
      />
      <div
        style={{
          position: 'absolute',
          bottom: 16,
          left: 16,
          right: 16,
          color: '#94a3b8',
          fontSize: 12,
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
        }}
      >
        {user?.name}
      </div>
    </Layout.Sider>
  );
}