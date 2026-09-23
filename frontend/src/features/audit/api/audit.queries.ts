import { useQuery } from '@tanstack/react-query';
import { auditService } from '@/services/audit.service';
import type { AuditQueryParams } from '@/services/audit.service';
import type {
  AuditFilterOptions,
  AuditLogPage,
  AuditStats,
} from '../types/audit.types';

export type AuditFilterState = AuditQueryParams;

export function useAuditLogs(
  orgId: number | undefined,
  filter: AuditFilterState,
  page: number,
  size: number,
) {
  return useQuery<AuditLogPage>({
    queryKey: ['audit-logs', 'list', orgId, filter, page, size],
    queryFn: () => auditService.getLogs(orgId!, { ...filter, page, size }),
    enabled: !!orgId,
    placeholderData: (previousData) => previousData,
  });
}

export function useAuditStats(
  orgId: number | undefined,
  filter: AuditFilterState,
) {
  return useQuery<AuditStats>({
    queryKey: ['audit-logs', 'stats', orgId, filter],
    queryFn: () => auditService.getStats(orgId!, filter),
    enabled: !!orgId,
    placeholderData: (previousData) => previousData,
  });
}

export function useAuditFilterOptions(
  orgId: number | undefined,
  filter: AuditFilterState,
) {
  return useQuery<AuditFilterOptions>({
    queryKey: ['audit-logs', 'options', orgId, filter],
    queryFn: () => auditService.getFilterOptions(orgId!, filter),
    enabled: !!orgId,
  });
}