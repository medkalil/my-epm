import { api } from '@/lib/axios';
import { API_ENDPOINTS } from '@/config/constants';
import type {
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  RegisterResponse,
  RefreshTokenResponse,
} from '@/features/auth/types/auth.types';

export const authService = {
  async login(payload: LoginRequest): Promise<LoginResponse> {
    const { data } = await api.post<LoginResponse>(API_ENDPOINTS.auth.login, payload);
    return data;
  },

  async register(payload: RegisterRequest): Promise<RegisterResponse> {
    const { data } = await api.post<RegisterResponse>(API_ENDPOINTS.auth.register, payload);
    return data;
  },

  async refreshToken(refreshToken: string): Promise<RefreshTokenResponse> {
    const { data } = await api.post<RefreshTokenResponse>(API_ENDPOINTS.auth.refresh, {
      refreshToken,
    });
    return data;
  },
};