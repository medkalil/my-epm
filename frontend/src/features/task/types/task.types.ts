import type { TaskPriority, TaskStatus } from '@/types/common';
import type { Project } from '@/features/project/types/project.types';
import type { User } from '@/features/user/types/user.types';

export interface Task {
  id: number;
  title: string;
  description?: string;
  status: TaskStatus;
  priority?: TaskPriority;
  projectId: number;
  organizationId: number;
  affectedUserId?: number;
  project?: Project;
  affectedUser?: User;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTaskRequest {
  title: string;
  description?: string;
  status: TaskStatus;
  priority?: TaskPriority;
  projectId: number;
  organizationId: number;
  affectedUserId?: number;
}

export interface UpdateTaskRequest {
  title?: string;
  description?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  affectedUserId?: number;
}