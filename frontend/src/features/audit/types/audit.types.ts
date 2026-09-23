export enum AuditAction {
  CREATE = 'CREATE',
  UPDATE = 'UPDATE',
  DELETE = 'DELETE',
  MOVE = 'MOVE',
  LOGIN = 'LOGIN',
  LOGOUT = 'LOGOUT',
  SWITCH = 'SWITCH',
}

export enum AuditResource {
  AUTH = 'AUTH',
  ORGANIZATION = 'ORGANIZATION',
  MEMBER = 'MEMBER',
  PROJECT = 'PROJECT',
  TASK = 'TASK',
  USER = 'USER',
  OTHER = 'OTHER',
}

export interface AuditLog {
  id: number;
  organizationId: number;
  actor: string;
  action: AuditAction;
  resource: AuditResource;
  resourceId: number | null;
  httpMethod: string;
  path: string;
  statusCode: number;
  success: boolean;
  errorMessage: string | null;
  ipAddress: string | null;
  userAgent: string | null;
  durationMs: number | null;
  createdAt: string;
}

export interface AuditLogPage {
  content: AuditLog[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
}

export interface NameValue {
  name: string;
  value: number;
}

export interface AuditStats {
  totalEvents: number;
  successRate: number;
  avgDurationMs: number;
  last24hCount: number;
  byAction: NameValue[];
  byResource: NameValue[];
  topActors: NameValue[];
  dailyTrend: NameValue[];
}

export interface AuditFilterOptions {
  actors: string[];
  actions: string[];
  resources: string[];
}

export type AuditExportFormat = 'csv' | 'xlsx';