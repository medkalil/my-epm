import type { Organization } from '@/features/organization/types/organization.types';

export interface LoginRequest {
  identifier: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  fullName: string;
  password: string;
  organization?: {
    name: string;
    slug: string;
  };
  joinOrganizationSlug?: string;
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
  token: string | null;
  type?: string;
  refreshToken: string | null;
  id: number;
  username: string;
  email?: string;
  fullName?: string;
  mustChangePassword?: boolean;
  currentOrganizationId?: number | null;
  organizations?: Organization[];
}

export interface ChangePasswordRequest {
  userId: number;
  currentPassword: string;
  newPassword: string;
}

export interface RegisterResponse {
  id: number;
  name: string;
  email?: string;
  fullName?: string;
}

export interface ForgotPasswordRequest {
  identifier: string;
}

export interface ResetPasswordRequest {
  token: string;
  newPassword: string;
}