import { Suspense } from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { queryClient } from '@/lib/queryClient';
import { AntdProvider } from './AntdProvider';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

interface AppProvidersProps {
  children: React.ReactNode;
}

export function AppProviders({ children }: AppProvidersProps) {
  return (
    <QueryClientProvider client={queryClient}>
      <AntdProvider>
        <Suspense fallback={<LoadingSpinner fullScreen />}>{children}</Suspense>
        <ReactQueryDevtools initialIsOpen={false} />
      </AntdProvider>
    </QueryClientProvider>
  );
}