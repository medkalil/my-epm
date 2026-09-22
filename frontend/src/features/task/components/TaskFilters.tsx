import { Input, Select, Space } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import { TaskPriority } from '@/types/common';
import { useProjects } from '@/features/project/api/project.queries';
import { useOrganizationMembers } from '@/features/organization/api/organization.queries';
import { useOrgStore } from '@/stores/orgStore';

interface TaskFiltersProps {
  search: string;
  onSearchChange: (value: string) => void;
  projectId?: number;
  onProjectChange: (value?: number) => void;
  assigneeId?: number;
  onAssigneeChange: (value?: number) => void;
  priority?: TaskPriority;
  onPriorityChange: (value?: TaskPriority) => void;
}

export function TaskFilters({
  search,
  onSearchChange,
  projectId,
  onProjectChange,
  assigneeId,
  onAssigneeChange,
  priority,
  onPriorityChange,
}: TaskFiltersProps) {
  const { data: projectsData = [] } = useProjects();
  const activeOrganization = useOrgStore((state) => state.activeOrganization);
  const { data: orgMembers = [] } = useOrganizationMembers(activeOrganization?.id);

  const projectOptions = projectsData.map((p) => ({ label: p.name, value: p.id }));
  const memberOptions = (orgMembers ?? []).map((m) => ({
    label: m.user?.name ?? `User #${m.userId}`,
    value: m.userId,
  }));

  const priorityOptions = [
    { label: 'Low', value: TaskPriority.LOW },
    { label: 'Medium', value: TaskPriority.MEDIUM },
    { label: 'High', value: TaskPriority.HIGH },
    { label: 'Urgent', value: TaskPriority.URGENT },
  ];

  return (
    <Space wrap size={8}>
      <Input
        placeholder="Search tasks"
        prefix={<SearchOutlined />}
        value={search}
        onChange={(e) => onSearchChange(e.target.value)}
        allowClear
        style={{ width: 200 }}
      />
      <Select
        placeholder="Project"
        value={projectId}
        onChange={(v) => onProjectChange(v)}
        options={projectOptions}
        allowClear
        showSearch
        optionFilterProp="label"
        style={{ minWidth: 160 }}
      />
      <Select
        placeholder="Assignee"
        value={assigneeId}
        onChange={(v) => onAssigneeChange(v)}
        options={memberOptions}
        allowClear
        showSearch
        optionFilterProp="label"
        style={{ minWidth: 160 }}
      />
      <Select
        placeholder="Priority"
        value={priority}
        onChange={(v) => onPriorityChange(v)}
        options={priorityOptions}
        allowClear
        style={{ minWidth: 130 }}
      />
    </Space>
  );
}