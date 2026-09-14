import { useParams } from 'react-router-dom';
import { Card, Descriptions, Typography, Select, Tag } from 'antd';
import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { PageHeader } from '@/components/ui/PageHeader';
import { useTask, useUpdateTask, useDeleteTask } from '../api/task.queries';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { ROUTES } from '@/routes/paths';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { StatusTag, PriorityTag } from '@/components/ui/StatusTags';
import { TaskStatus, TaskPriority } from '@/types/common';

const STATUS_OPTIONS = [
  { label: 'To Do', value: TaskStatus.TODO },
  { label: 'In Progress', value: TaskStatus.IN_PROGRESS },
  { label: 'In Review', value: TaskStatus.IN_REVIEW },
  { label: 'Done', value: TaskStatus.DONE },
];

const PRIORITY_OPTIONS = [
  { label: 'Low', value: TaskPriority.LOW },
  { label: 'Medium', value: TaskPriority.MEDIUM },
  { label: 'High', value: TaskPriority.HIGH },
  { label: 'Urgent', value: TaskPriority.URGENT },
];

export default function TaskDetailPage() {
  const { id } = useParams<{ id: string }>();
  const taskId = Number(id);
  const navigate = useNavigate();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const updateMutation = useUpdateTask();
  const deleteMutation = useDeleteTask();

  const { data: task, isLoading } = useTask(taskId);

  if (isLoading) return <LoadingSpinner />;
  if (!task) return null;

  const handleStatusChange = async (status: TaskStatus) => {
    await updateMutation.mutateAsync({ id: taskId, payload: { status } });
  };

  const handlePriorityChange = async (priority: TaskPriority) => {
    await updateMutation.mutateAsync({ id: taskId, payload: { priority } });
  };

  return (
    <div>
      <PageHeader
        title={task.title}
        subtitle={
          <span>
            {task.status && <StatusTag status={task.status} />}
            {task.priority && <span style={{ marginLeft: 8 }}><PriorityTag priority={task.priority} /></span>}
          </span>
        }
        actions={
          <Link to={ROUTES.tasks.base}>← Back to tasks</Link>
        }
      />

      <Card title="Details">
        <Descriptions column={2} bordered>
          <Descriptions.Item label="Title">{task.title}</Descriptions.Item>
          <Descriptions.Item label="Status">
            <Select
              value={task.status}
              options={STATUS_OPTIONS}
              onChange={handleStatusChange}
              style={{ width: 150 }}
              loading={updateMutation.isPending}
            />
          </Descriptions.Item>
          <Descriptions.Item label="Priority">
            <Select
              value={task.priority}
              options={PRIORITY_OPTIONS}
              onChange={handlePriorityChange}
              style={{ width: 150 }}
              allowClear
              placeholder="Not set"
              loading={updateMutation.isPending}
            />
          </Descriptions.Item>
          <Descriptions.Item label="Project">
            {task.project ? (
              <Link to={ROUTES.projects.detail(task.projectId)}>
                <Tag color="blue">{task.project.name}</Tag>
              </Link>
            ) : (
              '—'
            )}
          </Descriptions.Item>
          <Descriptions.Item label="Description" span={2}>
            {task.description || 'No description provided'}
          </Descriptions.Item>
          <Descriptions.Item label="Created">
            {new Date(task.createdAt).toLocaleString()}
          </Descriptions.Item>
          <Descriptions.Item label="Last updated">
            {new Date(task.updatedAt).toLocaleString()}
          </Descriptions.Item>
        </Descriptions>
      </Card>

      <Typography.Text
        type="danger"
        style={{ cursor: 'pointer', marginTop: 16, display: 'inline-block' }}
        onClick={() => setConfirmOpen(true)}
      >
        Delete this task
      </Typography.Text>

      <ConfirmDialog
        open={confirmOpen}
        title={`Delete task "${task.title}"?`}
        content="This action cannot be undone."
        okText="Delete task"
        onConfirm={async () => {
          await deleteMutation.mutateAsync(taskId);
          navigate(ROUTES.tasks.base);
        }}
        onCancel={() => setConfirmOpen(false)}
      />
    </div>
  );
}