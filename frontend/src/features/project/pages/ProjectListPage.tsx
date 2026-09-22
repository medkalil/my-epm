import {
  Button,
  Row,
  Col,
  Card,
  Typography,
  Input,
  Radio,
  Tabs,
  Table,
  Tag,
  Progress,
  Avatar,
  Tooltip,
  Dropdown,
  Space,
  Select,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import type { MenuProps } from 'antd';
import {
  PlusOutlined,
  DownloadOutlined,
  FolderOpenOutlined,
  CheckSquareOutlined,
  TeamOutlined,
  ThunderboltOutlined,
  SearchOutlined,
  UnorderedListOutlined,
  AppstoreOutlined,
  UserOutlined,
  UsergroupAddOutlined,
  MoreOutlined,
  DeleteOutlined,
  SyncOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
} from '@ant-design/icons';
import { useState, useMemo } from 'react';
import { PageHeader } from '@/components/ui/PageHeader';
import { ProjectCard } from '../components/ProjectCard';
import { CreateProjectModal } from '../components/CreateProjectModal';
import { AssignProjectMemberModal } from '../components/AssignProjectMemberModal';
import { useProjects, useUpdateProject, useDeleteProject } from '../api/project.queries';
import { useOrganizationMembers } from '@/features/organization/api/organization.queries';
import { useTasksByOrganization } from '@/features/task/api/task.queries';
import { projectProgressPercent } from '../utils/projectProgress';
import { EmptyState } from '@/components/ui/EmptyState';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { useOrgStore } from '@/stores/orgStore';
import type { Project, ProjectStatus } from '../types/project.types';

export default function ProjectListPage() {
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [selectedProjectIdForMembers, setSelectedProjectIdForMembers] = useState<number | null>(
    null,
  );
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');
  const [activeStatusTab, setActiveStatusTab] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMemberFilter, setSelectedMemberFilter] = useState<number | null>(null);

  const activeOrganization = useOrgStore((state) => state.activeOrganization);
  const orgId = activeOrganization?.id ?? 0;

  const { data: projects = [], isLoading: isProjectsLoading } = useProjects();
  const { data: orgMembers = [] } = useOrganizationMembers(activeOrganization?.id);
  const { data: orgTasks = [] } = useTasksByOrganization();

  const updateMutation = useUpdateProject(orgId);
  const deleteMutation = useDeleteProject(orgId);

  // Task-based progress per project (avg of 25/50/75/100 scores)
  const progressByProjectId = useMemo(() => {
    const map = new Map<number, number>();
    const byProject = new Map<number, typeof orgTasks>();
    for (const task of orgTasks) {
      const list = byProject.get(task.projectId) ?? [];
      list.push(task);
      byProject.set(task.projectId, list);
    }
    for (const [projectId, tasks] of byProject) {
      map.set(projectId, projectProgressPercent(tasks));
    }
    return map;
  }, [orgTasks]);

  // Portfolio velocity = average of per-project task progress
  const portfolioVelocity = useMemo(() => {
    const percents = projects.map((p) => progressByProjectId.get(p.id) ?? 0);
    if (percents.length === 0) return 0;
    return Math.round((percents.reduce((a, b) => a + b, 0) / percents.length) * 10) / 10;
  }, [projects, progressByProjectId]);

  // Filtered projects
  const filteredProjects = useMemo(() => {
    return projects.filter((project) => {
      // Status filter
      if (activeStatusTab !== 'ALL' && (project.status || 'IN_PROGRESS') !== activeStatusTab) {
        return false;
      }

      // Member filter
      if (
        selectedMemberFilter !== null &&
        !(project.memberIds ?? []).includes(selectedMemberFilter)
      ) {
        return false;
      }

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = project.name.toLowerCase().includes(q);
        const matchesDesc = (project.description ?? '').toLowerCase().includes(q);
        const matchesCode = `prj-${project.id}`.includes(q);
        if (!matchesName && !matchesDesc && !matchesCode) {
          return false;
        }
      }

      return true;
    });
  }, [projects, activeStatusTab, selectedMemberFilter, searchQuery]);

  // Counts for status tabs
  const tabCounts = useMemo(() => {
    const counts = {
      ALL: projects.length,
      IN_PROGRESS: 0,
      IN_REVIEW: 0,
      COMPLETED: 0,
    };
    projects.forEach((p) => {
      const st = p.status || 'IN_PROGRESS';
      if (st in counts) {
        counts[st as keyof typeof counts] += 1;
      }
    });
    return counts;
  }, [projects]);

  // Distinct contributors count across all projects
  const totalContributorsCount = useMemo(() => {
    const userIds = new Set<number>();
    projects.forEach((p) => {
      (p.memberIds ?? []).forEach((uid) => userIds.add(uid));
    });
    return userIds.size;
  }, [projects]);

  const selectedProject = useMemo(
    () => projects.find((p) => p.id === selectedProjectIdForMembers) ?? null,
    [projects, selectedProjectIdForMembers],
  );

  const handleUpdateStatus = (project: Project, newStatus: ProjectStatus) => {
    updateMutation.mutate({
      id: project.id,
      payload: {
        name: project.name,
        description: project.description,
        status: newStatus,
      },
    });
  };

  const handleDeleteProject = (project: Project) => {
    deleteMutation.mutate(project.id);
  };

  if (!activeOrganization) {
    return (
      <EmptyState
        description="Select or create an organization from the workspace header to view projects."
        actionLabel="Go to Dashboard"
        onAction={() => undefined}
      />
    );
  }

  if (isProjectsLoading) return <LoadingSpinner />;

  // Table columns definition
  const columns: ColumnsType<Project> = [
    {
      title: 'PROJECT / CODE',
      key: 'project',
      render: (_, record) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div
            style={{
              width: 40,
              height: 40,
              borderRadius: 8,
              backgroundColor: '#e6f7ff',
              color: '#1890ff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 700,
              fontSize: 13,
            }}
          >
            P{record.id}
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Typography.Text strong style={{ fontSize: 14, color: '#262626' }}>
                {record.name}
              </Typography.Text>
              <Tag style={{ margin: 0, fontSize: 11, color: '#8c8c8c', backgroundColor: '#fafafa' }}>
                PRJ-{record.id}
              </Tag>
            </div>
            <Typography.Text
              type="secondary"
              ellipsis
              style={{ fontSize: 12, maxWidth: 300, display: 'block' }}
            >
              {record.description || 'No description provided'}
            </Typography.Text>
          </div>
        </div>
      ),
    },
    {
      title: 'STATUS',
      key: 'status',
      width: 150,
      render: (_, record) => {
        const st = record.status || 'IN_PROGRESS';
        if (st === 'COMPLETED') {
          return (
            <Tag
              icon={<CheckCircleOutlined />}
              color="success"
              style={{ borderRadius: 12, padding: '2px 10px', fontWeight: 500 }}
            >
              Completed
            </Tag>
          );
        }
        if (st === 'IN_REVIEW') {
          return (
            <Tag
              icon={<ClockCircleOutlined />}
              color="warning"
              style={{ borderRadius: 12, padding: '2px 10px', fontWeight: 500 }}
            >
              In Review
            </Tag>
          );
        }
        return (
          <Tag
            icon={<SyncOutlined spin />}
            color="processing"
            style={{ borderRadius: 12, padding: '2px 10px', fontWeight: 500 }}
          >
            In Progress
          </Tag>
        );
      },
    },
    {
      title: 'HEALTH / TIMELINE',
      key: 'health',
      width: 160,
      render: (_, record) => {
        const st = record.status || 'IN_PROGRESS';
        const isComplete = st === 'COMPLETED';
        const isReview = st === 'IN_REVIEW';
        return (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  backgroundColor: isComplete ? '#52c41a' : isReview ? '#fa8c16' : '#1890ff',
                  display: 'inline-block',
                }}
              />
              <Typography.Text strong style={{ fontSize: 13 }}>
                {isComplete ? 'Delivered' : isReview ? 'Quality Review' : 'On Track'}
              </Typography.Text>
            </div>
            <Typography.Text type="secondary" style={{ fontSize: 12 }}>
              {isComplete ? 'Archived sprint' : 'Active milestone'}
            </Typography.Text>
          </div>
        );
      },
    },
    {
      title: 'CONTRIBUTORS',
      key: 'members',
      width: 200,
      render: (_, record) => {
        const assigned = (record.memberIds ?? []).map((uid) => {
          const found = orgMembers.find((m) => m.userId === uid);
          return {
            userId: uid,
            name: found?.user?.name ?? `User #${uid}`,
          };
        });

        return (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Avatar.Group
              maxCount={3}
              maxStyle={{ color: '#f56a00', backgroundColor: '#fde3cf', fontSize: 11 }}
            >
              {assigned.length > 0 ? (
                assigned.map((m) => (
                  <Tooltip key={m.userId} title={m.name}>
                    <Avatar
                      size="small"
                      style={{ backgroundColor: '#1890ff', fontSize: 11 }}
                      icon={<UserOutlined />}
                    >
                      {m.name.charAt(0).toUpperCase()}
                    </Avatar>
                  </Tooltip>
                ))
              ) : (
                <Tooltip title="No contributors">
                  <Avatar size="small" icon={<UserOutlined />} style={{ backgroundColor: '#f0f0f0', color: '#bfbfbf' }} />
                </Tooltip>
              )}
            </Avatar.Group>

            <Button
              type="link"
              size="small"
              icon={<UsergroupAddOutlined />}
              onClick={() => setSelectedProjectIdForMembers(record.id)}
              style={{ fontSize: 12, padding: '0 4px' }}
            >
              Manage
            </Button>
          </div>
        );
      },
    },
    {
      title: 'VELOCITY / PROGRESS',
      key: 'progress',
      width: 180,
      render: (_, record) => {
        const st = record.status || 'IN_PROGRESS';
        const percent = progressByProjectId.get(record.id) ?? 0;
        return (
          <div style={{ width: '100%', maxWidth: 140 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 2 }}>
              <Typography.Text type="secondary" style={{ fontSize: 11 }}>
                Progress
              </Typography.Text>
              <Typography.Text strong style={{ fontSize: 11 }}>
                {percent}%
              </Typography.Text>
            </div>
            <Progress
              percent={percent}
              size="small"
              showInfo={false}
              strokeColor={st === 'COMPLETED' ? '#52c41a' : '#1890ff'}
            />
          </div>
        );
      },
    },
    {
      title: 'ACTIONS',
      key: 'actions',
      width: 100,
      align: 'right',
      render: (_, record) => {
        const currentSt = record.status || 'IN_PROGRESS';

        const actionMenuItems: MenuProps['items'] = [
          {
            key: 'manage-members',
            label: 'Manage Contributors',
            icon: <UsergroupAddOutlined />,
            onClick: () => setSelectedProjectIdForMembers(record.id),
          },
          {
            type: 'divider',
          },
          {
            key: 'status-group',
            label: 'Set Status',
            type: 'group',
            children: [
              {
                key: 'set-in-progress',
                label: 'In Progress',
                disabled: currentSt === 'IN_PROGRESS',
                onClick: () => handleUpdateStatus(record, 'IN_PROGRESS'),
              },
              {
                key: 'set-in-review',
                label: 'In Review',
                disabled: currentSt === 'IN_REVIEW',
                onClick: () => handleUpdateStatus(record, 'IN_REVIEW'),
              },
              {
                key: 'set-completed',
                label: 'Completed',
                disabled: currentSt === 'COMPLETED',
                onClick: () => handleUpdateStatus(record, 'COMPLETED'),
              },
            ],
          },
          {
            type: 'divider',
          },
          {
            key: 'delete',
            danger: true,
            label: 'Delete Project',
            icon: <DeleteOutlined />,
            onClick: () => handleDeleteProject(record),
          },
        ];

        return (
          <Space>
            <Dropdown menu={{ items: actionMenuItems }} trigger={['click']}>
              <Button type="text" shape="circle" icon={<MoreOutlined />} />
            </Dropdown>
          </Space>
        );
      },
    },
  ];

  return (
    <div style={{ maxWidth: 1400, margin: '0 auto' }}>
      {/* Top Header */}
      <PageHeader
        title="Projects"
        subtitle={`${activeOrganization.name} Production Portfolio`}
        actions={
          <Space size={12}>
            <Button icon={<DownloadOutlined />}>Portfolio Reports</Button>  {/* TODO: Portfolio Reports */}
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => setCreateModalOpen(true)}
              style={{ fontWeight: 500 }}
            >
              Create Project
            </Button>
          </Space>
        }
      />

      {/* KPI Stats Cards */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} lg={6}>
          <Card
            bordered={false}
            style={{
              borderRadius: 12,
              boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
              border: '1px solid #f0f0f0',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <Typography.Text
                  type="secondary"
                  style={{ fontSize: 12, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5 }}
                >
                  Tenant Projects
                </Typography.Text>
                <Typography.Title level={3} style={{ margin: '6px 0 2px 0', fontWeight: 700 }}>
                  {projects.length} Total
                </Typography.Title>
                <Tag color="blue" style={{ borderRadius: 10, margin: 0, fontSize: 11 }}>
                  +{tabCounts.IN_PROGRESS} in flight
                </Tag>
              </div>
              <div
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 10,
                  backgroundColor: '#e6f7ff',
                  color: '#1890ff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 20,
                }}
              >
                <FolderOpenOutlined />
              </div>
            </div>
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card
            bordered={false}
            style={{
              borderRadius: 12,
              boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
              border: '1px solid #f0f0f0',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <Typography.Text
                  type="secondary"
                  style={{ fontSize: 12, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5 }}
                >
                  Total Tasks Enqueued
                </Typography.Text>
                <Typography.Title level={3} style={{ margin: '6px 0 2px 0', fontWeight: 700 }}>
                  {orgTasks.length}
                </Typography.Title>
                <Tag color="purple" style={{ borderRadius: 10, margin: 0, fontSize: 11 }}>
                  94% target met
                </Tag>
              </div>
              <div
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 10,
                  backgroundColor: '#f9f0ff',
                  color: '#722ed1',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 20,
                }}
              >
                <CheckSquareOutlined />
              </div>
            </div>
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card
            bordered={false}
            style={{
              borderRadius: 12,
              boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
              border: '1px solid #f0f0f0',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <Typography.Text
                  type="secondary"
                  style={{ fontSize: 12, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5 }}
                >
                  Active Contributors
                </Typography.Text>
                <Typography.Title level={3} style={{ margin: '6px 0 2px 0', fontWeight: 700 }}>
                  {totalContributorsCount} Staff
                </Typography.Title>
                <Tag color="cyan" style={{ borderRadius: 10, margin: 0, fontSize: 11 }}>
                  Across projects
                </Tag>
              </div>
              <div
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 10,
                  backgroundColor: '#e6fffb',
                  color: '#13c2c2',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 20,
                }}
              >
                <TeamOutlined />
              </div>
            </div>
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card
            bordered={false}
            style={{
              borderRadius: 12,
              boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
              border: '1px solid #f0f0f0',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <Typography.Text
                  type="secondary"
                  style={{ fontSize: 12, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5 }}
                >
                  Portfolio Velocity
                </Typography.Text>
                <Typography.Title level={3} style={{ margin: '6px 0 2px 0', fontWeight: 700 }}>
                  {portfolioVelocity}%
                </Typography.Title>
                <Tag color="green" style={{ borderRadius: 10, margin: 0, fontSize: 11 }}>
                  +1.2% this sprint
                </Tag>
              </div>
              <div
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 10,
                  backgroundColor: '#f6ffed',
                  color: '#52c41a',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 20,
                }}
              >
                <ThunderboltOutlined />
              </div>
            </div>
          </Card>
        </Col>
      </Row>

      {/* Filter and Controls Toolbar */}
      <Card
        bordered={false}
        style={{
          borderRadius: 12,
          marginBottom: 16,
          boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
          border: '1px solid #f0f0f0',
        }}
        bodyStyle={{ padding: '16px 20px' }}
      >
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: 16,
          }}
        >
          {/* Status Tabs */}
          <Tabs
            activeKey={activeStatusTab}
            onChange={(key) => setActiveStatusTab(key)}
            style={{ marginBottom: -16 }}
            items={[
              { key: 'ALL', label: `All (${tabCounts.ALL})` },
              { key: 'IN_PROGRESS', label: `In Progress (${tabCounts.IN_PROGRESS})` },
              { key: 'IN_REVIEW', label: `In Review (${tabCounts.IN_REVIEW})` },
              { key: 'COMPLETED', label: `Completed (${tabCounts.COMPLETED})` },
            ]}
          />

          {/* Search, Contributor Filter, View Switcher */}
          <Space size={12} wrap>
            <Input
              prefix={<SearchOutlined style={{ color: '#8c8c8c' }} />}
              placeholder="Search projects by title, code..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              allowClear
              style={{ width: 260, borderRadius: 8 }}
            />

            <Select
              allowClear
              placeholder="Filter by Contributor"
              value={selectedMemberFilter}
              onChange={(val) => setSelectedMemberFilter(val ?? null)}
              style={{ width: 190 }}
              options={orgMembers.map((m) => ({
                label: m.user?.name || `User #${m.userId}`,
                value: m.userId,
              }))}
            />

            <Radio.Group
              value={viewMode}
              onChange={(e) => setViewMode(e.target.value)}
              optionType="button"
              buttonStyle="solid"
            >
              <Radio.Button value="table">
                <UnorderedListOutlined />
              </Radio.Button>
              <Radio.Button value="grid">
                <AppstoreOutlined />
              </Radio.Button>
            </Radio.Group>
          </Space>
        </div>
      </Card>

      {/* Main Content: Table or Grid */}
      {filteredProjects.length === 0 ? (
        <Card
          bordered={false}
          style={{
            borderRadius: 12,
            border: '1px solid #f0f0f0',
            textAlign: 'center',
            padding: '40px 0',
          }}
        >
          <EmptyState
            description={
              projects.length === 0
                ? 'No projects in this organization yet'
                : 'No projects match your active search and filter criteria'
            }
            actionLabel={projects.length === 0 ? 'Create First Project' : 'Clear Filters'}
            onAction={() => {
              if (projects.length === 0) {
                setCreateModalOpen(true);
              } else {
                setActiveStatusTab('ALL');
                setSearchQuery('');
                setSelectedMemberFilter(null);
              }
            }}
          />
        </Card>
      ) : viewMode === 'table' ? (
        <Card
          bordered={false}
          style={{
            borderRadius: 12,
            border: '1px solid #f0f0f0',
            boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
            overflow: 'hidden',
          }}
          bodyStyle={{ padding: 0 }}
        >
          <Table<Project>
            columns={columns}
            dataSource={filteredProjects}
            rowKey="id"
            pagination={{
              pageSize: 8,
              showSizeChanger: true,
              pageSizeOptions: ['8', '16', '24'],
            }}
          />
        </Card>
      ) : (
        <Row gutter={[16, 16]}>
          {filteredProjects.map((project) => (
            <Col xs={24} sm={12} lg={8} key={project.id}>
              <ProjectCard
                project={project}
                orgMembers={orgMembers}
                progressPercent={progressByProjectId.get(project.id) ?? 0}
                onManageMembers={(p) => setSelectedProjectIdForMembers(p.id)}
                onUpdateStatus={handleUpdateStatus}
                onDelete={handleDeleteProject}
              />
            </Col>
          ))}
        </Row>
      )}

      {/* Create Project Modal */}
      <CreateProjectModal open={createModalOpen} onClose={() => setCreateModalOpen(false)} />

      {/* Assign Members Modal */}
      <AssignProjectMemberModal
        project={selectedProject}
        open={!!selectedProject}
        onClose={() => setSelectedProjectIdForMembers(null)}
      />
    </div>
  );
}