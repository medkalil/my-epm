import { api } from '@/lib/axios';
import { API_ENDPOINTS } from '@/config/constants';
import type { Task, CreateTaskRequest, UpdateTaskRequest } from '@/features/task/types/task.types';
import type { Page, PageParams } from '@/types/api';

export const taskService = {
  async create(payload: CreateTaskRequest): Promise<Task> {
    const { data } = await api.post<Task>(API_ENDPOINTS.tasks.base, payload);
    return data;
  },

  async getById(id: number, orgId: number): Promise<Task> {
    const { data } = await api.get<Task>(API_ENDPOINTS.tasks.byId(id), {
      params: { orgId },
    });
    return data;
  },

  async getByProject(
    projectId: number,
    orgId: number,
    params?: PageParams,
  ): Promise<Page<Task>> {
    const { data } = await api.get<Page<Task>>(
      API_ENDPOINTS.tasks.byProject(projectId),
      { params: { ...params, orgId } },
    );
    return data;
  },

  async getByOrganization(
    orgId: number,
    params?: PageParams,
  ): Promise<Page<Task>> {
    const { data } = await api.get<Page<Task>>(
      API_ENDPOINTS.tasks.byOrganization(orgId),
      { params },
    );
    return data;
  },

  async getByUser(userId: number, orgId: number, params?: PageParams): Promise<Page<Task>> {
    const { data } = await api.get<Page<Task>>(API_ENDPOINTS.tasks.byUser(userId), {
      params: { ...params, orgId },
    });
    return data;
  },

  async update(
    id: number,
    orgId: number,
    payload: UpdateTaskRequest,
  ): Promise<Task> {
    const { data } = await api.put<Task>(API_ENDPOINTS.tasks.byId(id), payload, {
      params: { orgId },
    });
    return data;
  },

  async remove(id: number, orgId: number): Promise<void> {
    await api.delete(API_ENDPOINTS.tasks.byId(id), { params: { orgId } });
  },
};