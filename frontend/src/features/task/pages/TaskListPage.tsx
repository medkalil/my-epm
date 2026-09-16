import { Button, Card, Tabs, Typography, Row, Col, Segmented } from 'antd';
import { PlusOutlined, UnorderedListOutlined, ProjectOutlined } from '@ant-design/icons';
import { useState } from 'react';
import { PageHeader } from '@/components/ui/PageHeader';
import { TaskCard } from '../components/TaskCard';
import { CreateTaskModal } from '../components/CreateTaskModal';
import { useTasksByOrganization } from '../api/task.queries';
import { useOrgStore } from '@/stores/orgStore';
import { EmptyState } from '@/components/ui/EmptyState';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { TaskStatus } from '@/types/common';
import type { Task } from '../types/task.types';

const STATUS_TABS: Array<{ key: string; label: string; value?: TaskStatus }> = [
  { key: 'all', label: 'All Tasks' },
  { key: 'TODO', label: 'To Do', value: TaskStatus.TODO },
  { key: 'IN_PROGRESS', label: 'In Progress', value: TaskStatus.IN_PROGRESS },
  { key: 'IN_REVIEW', label: 'In Review', value: TaskStatus.IN_REVIEW },
  { key: 'DONE', label: 'Done', value: TaskStatus.DONE },
];

export default function TaskListPage() {
  const [modalOpen, setModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('all');
  const [viewMode, setViewMode] = useState<'list' | 'board'>('list');
  const activeOrganization = useOrgStore((state) => state.activeOrganization);
  const { data, isLoading } = useTasksByOrganization();

  if (!activeOrganization) {
    return (
      <EmptyState
        description="Select an organization from the header to view tasks"
        actionLabel="Create organization"
        onAction={() => undefined}
      />
    );
  }

  if (isLoading) return <LoadingSpinner />;

  const allTasks = data ?? [];
  const tasks =
    activeTab === 'all'
      ? allTasks
      : allTasks.filter((t: Task) => t.status === activeTab);

  const tasksByStatus = (status: TaskStatus) =>
    allTasks.filter((t: Task) => t.status === status);

  return (
    <div>
      <PageHeader
        title="Tasks"
        subtitle={`${activeOrganization.name} · ${allTasks.length} total`}
        actions={
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => setModalOpen(true)}
          >
            New task
          </Button>
        }
      />

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          items={STATUS_TABS.map((tab) => ({
            key: tab.key,
            label: `${tab.label} ${
              tab.key === 'all' ? allTasks.length : tasksByStatus(tab.value!).length
            }`,
          }))}
        />
        <Segmented
          value={viewMode}
          onChange={(v) => setViewMode(v as 'list' | 'board')}
          options={[
            { value: 'list', icon: <UnorderedListOutlined /> },
            { value: 'board', icon: <ProjectOutlined /> },
          ]}
        />
      </div>

      {viewMode === 'board' ? (
        <Row gutter={[16, 16]}>
          {STATUS_TABS.filter((t) => t.value).map((tab) => (
            <Col xs={24} sm={12} lg={6} key={tab.key}>
              <Card
                title={
                  <span>
                    {tab.label}{' '}
                    <Typography.Text type="secondary">
                      ({tasksByStatus(tab.value!).length})
                    </Typography.Text>
                  </span>
                }
                size="small"
                bodyStyle={{ padding: 8 }}
              >
                {tasksByStatus(tab.value!).map((task) => (
                  <TaskCard key={task.id} task={task} />
                ))}
                {tasksByStatus(tab.value!).length === 0 && (
                  <Typography.Text type="secondary" style={{ display: 'block', textAlign: 'center', padding: 16 }}>
                    No tasks
                  </Typography.Text>
                )}
              </Card>
            </Col>
          ))}
        </Row>
      ) : (
        <Row gutter={[16, 16]}>
          {tasks.map((task) => (
            <Col xs={24} sm={12} lg={8} key={task.id}>
              <TaskCard task={task} />
            </Col>
          ))}
        </Row>
      )}

      {tasks.length === 0 && viewMode === 'list' && (
        <EmptyState
          description={activeTab === 'all' ? 'No tasks yet' : `No tasks in this status`}
          actionLabel="Create your first task"
          onAction={() => setModalOpen(true)}
        />
      )}

      <CreateTaskModal open={modalOpen} onClose={() => setModalOpen(false)} />
    </div>
  );
}