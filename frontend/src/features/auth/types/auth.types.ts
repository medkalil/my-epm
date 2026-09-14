import type { User } from '@/features/user/types/user.types';

export interface LoginRequest {
  username: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  password: string;
  email?: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
}

export type RefreshTokenResponse = AuthTokens;

export interface LoginResponse {
  tokens: AuthTokens;
  user: User;
  activeOrganizationId: number | null;
}

export interface RegisterResponse {
  user: User;
  message: string;
}