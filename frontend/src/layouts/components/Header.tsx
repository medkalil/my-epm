import { Avatar, Dropdown, Space, Select, App } from 'antd';
import type { MenuProps } from 'antd';
import { UserOutlined, LogoutOutlined, MenuFoldOutlined, MenuUnfoldOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { organizationService } from '@/services/organization.service';
import { useOrgStore } from '@/stores/orgStore';
import { useAuthStore } from '@/stores/authStore';
import { ROUTES } from '@/routes/paths';
import { getApiErrorMessage } from '@/lib/axios';

interface HeaderProps {
  collapsed: boolean;
  onToggle: () => void;
}

export function Header({ collapsed, onToggle }: HeaderProps) {
  const navigate = useNavigate();
  const { message } = App.useApp();
  const activeOrganization = useOrgStore((state) => state.activeOrganization);
  const setActiveOrganization = useOrgStore((state) => state.setActiveOrganization);
  const user = useAuthStore((state) => state.user);
  const clearAuth = useAuthStore((state) => state.clear);

  const { data: myOrgs } = useQuery({
    queryKey: ['organizations', 'mine'],
    queryFn: () => organizationService.getMine(),
  });

  const orgOptions =
    myOrgs?.content.map((org) => ({ label: org.name, value: org.id })) ?? [];

  const handleOrgChange = async (orgId: number) => {
    try {
      const org = await organizationService.switchActive(orgId);
      setActiveOrganization(org);
      message.success(`Switched to ${org.name}`);
    } catch (error) {
      message.error(getApiErrorMessage(error));
    }
  };

  const handleLogout = () => {
    clearAuth();
    navigate(ROUTES.login);
  };

  const menuItems: MenuProps['items'] = [
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: 'Log out',
      danger: true,
      onClick: handleLogout,
    },
  ];

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 24px',
        height: '100%',
      }}
    >
      <Space>
        <div onClick={onToggle} style={{ cursor: 'pointer', fontSize: 18 }}>
          {collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
        </div>
      </Space>

      <Space size="large">
        {orgOptions.length > 0 && (
          <Select
            style={{ minWidth: 180 }}
            placeholder="Switch organization"
            value={activeOrganization?.id}
            options={orgOptions}
            onChange={handleOrgChange}
          />
        )}
        <Dropdown menu={{ items: menuItems }}>
          <Space style={{ cursor: 'pointer' }}>
            <Avatar icon={<UserOutlined />} />
            <span>{user?.name}</span>
          </Space>
        </Dropdown>
      </Space>
    </div>
  );
}