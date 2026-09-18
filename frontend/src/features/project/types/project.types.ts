import type { User } from '@/features/user/types/user.types';

export type ProjectStatus = 'IN_PROGRESS' | 'IN_REVIEW' | 'COMPLETED';

export interface Project {
  id: number;
  name: string;
  description?: string;
  status: ProjectStatus;
  organizationId: number;
  memberIds?: number[];
  members?: User[];
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateProjectRequest {
  name: string;
  description?: string;
  status?: ProjectStatus;
  organizationId: number;
  memberIds?: number[];
}

export interface UpdateProjectRequest {
  name?: string;
  description?: string;
  status?: ProjectStatus;
}