import { useQuery } from '@tanstack/react-query';
import { projectService } from '@/services/project.service';
import { taskService } from '@/services/task.service';
import { useOrgStore } from '@/stores/orgStore';
import type { Project } from '@/features/project/types/project.types';
import type { Task } from '@/features/task/types/task.types';
import type { Page } from '@/types/api';

export function useDashboardStats() {
  const activeOrganization = useOrgStore((state) => state.activeOrganization);
  const orgId = activeOrganization?.id;

  const projectsQuery = useQuery<Page<Project>>({
    queryKey: ['projects', 'org', orgId],
    queryFn: () => projectService.getByOrganization(orgId!, { page: 0, size: 5 }),
    enabled: !!orgId,
  });

  const tasksQuery = useQuery<Page<Task>>({
    queryKey: ['tasks', 'org', orgId],
    queryFn: () => taskService.getByOrganization(orgId!, { page: 0, size: 5 }),
    enabled: !!orgId,
  });

  return {
    orgId,
    projects: projectsQuery.data,
    tasks: tasksQuery.data,
    isLoading: projectsQuery.isLoading || tasksQuery.isLoading,
    isError: projectsQuery.isError || tasksQuery.isError,
  };
}