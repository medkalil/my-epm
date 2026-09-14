import { Table } from 'antd';
import type { TableProps } from 'antd';
import { Pagination } from 'antd';
import { EmptyState } from './EmptyState';
import type { Page } from '@/types/api';

interface DataTableProps<T> extends Omit<TableProps<T>, 'dataSource' | 'pagination'> {
  data?: T[];
  loading?: boolean;
  // pageInfo?: Page<T>;
  // onPageChange?: (page: number, size: number) => void;
}

export function DataTable<T extends object>({
  data,
  loading,
  // pageInfo,
  // onPageChange,
  ...rest
}: DataTableProps<T>) {
  return (
    <Table<T>
      rowKey="id"
      loading={loading}
      dataSource={data}
      pagination={false}
      locale={{
        emptyText: (
          <EmptyState description="No records to display" />
        ),
      }}
      {...rest}
    />
  );
}

interface PaginationBarProps {
  pageInfo?: Page<unknown>;
  onPageChange?: (page: number, size: number) => void;
}

export function PaginationBar({ pageInfo, onPageChange }: PaginationBarProps) {
  if (!pageInfo) return null;
  return (
    <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: 16 }}>
      <Pagination
        current={pageInfo.number + 1}
        pageSize={pageInfo.size}
        total={pageInfo.totalElements}
        showSizeChanger
        showTotal={(total) => `Total ${total} items`}
        onChange={onPageChange}
      />
    </div>
  );
}