import type { User } from '@/features/user/types/user.types';

export interface LoginRequest {
  name: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  password: string;
  email?: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
}

export interface RefreshTokenResponse extends AuthTokens {}

export interface LoginResponse {
  tokens: AuthTokens;
  user: User;
  activeOrganizationId: number | null;
}

export interface RegisterResponse {
  user: User;
  message: string;
}