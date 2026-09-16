import { api } from '@/lib/axios';
import { API_ENDPOINTS } from '@/config/constants';
import type {
  Organization,
  OrganizationMember,
  CreateOrganizationRequest,
  AddMemberRequest,
} from '@/features/organization/types/organization.types';

export const organizationService = {
  async create(payload: CreateOrganizationRequest): Promise<Organization> {
    const { data } = await api.post<Organization>(API_ENDPOINTS.organizations.base, payload);
    return data;
  },

  async getMine(): Promise<Organization[]> {
    const { data } = await api.get<Organization[]>(API_ENDPOINTS.organizations.my);
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

  async listMembers(orgId: number): Promise<OrganizationMember[]> {
    const { data } = await api.get<OrganizationMember[]>(
      API_ENDPOINTS.organizations.members(orgId),
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