import { api } from '@/lib/axios';
import { API_ENDPOINTS } from '@/config/constants';
import type { User } from '@/features/user/types/user.types';
import type { Page, PageParams } from '@/types/api';

export const userService = {
  async getById(id: number): Promise<User> {
    const { data } = await api.get<User>(API_ENDPOINTS.users.byId(id));
    return data;
  },

  async getCurrent(): Promise<User> {
    const { data } = await api.get<User>(API_ENDPOINTS.users.base + '/me');
    return data;
  },

  async list(params?: PageParams): Promise<Page<User>> {
    const { data } = await api.get<Page<User>>(API_ENDPOINTS.users.base, { params });
    return data;
  },
};