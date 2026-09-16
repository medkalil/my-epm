import { useQuery } from '@tanstack/react-query';
import { projectService } from '@/services/project.service';
import { taskService } from '@/services/task.service';
import { organizationService } from '@/services/organization.service';
import { useOrgStore } from '@/stores/orgStore';
import type { Project } from '@/features/project/types/project.types';
import type { Task } from '@/features/task/types/task.types';
import type { OrganizationMember } from '@/features/organization/types/organization.types';

export function useDashboardStats() {
  const activeOrganization = useOrgStore((state) => state.activeOrganization);
  const orgId = activeOrganization?.id;

  const projectsQuery = useQuery<Project[]>({
    queryKey: ['projects', 'org', orgId],
    queryFn: () => projectService.getByOrganization(orgId!),
    enabled: !!orgId,
  });

  const tasksQuery = useQuery<Task[]>({
    queryKey: ['tasks', 'org', orgId],
    queryFn: () => taskService.getByOrganization(orgId!),
    enabled: !!orgId,
  });

  const membersQuery = useQuery<OrganizationMember[]>({
    queryKey: ['organizations', orgId, 'members'],
    queryFn: () => organizationService.listMembers(orgId!),
    enabled: !!orgId,
  });

  return {
    orgId,
    activeOrganization,
    projects: projectsQuery.data ?? [],
    tasks: tasksQuery.data ?? [],
    members: membersQuery.data ?? [],
    isLoading: projectsQuery.isLoading || tasksQuery.isLoading || membersQuery.isLoading,
    isError: projectsQuery.isError || tasksQuery.isError || membersQuery.isError,
  };
}