import { Button } from 'antd';
import type { EmptyProps } from 'antd';
import { Empty } from 'antd';

interface EmptyStateProps extends EmptyProps {
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function EmptyState({
  description = 'No data found',
  actionLabel,
  onAction,
  ...rest
}: EmptyStateProps) {
  return (
    <Empty
      description={description}
      {...rest}
      style={{ padding: '3rem 0' }}
    >
      {actionLabel && onAction && (
        <Button type="primary" onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </Empty>
  );
}