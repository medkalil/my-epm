import { api } from '@/lib/axios';
import { API_ENDPOINTS } from '@/config/constants';
import type { User } from '@/features/user/types/user.types';

export const userService = {
  async getById(id: number): Promise<User> {
    const { data } = await api.get<User>(API_ENDPOINTS.users.byId(id));
    return data;
  },

  async getCurrent(): Promise<User> {
    const { data } = await api.get<User>(API_ENDPOINTS.users.base + '/me');
    return data;
  },

  async list(): Promise<User[]> {
    const { data } = await api.get<User[]>(API_ENDPOINTS.users.base);
    return data;
  },
};