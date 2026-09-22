import type { TaskPriority, TaskStatus } from '@/types/common';
import type { Project } from '@/features/project/types/project.types';
import type { User } from '@/features/user/types/user.types';

export interface Task {
  id: number;
  title: string;
  description?: string;
  status: TaskStatus;
  priority?: TaskPriority | null;
  position?: number;
  projectId: number;
  organizationId: number;
  affectedUserId?: number;
  affectedUserName?: string;
  project?: Project;
  affectedUser?: User;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateTaskRequest {
  title: string;
  description?: string;
  status: TaskStatus;
  priority?: TaskPriority | null;
  projectId: number;
  organizationId: number;
  affectedUserId?: number;
}

export interface UpdateTaskRequest {
  title?: string;
  description?: string;
  status?: TaskStatus;
  priority?: TaskPriority | null;
  affectedUserId?: number;
}

export interface TaskMoveRequest {
  status: TaskStatus;
  position: number;
}