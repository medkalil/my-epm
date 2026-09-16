import type { Organization } from '@/features/organization/types/organization.types';

export interface LoginRequest {
  username: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  password: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
}

export interface RefreshTokenResponse {
  accessToken: string;
  refreshToken: string;
}

export interface LoginResponse {
  token: string;
  type?: string;
  refreshToken: string;
  id: number;
  username: string;
  currentOrganizationId?: number | null;
  organizations?: Organization[];
}

export interface RegisterResponse {
  id: number;
  username: string;
}