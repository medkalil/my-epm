import { api } from '@/lib/axios';
import { API_ENDPOINTS } from '@/config/constants';
import type {
  Project,
  CreateProjectRequest,
  UpdateProjectRequest,
} from '@/features/project/types/project.types';
import type { Page, PageParams } from '@/types/api';
import type { User } from '@/features/user/types/user.types';

export const projectService = {
  async create(payload: CreateProjectRequest): Promise<Project> {
    const { data } = await api.post<Project>(API_ENDPOINTS.projects.base, payload);
    return data;
  },

  async getById(id: number, orgId: number): Promise<Project> {
    const { data } = await api.get<Project>(API_ENDPOINTS.projects.byId(id), {
      params: { orgId },
    });
    return data;
  },

  async getByOrganization(
    orgId: number,
    params?: PageParams,
  ): Promise<Page<Project>> {
    const { data } = await api.get<Page<Project>>(
      API_ENDPOINTS.projects.byOrganization(orgId),
      { params },
    );
    return data;
  },

  async update(id: number, orgId: number, payload: UpdateProjectRequest): Promise<Project> {
    const { data } = await api.put<Project>(API_ENDPOINTS.projects.byId(id), payload, {
      params: { orgId },
    });
    return data;
  },

  async remove(id: number, orgId: number): Promise<void> {
    await api.delete(API_ENDPOINTS.projects.byId(id), { params: { orgId } });
  },

  async addMember(id: number, userId: number, orgId: number): Promise<User> {
    const { data } = await api.post<User>(
      API_ENDPOINTS.projects.members(id) + `/${userId}`,
      undefined,
      { params: { orgId } },
    );
    return data;
  },

  async removeMember(id: number, userId: number, orgId: number): Promise<void> {
    await api.delete(API_ENDPOINTS.projects.members(id) + `/${userId}`, {
      params: { orgId },
    });
  },
};