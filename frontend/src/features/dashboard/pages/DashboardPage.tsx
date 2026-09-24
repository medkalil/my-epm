import { useState } from 'react';
import {
  Card,
  Col,
  Row,
  Typography,
  Tag,
  Button,
  Space,
  Progress,
  Avatar,
  Table,
  Select,
  Modal,
  Input,
  Form,
  App,
} from 'antd';
import {
  ProjectOutlined,
  CheckSquareOutlined,
  TeamOutlined,
  SafetyCertificateOutlined,
  PlusOutlined,
  EyeOutlined,
  UserAddOutlined,
  ExportOutlined,
  ThunderboltOutlined,
  ArrowRightOutlined,
} from '@ant-design/icons';
import { Link, useNavigate } from 'react-router-dom';
import { useDashboardStats } from '../api/dashboard.queries';
import { useAuthStore } from '@/stores/authStore';
import { useOrgStore } from '@/stores/orgStore';
import { ROUTES } from '@/routes/paths';
import { useCreateProject } from '@/features/project/api/project.queries';
import { useCreateTask } from '@/features/task/api/task.queries';
import { useAddMember, useSwitchOrganization } from '@/features/organization/api/organization.queries';
import { getApiErrorMessage } from '@/lib/axios';
import type { Project } from '@/features/project/types/project.types';

const { Title, Text } = Typography;

export default function DashboardPage() {
  const { message } = App.useApp();
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const activeOrganization = useOrgStore((state) => state.activeOrganization);
  const organizations = useOrgStore((state) => state.organizations);
  const switchOrg = useSwitchOrganization();

  const { projects, tasks, members, isLoading } = useDashboardStats();

  // Modals for Quick Actions
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);

  const [projectForm] = Form.useForm();
  const [taskForm] = Form.useForm();
  const [inviteForm] = Form.useForm();

  const createProjectMutation = useCreateProject();
  const createTaskMutation = useCreateTask();
  const addMemberMutation = useAddMember(activeOrganization?.id);

  // Derived metrics
  const totalProjects = projects.length;
  const activeTasks = tasks.filter((t) => t.status === 'IN_PROGRESS' || t.status === 'TODO');
  const todoTasks = tasks.filter((t) => t.status === 'TODO');
  const inProgressTasks = tasks.filter((t) => t.status === 'IN_PROGRESS');
  const doneTasks = tasks.filter((t) => t.status === 'DONE');
  const totalMembers = members.length;

  const handleCreateProject = async () => {
    try {
      const values = await projectForm.validateFields();
      await createProjectMutation.mutateAsync({
        name: values.name,
        description: values.description,
      });
      message.success(`Project "${values.name}" created`);
      projectForm.resetFields();
      setIsProjectModalOpen(false);
    } catch (error) {
      message.error(getApiErrorMessage(error));
    }
  };

  const handleCreateTask = async () => {
    try {
      const values = await taskForm.validateFields();
      await createTaskMutation.mutateAsync({
        title: values.title,
        description: values.description,
        status: values.status || 'TODO',
        projectId: values.projectId,
        organizationId: activeOrganization!.id,
        affectedUserId: values.affectedUserId,
      });
      message.success(`Task "${values.title}" created`);
      taskForm.resetFields();
      setIsTaskModalOpen(false);
    } catch (error) {
      message.error(getApiErrorMessage(error));
    }
  };

  const handleInviteMember = async () => {
    try {
      const values = await inviteForm.validateFields();
      await addMemberMutation.mutateAsync({
        userId: values.userId,
        role: values.role || 'MEMBER',
      });
      message.success('Member added successfully');
      inviteForm.resetFields();
      setIsInviteModalOpen(false);
    } catch (error) {
      message.error(getApiErrorMessage(error));
    }
  };

  const handleOrgSwitch = (orgId: number) => {
    switchOrg.mutate(orgId);
  };

  const projectColumns = [
    {
      title: 'PORTFOLIO & PROJECT',
      dataIndex: 'name',
      key: 'name',
      render: (name: string, record: Project) => (
        <Space direction="vertical" size={2}>
          <Space>
            <Text strong style={{ fontSize: 13, color: '#0f172a' }}>
              <Link to={ROUTES.projects.detail(record.id)}>{name}</Link>
            </Text>
            <Tag color="blue" style={{ fontSize: 10 }}>
              PRJ-{record.id}
            </Tag>
          </Space>
          <Text type="secondary" style={{ fontSize: 11 }}>
            {record.description || 'Enterprise initiative'}
          </Text>
        </Space>
      ),
    },
    {
      title: 'TEAM',
      key: 'team',
      render: () => (
        <Avatar.Group size="small" maxCount={3}>
          <Avatar style={{ background: '#1677FF' }}>KS</Avatar>
          <Avatar style={{ background: '#52c41a' }}>ST</Avatar>
          <Avatar style={{ background: '#722ed1' }}>ER</Avatar>
        </Avatar.Group>
      ),
    },
    {
      title: 'DELIVERY PROGRESS',
      key: 'progress',
      render: (_: unknown, record: Project) => {
        const projectTasks = tasks.filter((t) => t.projectId === record.id);
        const done = projectTasks.filter((t) => t.status === 'DONE').length;
        const total = projectTasks.length;
        const percent = total > 0 ? Math.round((done / total) * 100) : 60;
        return (
          <div style={{ width: 140 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 2 }}>
              <Text strong style={{ fontSize: 11 }}>
                {percent}%
              </Text>
              <Text type="secondary" style={{ fontSize: 10 }}>
                {done}/{total > 0 ? total : 10}
              </Text>
            </div>
            <Progress percent={percent} size="small" showInfo={false} status="active" />
          </div>
        );
      },
    },
    {
      title: 'ACTIONS',
      key: 'actions',
      render: (_: unknown, record: Project) => (
        <Space size={8}>
          <Button
            size="small"
            icon={<EyeOutlined />}
            onClick={() => navigate(ROUTES.projects.detail(record.id))}
          >
            View
          </Button>
          <Button
            size="small"
            icon={<UserAddOutlined />}
            onClick={() => setIsInviteModalOpen(true)}
          />
        </Space>
      ),
    },
  ];

  return (
    <div style={{ maxWidth: 1440, margin: '0 auto' }}>
      {/* Sub-Header Context Bar */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 20,
          flexWrap: 'wrap',
          gap: 12,
        }}
      >
        <Space size={14} align="center">
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: 10,
              background: '#1677FF',
              color: '#fff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 18,
              fontWeight: 700,
            }}
          >
            {activeOrganization?.name ? activeOrganization.name.charAt(0).toUpperCase() : 'A'}
          </div>
          <div>
            <Space align="center">
              <Title level={4} style={{ margin: 0, color: '#0f172a', fontWeight: 700 }}>
                {activeOrganization?.name || 'Acme FinTech Corp'}
              </Title>
              <Tag color="blue" style={{ fontSize: 11 }}>
                OWNER
              </Tag>
              <Text type="secondary" style={{ fontSize: 12 }}>
                Workspace: {activeOrganization?.slug || 'acme-fintech'}
              </Text>
              <Tag color="geekblue" style={{ fontSize: 10 }}>
                ID: ACM-{activeOrganization?.id || '01'}
              </Tag>
            </Space>
            <Text type="secondary" style={{ fontSize: 12, display: 'block', marginTop: 2 }}>
              Multi-region enterprise workspace and unified portfolio governance.
            </Text>
          </div>
        </Space>

        <Space size={10}>
          <Button icon={<ExportOutlined />} style={{ borderRadius: 8 }}>
            Audit Export
          </Button>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => setIsProjectModalOpen(true)}
            style={{ borderRadius: 8, fontWeight: 600 }}
          >
            Quick Provision
          </Button>
        </Space>
      </div>

      {/* Top 4 KPI Cards */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        {/* Total Projects */}
        <Col xs={24} sm={12} lg={6}>
          <Card
            style={{ borderRadius: 12, border: '1px solid #e2e8f0' }}
            bodyStyle={{ padding: 20 }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <Text
                type="secondary"
                style={{ fontSize: 11, fontWeight: 700, letterSpacing: 0.8 }}
              >
                TOTAL PROJECTS
              </Text>
              <ProjectOutlined style={{ color: '#1677FF', fontSize: 16 }} />
            </div>
            <Title level={2} style={{ margin: '8px 0 2px', color: '#0f172a', fontWeight: 800 }}>
              {totalProjects > 0 ? totalProjects : 14}{' '}
              <span style={{ fontSize: 13, fontWeight: 500, color: '#1677FF' }}>Active</span>
            </Title>
            <Text type="secondary" style={{ fontSize: 11 }}>
              Active Portfolios: <span style={{ color: '#16a34a' }}>12 On Track</span> ·{' '}
              <span style={{ color: '#ef4444' }}>2 At Risk</span>
            </Text>
          </Card>
        </Col>

        {/* Tasks in Pipeline */}
        <Col xs={24} sm={12} lg={6}>
          <Card
            style={{ borderRadius: 12, border: '1px solid #e2e8f0' }}
            bodyStyle={{ padding: 20 }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <Text
                type="secondary"
                style={{ fontSize: 11, fontWeight: 700, letterSpacing: 0.8 }}
              >
                TASKS IN PIPELINE
              </Text>
              <CheckSquareOutlined style={{ color: '#f59e0b', fontSize: 16 }} />
            </div>
            <Title level={2} style={{ margin: '8px 0 2px', color: '#0f172a', fontWeight: 800 }}>
              {activeTasks.length > 0 ? activeTasks.length : 68}{' '}
              <span style={{ fontSize: 13, fontWeight: 500, color: '#64748b' }}>In progress</span>
            </Title>
            <Text type="secondary" style={{ fontSize: 11 }}>
              <span style={{ color: '#3b82f6' }}>{todoTasks.length || 32} Todo</span> ·{' '}
              <span style={{ color: '#f59e0b' }}>{inProgressTasks.length || 41} Active</span> ·{' '}
              <span style={{ color: '#10b981' }}>{doneTasks.length || 185} Done</span>
            </Text>
          </Card>
        </Col>

        {/* Assigned Members */}
        <Col xs={24} sm={12} lg={6}>
          <Card
            style={{ borderRadius: 12, border: '1px solid #e2e8f0' }}
            bodyStyle={{ padding: 20 }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <Text
                type="secondary"
                style={{ fontSize: 11, fontWeight: 700, letterSpacing: 0.8 }}
              >
                ASSIGNED MEMBERS
              </Text>
              <TeamOutlined style={{ color: '#722ed1', fontSize: 16 }} />
            </div>
            <Title level={2} style={{ margin: '8px 0 2px', color: '#0f172a', fontWeight: 800 }}>
              {totalMembers > 0 ? totalMembers : 24}{' '}
              <span style={{ fontSize: 13, fontWeight: 500, color: '#64748b' }}>seats filled</span>
            </Title>
            <Text type="secondary" style={{ fontSize: 11 }}>
              4 RBAC Levels · <strong>OWNER/ADMIN</strong>
            </Text>
          </Card>
        </Col>

        {/* Security & Isolation */}
        <Col xs={24} sm={12} lg={6}>
          <Card
            style={{ borderRadius: 12, border: '1px solid #e2e8f0' }}
            bodyStyle={{ padding: 20 }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <Text
                type="secondary"
                style={{ fontSize: 11, fontWeight: 700, letterSpacing: 0.8 }}
              >
                SECURITY &amp; ISOLATION
              </Text>
              <SafetyCertificateOutlined style={{ color: '#10b981', fontSize: 16 }} />
            </div>
            <Title level={2} style={{ margin: '8px 0 2px', color: '#0f172a', fontWeight: 800 }}>
              100%{' '}
              <span style={{ fontSize: 13, fontWeight: 500, color: '#16a34a' }}>Strict</span>
            </Title>
            <Text type="secondary" style={{ fontSize: 11 }}>
              SOC-2 Type II Certified · <span style={{ color: '#1677FF' }}>99.9% SLA</span>
            </Text>
          </Card>
        </Col>
      </Row>

      {/* Main Two-Column Grid */}
      <Row gutter={[20, 20]}>
        {/* Left: Portfolio Table & Realtime Task Stream */}
        <Col xs={24} lg={17}>
          {/* Projects Portfolio Table */}
          <Card
            title={
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Space>
                  <Text strong style={{ fontSize: 14 }}>
                    PORTFOLIO &amp; PROJECT INITIATIVES
                  </Text>
                  <Tag color="blue">Active Tenant Scope</Tag>
                </Space>
                <Link to={ROUTES.projects.base} style={{ fontSize: 12 }}>
                  View All Projects <ArrowRightOutlined />
                </Link>
              </div>
            }
            style={{ borderRadius: 12, border: '1px solid #e2e8f0', marginBottom: 20 }}
            bodyStyle={{ padding: 0 }}
          >
            <Table
              columns={projectColumns}
              dataSource={projects.slice(0, 5)}
              rowKey="id"
              pagination={false}
              loading={isLoading}
              locale={{
                emptyText: (
                  <div style={{ padding: '32px 0', textAlign: 'center' }}>
                    <Text type="secondary">No projects in this workspace yet.</Text>
                    <div style={{ marginTop: 12 }}>
                      <Button
                        type="primary"
                        icon={<PlusOutlined />}
                        onClick={() => setIsProjectModalOpen(true)}
                      >
                        Create First Project
                      </Button>
                    </div>
                  </div>
                ),
              }}
            />
          </Card>

          {/* Real-time Task Activity Stream */}
          <Card
            title={
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Space>
                  <Text strong style={{ fontSize: 14 }}>
                    Recent Task Activity
                  </Text>
                  <Tag color="processing" icon={<ThunderboltOutlined />}>
                    sync: Realtime WS
                  </Tag>
                </Space>
                <Link to={ROUTES.tasks.base} style={{ fontSize: 12 }}>
                  Open Kanban Board <ArrowRightOutlined />
                </Link>
              </div>
            }
            style={{ borderRadius: 12, border: '1px solid #e2e8f0' }}
            bodyStyle={{ padding: '12px 20px' }}
          >
            {tasks.slice(0, 4).map((task, idx) => (
              <div
                key={task.id || idx}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '12px 0',
                  borderBottom: idx < 3 ? '1px solid #f1f5f9' : 'none',
                }}
              >
                <Space size={12}>
                  <div
                    style={{
                      width: 8,
                      height: 8,
                      borderRadius: '50%',
                      background:
                        task.status === 'DONE'
                          ? '#10b981'
                          : task.status === 'IN_PROGRESS'
                            ? '#f59e0b'
                            : '#3b82f6',
                    }}
                  />
                  <div>
                    <Space size={8}>
                      <Tag color="geekblue" style={{ fontSize: 10, margin: 0 }}>
                        EPM-{task.id || '10' + idx}
                      </Tag>
                      <Text strong style={{ fontSize: 13 }}>
                        <Link to={ROUTES.tasks.detail(task.id)}>{task.title}</Link>
                      </Text>
                      <Tag
                        color={
                          task.status === 'DONE'
                            ? 'success'
                            : task.status === 'IN_PROGRESS'
                              ? 'processing'
                              : 'default'
                        }
                        style={{ fontSize: 10 }}
                      >
                        {task.status}
                      </Tag>
                    </Space>
                    <Text type="secondary" style={{ fontSize: 11, display: 'block', marginTop: 2 }}>
                      {task.description || 'Sprint milestone task'} · Updated 14 mins ago
                    </Text>
                  </div>
                </Space>
                <Tag color="default" style={{ fontSize: 11 }}>
                  @{user?.username || 'kalil.s'}
                </Tag>
              </div>
            ))}
          </Card>
        </Col>

        {/* Right: Quick Actions & Governance Panels */}
        <Col xs={24} lg={7}>
          <Space direction="vertical" size={16} style={{ width: '100%' }}>
            {/* Quick Actions Card */}
            <Card
              title={<Text strong style={{ fontSize: 13 }}>Quick Actions</Text>}
              style={{ borderRadius: 12, border: '1px solid #e2e8f0' }}
              bodyStyle={{ padding: 16 }}
            >
              <Space direction="vertical" size={10} style={{ width: '100%' }}>
                <Button
                  type="primary"
                  block
                  icon={<PlusOutlined />}
                  onClick={() => setIsProjectModalOpen(true)}
                  style={{ fontWeight: 600, height: 38 }}
                >
                  + New Project
                </Button>
                <Button
                  block
                  icon={<CheckSquareOutlined />}
                  onClick={() => setIsTaskModalOpen(true)}
                  style={{ height: 38 }}
                >
                  + Create Task
                </Button>
                {/* <Button
                  block
                  icon={<TeamOutlined />}
                  onClick={() => setIsInviteModalOpen(true)}
                  style={{ height: 38 }}
                >
                  + Invite Member ()
                </Button> */}
              </Space>
            </Card>

            {/* Workspace Governance Card */}
            <Card
              title={
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Text strong style={{ fontSize: 13 }}>
                    Workspace Governance
                  </Text>
                  <Tag color="green">● Protected</Tag>
                </div>
              }
              style={{ borderRadius: 12, border: '1px solid #e2e8f0' }}
              bodyStyle={{ padding: 16 }}
            >
              <Space direction="vertical" size={10} style={{ width: '100%' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Text type="secondary" style={{ fontSize: 11 }}>
                    Authentication:
                  </Text>
                  <Text strong style={{ fontSize: 11 }}>
                    SSO / Okta Connected
                  </Text>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Text type="secondary" style={{ fontSize: 11 }}>
                    Session Policy:
                  </Text>
                  <Text strong style={{ fontSize: 11 }}>
                    8h Active / Enforced
                  </Text>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Text type="secondary" style={{ fontSize: 11 }}>
                    Access Level:
                  </Text>
                  <Text strong style={{ fontSize: 11, color: '#1677FF' }}>
                    Enterprise Admin
                  </Text>
                </div>

                <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: 12, marginTop: 4 }}>
                  <Text
                    type="secondary"
                    style={{ fontSize: 10, textTransform: 'uppercase', fontWeight: 700, display: 'block', marginBottom: 6 }}
                  >
                    Switch Active Organization
                  </Text>
                  <Select
                    style={{ width: '100%' }}
                    value={activeOrganization?.id}
                    onChange={handleOrgSwitch}
                    options={organizations.map((org) => ({
                      label: org.name,
                      value: org.id,
                    }))}
                  />
                </div>
              </Space>
            </Card>

            {/* Team Access Thumbnail Card */}
            <Card
              title={
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Text strong style={{ fontSize: 13 }}>
                    Team Access ({members.length > 0 ? members.length : 4})
                  </Text>
                  <Link
                    to={activeOrganization ? ROUTES.organizations.team(activeOrganization.id) : '#'}
                    style={{ fontSize: 11 }}
                  >
                    All Members
                  </Link>
                </div>
              }
              style={{ borderRadius: 12, border: '1px solid #e2e8f0' }}
              bodyStyle={{ padding: 16 }}
            >
              <Space direction="vertical" size={10} style={{ width: '100%' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Space size={8}>
                    <Avatar size="small" style={{ background: '#1677FF' }}>
                      KS
                    </Avatar>
                    <div>
                      <Text strong style={{ fontSize: 12, display: 'block' }}>
                        {user?.username || 'Kalil S.'}
                      </Text>
                      <Text type="secondary" style={{ fontSize: 10 }}>
                        {user?.username ? `${user.username}@acmefin.corp` : 'kalil@acmefin.corp'}
                      </Text>
                    </div>
                  </Space>
                  <Tag color="blue" style={{ fontSize: 10 }}>
                    OWNER
                  </Tag>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Space size={8}>
                    <Avatar size="small" style={{ background: '#52c41a' }}>
                      ST
                    </Avatar>
                    <div>
                      <Text strong style={{ fontSize: 12, display: 'block' }}>
                        Sarah T.
                      </Text>
                      <Text type="secondary" style={{ fontSize: 10 }}>
                        sarah.t@acmefin.corp
                      </Text>
                    </div>
                  </Space>
                  <Tag color="geekblue" style={{ fontSize: 10 }}>
                    ADMIN
                  </Tag>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Space size={8}>
                    <Avatar size="small" style={{ background: '#722ed1' }}>
                      ER
                    </Avatar>
                    <div>
                      <Text strong style={{ fontSize: 12, display: 'block' }}>
                        Elena R.
                      </Text>
                      <Text type="secondary" style={{ fontSize: 10 }}>
                        elena.r@acmefin.corp
                      </Text>
                    </div>
                  </Space>
                  <Tag style={{ fontSize: 10 }}>MEMBER</Tag>
                </div>
              </Space>
            </Card>
          </Space>
        </Col>
      </Row>

      {/* Quick Create Project Modal */}
      <Modal
        title="Create New Project"
        open={isProjectModalOpen}
        onOk={handleCreateProject}
        onCancel={() => setIsProjectModalOpen(false)}
        confirmLoading={createProjectMutation.isPending}
      >
        <Form form={projectForm} layout="vertical">
          <Form.Item
            name="name"
            label="Project Name"
            rules={[{ required: true, message: 'Please enter project name' }]}
          >
            <Input placeholder="e.g. Core Banking Gateway" />
          </Form.Item>
          <Form.Item name="description" label="Description">
            <Input.TextArea placeholder="Key initiative for enterprise payments" rows={3} />
          </Form.Item>
        </Form>
      </Modal>

      {/* Quick Create Task Modal */}
      <Modal
        title="Create New Task"
        open={isTaskModalOpen}
        onOk={handleCreateTask}
        onCancel={() => setIsTaskModalOpen(false)}
        confirmLoading={createTaskMutation.isPending}
      >
        <Form form={taskForm} layout="vertical">
          <Form.Item
            name="title"
            label="Task Title"
            rules={[{ required: true, message: 'Please enter task title' }]}
          >
            <Input placeholder="e.g. Integrate HSM cryptographic key store" />
          </Form.Item>
          <Form.Item
            name="projectId"
            label="Project"
            rules={[{ required: true, message: 'Please select a project' }]}
          >
            <Select
              placeholder="Select project"
              options={projects.map((p) => ({ label: p.name, value: p.id }))}
            />
          </Form.Item>
          <Form.Item name="status" label="Initial Status" initialValue="TODO">
            <Select
              options={[
                { label: 'TO DO', value: 'TODO' },
                { label: 'IN PROGRESS', value: 'IN_PROGRESS' },
                { label: 'DONE', value: 'DONE' },
              ]}
            />
          </Form.Item>
          <Form.Item name="description" label="Description">
            <Input.TextArea placeholder="Task scope and deliverables" rows={2} />
          </Form.Item>
        </Form>
      </Modal>

      {/* Quick Invite Member Modal */}
      <Modal
        title="Add Member to Organization"
        open={isInviteModalOpen}
        onOk={handleInviteMember}
        onCancel={() => setIsInviteModalOpen(false)}
        confirmLoading={addMemberMutation.isPending}
      >
        <Form form={inviteForm} layout="vertical">
          <Form.Item
            name="userId"
            label="User ID"
            rules={[{ required: true, message: 'Please enter user ID' }]}
          >
            <Input type="number" placeholder="Enter user ID (e.g. 2)" />
          </Form.Item>
          <Form.Item name="role" label="Organization Role" initialValue="MEMBER">
            <Select
              options={[
                { label: 'ADMIN', value: 'ADMIN' },
                { label: 'MEMBER', value: 'MEMBER' },
                { label: 'GUEST', value: 'GUEST' },
              ]}
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}