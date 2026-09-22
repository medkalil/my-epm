import { Button, Tabs, Segmented } from 'antd';
import { PlusOutlined, UnorderedListOutlined, ProjectOutlined } from '@ant-design/icons';
import { useMemo, useState } from 'react';
import { PageHeader } from '@/components/ui/PageHeader';
import { useTasksByOrganization } from '../api/task.queries';
import { useDeleteTask } from '../api/task.queries';
import { useOrgStore } from '@/stores/orgStore';
import { EmptyState } from '@/components/ui/EmptyState';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { TaskStatus } from '@/types/common';
import type { TaskPriority } from '@/types/common';
import type { Task } from '../types/task.types';
import { TaskBoard } from '../components/TaskBoard';
import { TaskTableView } from '../components/TaskTableView';
import { TaskFilters } from '../components/TaskFilters';
import { TaskFormModal } from '../components/TaskFormModal';

const STATUS_TABS: Array<{ key: string; label: string; value?: TaskStatus }> = [
  { key: 'all', label: 'All Tasks' },
  { key: 'TODO', label: 'To Do', value: TaskStatus.TODO },
  { key: 'IN_PROGRESS', label: 'In Progress', value: TaskStatus.IN_PROGRESS },
  { key: 'IN_REVIEW', label: 'In Review', value: TaskStatus.IN_REVIEW },
  { key: 'DONE', label: 'Done', value: TaskStatus.DONE },
];

interface ModalState {
  open: boolean;
  task: Task | null;
  defaultStatus?: TaskStatus;
  defaultProjectId?: number;
}

export default function TaskListPage() {
  const [modal, setModal] = useState<ModalState>({ open: false, task: null });
  const [deleteTarget, setDeleteTarget] = useState<Task | null>(null);
  const [activeTab, setActiveTab] = useState('all');
  const [viewMode, setViewMode] = useState<'list' | 'board'>('board');
  const [search, setSearch] = useState('');
  const [projectFilter, setProjectFilter] = useState<number | undefined>();
  const [assigneeFilter, setAssigneeFilter] = useState<number | undefined>();
  const [priorityFilter, setPriorityFilter] = useState<TaskPriority | undefined>();

  const activeOrganization = useOrgStore((state) => state.activeOrganization);
  const { data, isLoading } = useTasksByOrganization();
  const deleteMutation = useDeleteTask();

  const allTasks = useMemo(() => {
    const seen = new Set<number>();
    return (data ?? []).filter((t) => (seen.has(t.id) ? false : (seen.add(t.id), true)));
  }, [data]);

  const filteredByCriteria = useMemo(() => {
    const q = search.trim().toLowerCase();
    return allTasks.filter((t) => {
      if (q && !`${t.title} ${t.description ?? ''}`.toLowerCase().includes(q)) return false;
      if (projectFilter && t.projectId !== projectFilter) return false;
      if (assigneeFilter && t.affectedUserId !== assigneeFilter) return false;
      if (priorityFilter && t.priority !== priorityFilter) return false;
      return true;
    });
  }, [allTasks, search, projectFilter, assigneeFilter, priorityFilter]);

  const tableTasks = useMemo(
    () =>
      activeTab === 'all'
        ? filteredByCriteria
        : filteredByCriteria.filter((t) => t.status === activeTab),
    [filteredByCriteria, activeTab],
  );

  const countByStatus = useMemo(() => {
    const counts: Record<string, number> = { all: filteredByCriteria.length };
    for (const t of filteredByCriteria) counts[t.status] = (counts[t.status] ?? 0) + 1;
    return counts;
  }, [filteredByCriteria]);

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

  const openCreate = (status: TaskStatus = TaskStatus.TODO) =>
    setModal({ open: true, task: null, defaultStatus: status });

  const openEdit = (task: Task) => setModal({ open: true, task });

  const closeModal = () => setModal({ open: false, task: null });

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    await deleteMutation.mutateAsync(deleteTarget.id);
  };

  return (
    <div>
      <PageHeader
        title="Tasks"
        subtitle={`${activeOrganization.name} · ${allTasks.length} total`}
        actions={
          <Button type="primary" icon={<PlusOutlined />} onClick={() => openCreate()}>
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
            label: `${tab.label} ${countByStatus[tab.key] ?? 0}`,
          }))}
        />
        <Segmented
          value={viewMode}
          onChange={(v) => setViewMode(v as 'list' | 'board')}
          options={[
            { value: 'board', label: 'Kanban Board', icon: <ProjectOutlined /> },
            { value: 'list', label: 'Data Table List', icon: <UnorderedListOutlined /> },
          ]}
        />
      </div>

      <div style={{ marginBottom: 16 }}>
        <TaskFilters
          search={search}
          onSearchChange={setSearch}
          projectId={projectFilter}
          onProjectChange={setProjectFilter}
          assigneeId={assigneeFilter}
          onAssigneeChange={setAssigneeFilter}
          priority={priorityFilter}
          onPriorityChange={setPriorityFilter}
        />
      </div>

      {viewMode === 'board' ? (
        filteredByCriteria.length === 0 ? (
          <EmptyState
            description="No tasks match your filters"
            actionLabel="Create your first task"
            onAction={() => openCreate()}
          />
        ) : (
          <TaskBoard
            tasks={filteredByCriteria}
            onQuickCreate={openCreate}
            onEdit={openEdit}
            onDelete={(t) => setDeleteTarget(t)}
          />
        )
      ) : (
        <TaskTableView
          tasks={tableTasks}
          onEdit={openEdit}
          onDelete={(t) => setDeleteTarget(t)}
        />
      )}

      <TaskFormModal
        open={modal.open}
        onClose={closeModal}
        task={modal.task ?? undefined}
        defaultStatus={modal.defaultStatus}
        defaultProjectId={modal.defaultProjectId}
      />

      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete task"
        content={`Delete "${deleteTarget?.title}"? This cannot be undone.`}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={confirmDelete}
      />
    </div>
  );
}