import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { projectService } from '@/services/project.service';
import type { CreateProjectRequest, UpdateProjectRequest } from '../types/project.types';
import { useOrgStore } from '@/stores/orgStore';
import { App } from 'antd';
import { getApiErrorMessage } from '@/lib/axios';

export function useProjects() {
  const activeOrganization = useOrgStore((state) => state.activeOrganization);

  return useQuery({
    queryKey: ['projects', 'org', activeOrganization?.id],
    queryFn: () => projectService.getByOrganization(activeOrganization!.id),
    enabled: !!activeOrganization,
  });
}

export function useProject(projectId: number | undefined, orgId: number | undefined) {
  return useQuery({
    queryKey: ['projects', projectId],
    queryFn: () => projectService.getById(projectId!, orgId!),
    enabled: !!projectId && !!orgId,
  });
}

export function useCreateProject() {
  const queryClient = useQueryClient();
  const activeOrganization = useOrgStore((state) => state.activeOrganization);
  const { message } = App.useApp();

  return useMutation({
    mutationFn: (payload: Omit<CreateProjectRequest, 'organizationId'>) =>
      projectService.create({ ...payload, organizationId: activeOrganization!.id }),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: ['projects', 'org', activeOrganization?.id],
      });
      message.success('Project created');
    },
    onError: (error) => message.error(getApiErrorMessage(error)),
  });
}

export function useUpdateProject(orgId: number) {
  const queryClient = useQueryClient();
  const { message } = App.useApp();

  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: UpdateProjectRequest }) =>
      projectService.update(id, orgId, payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['projects', 'org', orgId] });
      message.success('Project updated');
    },
    onError: (error) => message.error(getApiErrorMessage(error)),
  });
}

export function useDeleteProject(orgId: number) {
  const queryClient = useQueryClient();
  const { message } = App.useApp();

  return useMutation({
    mutationFn: (id: number) => projectService.remove(id, orgId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['projects', 'org', orgId] });
      message.success('Project deleted');
    },
    onError: (error) => message.error(getApiErrorMessage(error)),
  });
}