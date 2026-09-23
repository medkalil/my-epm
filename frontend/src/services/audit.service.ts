import { api } from '@/lib/axios';
import { API_ENDPOINTS } from '@/config/constants';
import type {
  AuditExportFormat,
  AuditFilterOptions,
  AuditLogPage,
  AuditStats,
} from '@/features/audit/types/audit.types';

export interface AuditQueryParams {
  from?: string;
  to?: string;
  actor?: string;
  action?: string;
  resource?: string;
  success?: boolean;
}

export const auditService = {
  async getLogs(
    orgId: number,
    params: AuditQueryParams & { page: number; size: number },
  ): Promise<AuditLogPage> {
    const { data } = await api.get<AuditLogPage>(API_ENDPOINTS.audit.base, {
      params: { orgId, ...params },
    });
    return data;
  },

  async getStats(orgId: number, params: AuditQueryParams): Promise<AuditStats> {
    const { data } = await api.get<AuditStats>(API_ENDPOINTS.audit.stats, {
      params: { orgId, ...params },
    });
    return data;
  },

  async getFilterOptions(
    orgId: number,
    params: AuditQueryParams,
  ): Promise<AuditFilterOptions> {
    const { data } = await api.get<AuditFilterOptions>(
      API_ENDPOINTS.audit.filterOptions,
      { params: { orgId, ...params } },
    );
    return data;
  },

  async export(
    orgId: number,
    format: AuditExportFormat,
    params: AuditQueryParams,
  ): Promise<Blob> {
    const { data } = await api.get<Blob>(API_ENDPOINTS.audit.export, {
      params: { orgId, format, ...params },
      responseType: 'blob',
    });
    return data;
  },
};