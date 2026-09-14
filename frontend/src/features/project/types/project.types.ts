import type { User } from '@/features/user/types/user.types';

export interface Project {
  id: number;
  name: string;
  description?: string;
  organizationId: number;
  members?: User[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateProjectRequest {
  name: string;
  description?: string;
  organizationId: number;
}

export interface UpdateProjectRequest {
  name?: string;
  description?: string;
}