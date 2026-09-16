import {
  Space,
  Input,
  Tag,
  Button,
  Badge,
  Modal,
  List,
  Typography,
  App,
} from 'antd';
import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  SearchOutlined,
  BellOutlined,
  QuestionCircleOutlined,
  BankOutlined,
  CheckCircleFilled,
  PlusOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useOrgStore } from '@/stores/orgStore';
import { organizationService } from '@/services/organization.service';
import { ROUTES } from '@/routes/paths';
import { getApiErrorMessage } from '@/lib/axios';

const { Text } = Typography;

interface HeaderProps {
  collapsed: boolean;
  onToggle: () => void;
  orgSwitchOpen: boolean;
  onCloseOrgSwitch: () => void;
}

export function Header({
  collapsed,
  onToggle,
  orgSwitchOpen,
  onCloseOrgSwitch,
}: HeaderProps) {
  const navigate = useNavigate();
  const { message } = App.useApp();
  const activeOrganization = useOrgStore((state) => state.activeOrganization);
  const organizations = useOrgStore((state) => state.organizations);
  const setActiveOrganization = useOrgStore((state) => state.setActiveOrganization);

  const handleOrgChange = async (orgId: number) => {
    try {
      const org = await organizationService.switchActive(orgId);
      setActiveOrganization(org);
      message.success(`Switched active workspace to ${org.name}`);
      onCloseOrgSwitch();
    } catch (error) {
      message.error(getApiErrorMessage(error));
    }
  };

  return (
    <>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 24px',
          height: 60,
          background: '#ffffff',
          borderBottom: '1px solid #e2e8f0',
        }}
      >
        {/* Left Toggle & Enterprise Cluster Path */}
        <Space size={16}>
          <div onClick={onToggle} style={{ cursor: 'pointer', fontSize: 16, color: '#64748b' }}>
            {collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
          </div>
          <Space size={8} style={{ fontSize: 13, color: '#475569' }}>
            <Text strong style={{ color: '#0f172a' }}>
              {activeOrganization?.name || 'Workspace'}
            </Text>
            <span>&gt;</span>
            <span style={{ color: '#64748b' }}>Console</span>
            <Tag color="processing" style={{ marginLeft: 6, fontSize: 11 }}>
              ● Multi-Tenant Enterprise Cluster
            </Tag>
          </Space>
        </Space>

        {/* Center Search Input */}
        <div style={{ maxWidth: 360, width: '100%', margin: '0 16px' }} className="hidden sm:block">
          <Input
            prefix={<SearchOutlined style={{ color: '#94a3b8' }} />}
            placeholder="Search tasks, commits, members (⌘K)"
            style={{ borderRadius: 8, background: '#f8fafc', border: '1px solid #e2e8f0' }}
          />
        </div>

        {/* Right Controls */}
        <Space size={14}>
          <Button
            type="default"
            size="middle"
            icon={<BankOutlined style={{ color: '#1677FF' }} />}
            onClick={() => onCloseOrgSwitch()}
            style={{ borderRadius: 8, fontWeight: 500 }}
          >
            {activeOrganization?.name || 'Switch Workspace'}
            <Tag color="blue" style={{ marginLeft: 6, fontSize: 10, borderRadius: 4 }}>
              OWNER
            </Tag>
          </Button>

          <Badge dot>
            <Button
              type="text"
              icon={<BellOutlined style={{ fontSize: 16, color: '#64748b' }} />}
              shape="circle"
            />
          </Badge>

          <Button
            type="text"
            icon={<QuestionCircleOutlined style={{ fontSize: 16, color: '#64748b' }} />}
            shape="circle"
          />
        </Space>
      </div>

      {/* Organization Switcher Modal */}
      <Modal
        title="Switch Organization Workspace"
        open={orgSwitchOpen}
        onCancel={onCloseOrgSwitch}
        footer={[
          <Button
            key="create"
            icon={<PlusOutlined />}
            onClick={() => {
              onCloseOrgSwitch();
              navigate(ROUTES.organizations.create);
            }}
          >
            Create New Organization
          </Button>,
          <Button key="close" type="primary" onClick={onCloseOrgSwitch}>
            Done
          </Button>,
        ]}
      >
        <List
          itemLayout="horizontal"
          dataSource={organizations}
          renderItem={(org) => {
            const isSelected = org.id === activeOrganization?.id;
            return (
              <List.Item
                style={{
                  cursor: 'pointer',
                  padding: '12px 16px',
                  borderRadius: 8,
                  background: isSelected ? '#eff6ff' : 'transparent',
                  border: isSelected ? '1px solid #bfdbfe' : '1px solid transparent',
                  marginBottom: 6,
                }}
                onClick={() => handleOrgChange(org.id)}
              >
                <List.Item.Meta
                  avatar={
                    <div
                      style={{
                        width: 32,
                        height: 32,
                        borderRadius: 6,
                        background: '#1677FF',
                        color: '#fff',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 'bold',
                      }}
                    >
                      {org.name.charAt(0).toUpperCase()}
                    </div>
                  }
                  title={
                    <Space>
                      <Text strong>{org.name}</Text>
                      {isSelected && (
                        <Tag color="blue" icon={<CheckCircleFilled />}>
                          Active
                        </Tag>
                      )}
                    </Space>
                  }
                  description={`Workspace URL: /${org.slug}`}
                />
              </List.Item>
            );
          }}
        />
      </Modal>
    </>
  );
}