import { Button, DatePicker, Segmented, Select, Space, Tooltip } from 'antd';
import { FileExcelOutlined, FileTextOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { useMemo } from 'react';
import { AUDIT_RANGE_OPTIONS } from '@/config/constants';
import type { AuditFilterState } from '../api/audit.queries';
import type { AuditExportFormat, AuditFilterOptions } from '../types/audit.types';

export type AuditRangeKey = '24h' | '7d' | '30d' | 'custom';

interface AuditFilterBarProps {
  value: AuditFilterState;
  range: AuditRangeKey;
  options?: AuditFilterOptions;
  onChange: (filter: AuditFilterState) => void;
  onRangeChange: (range: AuditRangeKey) => void;
  onExport: (format: AuditExportFormat) => void;
  exporting: boolean;
}

const SUCCESS_OPTIONS = [
  { label: 'All outcomes', value: '' },
  { label: 'Success', value: 'success' },
  { label: 'Failed', value: 'failed' },
];

export function AuditFilterBar({
  value,
  range,
  options,
  onChange,
  onRangeChange,
  onExport,
  exporting,
}: AuditFilterBarProps) {
  const applyWindow = (from?: string, to?: string) =>
    onChange({ ...value, from, to });

  const handleRangeChange = (next: AuditRangeKey) => {
    onRangeChange(next);
  };

  const actorOptions = useMemo(
    () => (options?.actors ?? []).map((actor) => ({ label: actor, value: actor })),
    [options],
  );
  const actionOptions = useMemo(
    () => (options?.actions ?? []).map((action) => ({ label: action, value: action })),
    [options],
  );
  const resourceOptions = useMemo(
    () => (options?.resources ?? []).map((resource) => ({ label: resource, value: resource })),
    [options],
  );

  return (
    <Space wrap>
      <Select
        style={{ minWidth: 150 }}
        value={range}
        onChange={(next) => handleRangeChange(next as AuditRangeKey)}
        options={[...AUDIT_RANGE_OPTIONS]}
      />
      {range === 'custom' && (
        <DatePicker.RangePicker
          showTime
          value={
            value.from && value.to
              ? [dayjs(value.from), dayjs(value.to)]
              : undefined
          }
          onChange={(dates) => {
            if (dates && dates[0] && dates[1]) {
              applyWindow(dates[0].toISOString(), dates[1].toISOString());
            }
          }}
        />
      )}
      <Select
        style={{ minWidth: 140 }}
        placeholder="Actor"
        allowClear
        showSearch
        value={value.actor || undefined}
        onChange={(actor) => onChange({ ...value, actor: actor ?? undefined })}
        options={actorOptions}
      />
      <Select
        style={{ minWidth: 140 }}
        placeholder="Action"
        allowClear
        value={value.action || undefined}
        onChange={(action) => onChange({ ...value, action: action ?? undefined })}
        options={actionOptions}
      />
      <Select
        style={{ minWidth: 160 }}
        placeholder="Resource"
        allowClear
        value={value.resource || undefined}
        onChange={(resource) => onChange({ ...value, resource: resource ?? undefined })}
        options={resourceOptions}
      />
      <Segmented
        value={
          value.success === undefined
            ? ''
            : value.success
              ? 'success'
              : 'failed'
        }
        onChange={(next) =>
          onChange({
            ...value,
            success:
              next === '' ? undefined : next === 'success',
          })
        }
        options={SUCCESS_OPTIONS}
      />
      <Tooltip title="Export as CSV">
        <Button
          icon={<FileTextOutlined />}
          loading={exporting}
          onClick={() => onExport('csv')}
        >
          CSV
        </Button>
      </Tooltip>
      <Tooltip title="Export as Excel">
        <Button
          icon={<FileExcelOutlined />}
          loading={exporting}
          onClick={() => onExport('xlsx')}
        >
          Excel
        </Button>
      </Tooltip>
    </Space>
  );
}