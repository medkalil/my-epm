import { api } from '@/lib/axios';
import { API_ENDPOINTS } from '@/config/constants';
import type {
  Organization,
  OrganizationMember,
  CreateOrganizationRequest,
  AddMemberRequest,
} from '@/features/organization/types/organization.types';
import type { Page, PageParams } from '@/types/api';

export const organizationService = {
  async create(payload: CreateOrganizationRequest): Promise<Organization> {
    const { data } = await api.post<Organization>(API_ENDPOINTS.organizations.base, payload);
    return data;
  },

  async getMine(params?: PageParams): Promise<Page<Organization>> {
    const { data } = await api.get<Page<Organization>>(API_ENDPOINTS.organizations.my, {
      params,
    });
    return data;
  },

  async getById(id: number): Promise<Organization> {
    const { data } = await api.get<Organization>(`${API_ENDPOINTS.organizations.base}/${id}`);
    return data;
  },

  async getBySlug(slug: string): Promise<Organization> {
    const { data } = await api.get<Organization>(API_ENDPOINTS.organizations.bySlug(slug));
    return data;
  },

  async listMembers(
    orgId: number,
    params?: PageParams,
  ): Promise<Page<OrganizationMember>> {
    const { data } = await api.get<Page<OrganizationMember>>(
      API_ENDPOINTS.organizations.members(orgId),
      { params },
    );
    return data;
  },

  async addMember(orgId: number, payload: AddMemberRequest): Promise<OrganizationMember> {
    const { data } = await api.post<OrganizationMember>(
      API_ENDPOINTS.organizations.members(orgId),
      payload,
    );
    return data;
  },

  async switchActive(orgId: number): Promise<Organization> {
    const { data } = await api.post<Organization>(API_ENDPOINTS.organizations.switch(orgId));
    return data;
  },
};