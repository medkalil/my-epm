import { ConfigProvider, App as AntdApp } from 'antd';
import type { ReactNode } from 'react';
import { lightTheme, darkTheme } from '@/config/theme';
import { useUiStore } from '@/stores/uiStore';

interface AntdProviderProps {
  children: ReactNode;
}

export function AntdProvider({ children }: AntdProviderProps) {
  const themeMode = useUiStore((state) => state.themeMode);
  const theme = themeMode === 'dark' ? darkTheme : lightTheme;

  return (
    <ConfigProvider theme={theme}>
      <AntdApp>{children}</AntdApp>
    </ConfigProvider>
  );
}