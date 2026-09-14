import { Alert } from 'antd';
import type { ReactNode } from 'react';

interface ErrorStateProps {
  message?: string;
  actions?: ReactNode;
}

export function ErrorState({ message = 'Failed to load data', actions }: ErrorStateProps) {
  return (
    <Alert type="error" showIcon message={message} description={actions} />
  );
}