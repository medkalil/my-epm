import { useState } from 'react';
import { App as AntApp, Card, Space } from 'antd';
import { useParams } from 'react-router-dom';
import { PageHeader } from '@/components/ui/PageHeader';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { AUDIT_RANGE_MS, DEFAULT_AUDIT_RANGE } from '@/config/constants';
import { getApiErrorMessage } from '@/lib/axios';
import { downloadBlob } from '@/lib/download';
import { auditService } from '@/services/audit.service';
import { useAuditFilterOptions, useAuditLogs, useAuditStats } from '../api/audit.queries';
import type { AuditFilterState } from '../api/audit.queries';
import { AuditFilterBar } from '../components/AuditFilterBar';
import type { AuditRangeKey } from '../components/AuditFilterBar';
import { AuditLogTable } from '../components/AuditLogTable';
import { AuditStatsCards } from '../components/AuditStatsCards';
import type { AuditExportFormat } from '../types/audit.types';

export default function AuditLogsPage() {
  const { id } = useParams<{ id: string }>();
  const orgId = Number(id);
  const { message } = AntApp.useApp();

  const [range, setRange] = useState<AuditRangeKey>(DEFAULT_AUDIT_RANGE);
  const [filter, setFilter] = useState<AuditFilterState>(() => {
    const ms = AUDIT_RANGE_MS[DEFAULT_AUDIT_RANGE];
    return {
      from: new Date(Date.now() - ms).toISOString(),
      to: new Date().toISOString(),
    };
  });
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(10);
  const [exporting, setExporting] = useState<AuditExportFormat | null>(null);

  const logsQuery = useAuditLogs(orgId, filter, page, size);
  const statsQuery = useAuditStats(orgId, filter);
  const optionsQuery = useAuditFilterOptions(orgId, filter);

  if (!orgId) return <LoadingSpinner />;

  const handleFilterChange = (next: AuditFilterState) => {
    setFilter(next);
    setPage(0);
  };

  const handleRangeChange = (next: AuditRangeKey) => {
    setRange(next);
    if (next !== 'custom') {
      const ms = AUDIT_RANGE_MS[next];
      handleFilterChange({
        ...filter,
        from: new Date(Date.now() - ms).toISOString(),
        to: new Date().toISOString(),
      });
    }
  };

  const handleExport = async (format: AuditExportFormat) => {
    if (!orgId) return;
    setExporting(format);
    try {
      const blob = await auditService.export(orgId, format, filter);
      const extension = format === 'csv' ? 'csv' : 'xlsx';
      const filename = `audit-log-${orgId}-${filter.from ?? 'start'}-${filter.to ?? 'now'}.${extension}`;
      downloadBlob(blob, filename);
      message.success(
        `Exported ${logsQuery.data?.totalElements ?? 0} events as ${format.toUpperCase()}`,
      );
    } catch (error) {
      message.error(getApiErrorMessage(error));
    } finally {
      setExporting(null);
    }
  };

  const exportingActive = exporting === 'csv' || exporting === 'xlsx';

  return (
    <div>
      <PageHeader
        title="Security & Audit Logs"
        subtitle="Activity trail for organization mutations and authentication"
      />

      <Space direction="vertical" size={16} style={{ width: '100%' }}>
        <AuditStatsCards stats={statsQuery.data} loading={statsQuery.isLoading} />

        <Card>
          <AuditFilterBar
            value={filter}
            range={range}
            options={optionsQuery.data}
            onChange={handleFilterChange}
            onRangeChange={handleRangeChange}
            onExport={handleExport}
            exporting={exportingActive}
          />
        </Card>

        <Card>
          <AuditLogTable
            logs={logsQuery.data?.content}
            loading={logsQuery.isLoading}
            total={logsQuery.data?.totalElements ?? 0}
            page={logsQuery.data?.page ?? page}
            size={logsQuery.data?.size ?? size}
            onPageChange={(nextPage, nextSize) => {
              setPage(nextPage - 1);
              setSize(nextSize);
            }}
          />
        </Card>
      </Space>
    </div>
  );
}