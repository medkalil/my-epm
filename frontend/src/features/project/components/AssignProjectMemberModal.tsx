import { Modal, List, Avatar, Button, Tag, Typography, Space, Input, Empty } from 'antd';
import { UserOutlined, UserAddOutlined, DeleteOutlined, SearchOutlined } from '@ant-design/icons';
import { useState, useMemo } from 'react';
import type { Project } from '../types/project.types';
import { useOrganizationMembers } from '@/features/organization/api/organization.queries';
import { useAddMemberToProject, useRemoveMemberFromProject } from '../api/project.queries';
import { useOrgStore } from '@/stores/orgStore';

interface AssignProjectMemberModalProps {
  project: Project | null;
  open: boolean;
  onClose: () => void;
}

export function AssignProjectMemberModal({ project, open, onClose }: AssignProjectMemberModalProps) {
  const activeOrg = useOrgStore((state) => state.activeOrganization);
  const orgId = activeOrg?.id ?? 0;
  const { data: orgMembers = [], isLoading } = useOrganizationMembers(activeOrg?.id);

  const addMemberMutation = useAddMemberToProject(orgId);
  const removeMemberMutation = useRemoveMemberFromProject(orgId);

  const [searchTerm, setSearchTerm] = useState('');

  const currentMemberIds = useMemo(() => {
    return new Set(project?.memberIds ?? []);
  }, [project?.memberIds]);

  const filteredMembers = useMemo(() => {
    if (!searchTerm.trim()) return orgMembers;
    const term = searchTerm.toLowerCase();
    return orgMembers.filter((m) => {
      const username = m.user?.name ?? `User #${m.userId}`;
      const email = m.user?.email ?? '';
      return username.toLowerCase().includes(term) || email.toLowerCase().includes(term);
    });
  }, [orgMembers, searchTerm]);

  if (!project) return null;

  const handleToggleMember = async (userId: number, isCurrentlyMember: boolean) => {
    if (isCurrentlyMember) {
      await removeMemberMutation.mutateAsync({ projectId: project.id, userId });
    } else {
      await addMemberMutation.mutateAsync({ projectId: project.id, userId });
    }
  };

  return (
    <Modal
      title={
        <div>
          <Typography.Title level={5} style={{ margin: 0 }}>
            Manage Project Contributors
          </Typography.Title>
          <Typography.Text type="secondary" style={{ fontSize: 13 }}>
            Project: <strong style={{ color: '#1890ff' }}>{project.name}</strong>
          </Typography.Text>
        </div>
      }
      open={open}
      onCancel={onClose}
      footer={[
        <Button key="close" type="primary" onClick={onClose}>
          Done
        </Button>,
      ]}
      width={560}
    >
      <div style={{ marginTop: 16, marginBottom: 16 }}>
        <Input
          prefix={<SearchOutlined style={{ color: '#8c8c8c' }} />}
          placeholder="Search workspace members by name or email..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          allowClear
        />
      </div>

      <div style={{ maxHeight: 380, overflowY: 'auto', paddingRight: 4 }}>
        <List
          loading={isLoading}
          dataSource={filteredMembers}
          locale={{
            emptyText: (
              <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description="No organization members found"
              />
            ),
          }}
          renderItem={(item) => {
            const isMember = currentMemberIds.has(item.userId);
            const isPending =
              (addMemberMutation.isPending && addMemberMutation.variables?.userId === item.userId) ||
              (removeMemberMutation.isPending &&
                removeMemberMutation.variables?.userId === item.userId);

            const displayName = item.user?.name ?? `User #${item.userId}`;
            const displayEmail = item.user?.email;

            return (
              <List.Item
                key={item.id}
                actions={[
                  isMember ? (
                    <Button
                      key="remove"
                      danger
                      size="small"
                      icon={<DeleteOutlined />}
                      loading={isPending}
                      onClick={() => handleToggleMember(item.userId, true)}
                    >
                      Remove
                    </Button>
                  ) : (
                    <Button
                      key="add"
                      type="default"
                      size="small"
                      icon={<UserAddOutlined />}
                      loading={isPending}
                      onClick={() => handleToggleMember(item.userId, false)}
                    >
                      Assign
                    </Button>
                  ),
                ]}
              >
                <List.Item.Meta
                  avatar={
                    <Avatar
                      style={{
                        backgroundColor: isMember ? '#1890ff' : '#d9d9d9',
                        color: '#fff',
                        fontWeight: 600,
                      }}
                      icon={<UserOutlined />}
                    >
                      {displayName.charAt(0).toUpperCase()}
                    </Avatar>
                  }
                  title={
                    <Space size={8}>
                      <Typography.Text strong>{displayName}</Typography.Text>
                      {isMember && <Tag color="blue">Assigned</Tag>}
                      <Tag color="default">{item.role}</Tag>
                    </Space>
                  }
                  description={
                    <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                      {displayEmail || `User ID: ${item.userId}`}
                    </Typography.Text>
                  }
                />
              </List.Item>
            );
          }}
        />
      </div>
    </Modal>
  );
}
