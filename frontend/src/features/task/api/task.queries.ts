import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { taskService } from '@/services/task.service';
import type { CreateTaskRequest, UpdateTaskRequest } from '../types/task.types';
import { useOrgStore } from '@/stores/orgStore';
import { App } from 'antd';
import { getApiErrorMessage } from '@/lib/axios';

export function useTasksByOrganization() {
  const activeOrganization = useOrgStore((state) => state.activeOrganization);

  return useQuery({
    queryKey: ['tasks', 'org', activeOrganization?.id],
    queryFn: () => taskService.getByOrganization(activeOrganization!.id),
    enabled: !!activeOrganization,
  });
}

export function useTasksByProject(projectId: number | undefined) {
  const activeOrganization = useOrgStore((state) => state.activeOrganization);

  return useQuery({
    queryKey: ['tasks', 'project', projectId],
    queryFn: () => taskService.getByProject(projectId!, activeOrganization!.id),
    enabled: !!projectId && !!activeOrganization,
  });
}

export function useTask(taskId: number | undefined) {
  const activeOrganization = useOrgStore((state) => state.activeOrganization);

  return useQuery({
    queryKey: ['tasks', taskId],
    queryFn: () => taskService.getById(taskId!, activeOrganization!.id),
    enabled: !!taskId && !!activeOrganization,
  });
}

export function useCreateTask() {
  const queryClient = useQueryClient();
  const { message } = App.useApp();

  return useMutation({
    mutationFn: (payload: CreateTaskRequest) => taskService.create(payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['tasks'] });
      message.success('Task created');
    },
    onError: (error) => message.error(getApiErrorMessage(error)),
  });
}

export function useUpdateTask() {
  const queryClient = useQueryClient();
  const activeOrganization = useOrgStore((state) => state.activeOrganization);
  const { message } = App.useApp();

  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: UpdateTaskRequest }) =>
      taskService.update(id, activeOrganization!.id, payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['tasks'] });
      message.success('Task updated');
    },
    onError: (error) => message.error(getApiErrorMessage(error)),
  });
}

export function useDeleteTask() {
  const queryClient = useQueryClient();
  const activeOrganization = useOrgStore((state) => state.activeOrganization);
  const { message } = App.useApp();

  return useMutation({
    mutationFn: (id: number) => taskService.remove(id, activeOrganization!.id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['tasks'] });
      message.success('Task deleted');
    },
    onError: (error) => message.error(getApiErrorMessage(error)),
  });
}