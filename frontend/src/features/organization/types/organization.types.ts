import type { OrgRole } from '@/types/common';

export interface Organization {
  id: number;
  name: string;
  slug: string;
  ownerId: number;
  description?: string;
  logoUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface OrganizationMember {
  id: number;
  organizationId: number;
  userId: number;
  role: OrgRole;
  active: boolean;
  joinedAt: string;
  user?: {
    id: number;
    name: string;
    email?: string;
  };
}

export interface CreateOrganizationRequest {
  name: string;
  slug: string;
}

export interface AddMemberRequest {
  userId: number;
  role: OrgRole;
}