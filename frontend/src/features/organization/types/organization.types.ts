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

export type JoinRequestStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export interface JoinRequest {
  id: number;
  organizationId: number;
  organizationName: string;
  organizationSlug: string;
  userId: number;
  userName: string;
  userEmail?: string;
  status: JoinRequestStatus;
  requestedAt: string;
  reviewedAt?: string | null;
  reviewerUserId?: number | null;
  reviewerName?: string | null;
}