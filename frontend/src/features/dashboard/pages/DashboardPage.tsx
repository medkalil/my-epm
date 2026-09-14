import { Card, Col, Row, Statistic, Typography, List, Space } from 'antd';
import {
  ProjectOutlined,
  CheckSquareOutlined,
  TeamOutlined,
  TrophyOutlined,
  ArrowRightOutlined,
} from '@ant-design/icons';
import { Link } from 'react-router-dom';
import { useDashboardStats } from '../api/dashboard.queries';
import { useOrganizationOverview } from '../api/useOrganizationOverview';
import { LoginRequired } from '@/layouts/components/LoginRequired';
import { useAuthStore } from '@/stores/authStore';
import { ROUTES } from '@/routes/paths';
import { StatusTag } from '@/components/ui/StatusTags';
import { EmptyState } from '@/components/ui/EmptyState';

function StatCard({
  title,
  value,
  icon,
  color,
  loading,
}: {
  title: string;
  value: number;
  icon: React.ReactNode;
  color: string;
  loading: boolean;
}) {
  return (
    <Card loading={loading}>
      <Statistic
        title={title}
        value={value}
        prefix={<span style={{ color }}>{icon}</span>}
      />
    </Card>
  );
}

export default function DashboardPage() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  if (!isAuthenticated) return <LoginRequired />;

  return <DashboardContent />;
}

function DashboardContent() {
  const { projects, tasks, isLoading } = useDashboardStats();
  const { 
    myOrgsQuery 
    // usersQuery 
  } = useOrganizationOverview();

  const completedTasks = tasks?.content.filter((t) => t.status === 'DONE').length ?? 0;
  const orgCount = myOrgsQuery.data?.totalElements ?? 0;
  // const memberCount = usersQuery.data?.totalElements ?? 0;

  const recentProjects = projects?.content ?? [];
  const recentTasks = tasks?.content ?? [];

  return (
    <div>
      <Typography.Title level={3}>Dashboard</Typography.Title>

      <Row gutter={[16, 16]}>
        <Col xs={12} lg={6}>
          <StatCard
            title="Organizations"
            value={orgCount}
            icon={<TeamOutlined />}
            color="#4f46e5"
            loading={isLoading}
          />
        </Col>
        <Col xs={12} lg={6}>
          <StatCard
            title="Projects"
            value={recentProjects.length}
            icon={<ProjectOutlined />}
            color="#3b82f6"
            loading={isLoading}
          />
        </Col>
        <Col xs={12} lg={6}>
          <StatCard
            title="Tasks"
            value={recentTasks.length}
            icon={<CheckSquareOutlined />}
            color="#f59e0b"
            loading={isLoading}
          />
        </Col>
        <Col xs={12} lg={6}>
          <StatCard
            title="Completed"
            value={completedTasks}
            icon={<TrophyOutlined />}
            color="#10b981"
            loading={isLoading}
          />
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col xs={24} lg={12}>
          <Card
            title="Recent Projects"
            extra={
              <Link to={ROUTES.projects.base}>
                View all <ArrowRightOutlined />
              </Link>
            }
          >
            {recentProjects.length === 0 ? (
              <EmptyState description="No projects yet" />
            ) : (
              <List
                dataSource={recentProjects}
                renderItem={(project) => (
                  <List.Item key={project.id}>
                    <List.Item.Meta
                      title={
                        <Link to={ROUTES.projects.detail(project.id)}>{project.name}</Link>
                      }
                      description={project.description}
                    />
                  </List.Item>
                )}
              />
            )}
          </Card>
        </Col>

        <Col xs={24} lg={12}>
          <Card
            title="Recent Tasks"
            extra={
              <Link to={ROUTES.tasks.base}>
                View all <ArrowRightOutlined />
              </Link>
            }
          >
            {recentTasks.length === 0 ? (
              <EmptyState description="No tasks yet" />
            ) : (
              <List
                dataSource={recentTasks}
                renderItem={(task) => (
                  <List.Item key={task.id}>
                    <List.Item.Meta
                      title={
                        <Space>
                          <Link to={ROUTES.tasks.detail(task.id)}>{task.title}</Link>
                          <StatusTag status={task.status} />
                        </Space>
                      }
                      description={task.description || 'No description'}
                    />
                  </List.Item>
                )}
              />
            )}
          </Card>
        </Col>
      </Row>
    </div>
  );
}