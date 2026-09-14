import type { ThemeConfig } from 'antd';
import { theme as antdTheme } from 'antd';

export const brand = {
  primary: '#4f46e5',
  primaryHover: '#6366f1',
  success: '#10b981',
  warning: '#f59e0b',
  error: '#ef4444',
  info: '#3b82f6',
  sidebarBg: '#0f172a',
  sidebarText: '#94a3b8',
  sidebarActive: '#4f46e5',
} as const;

export const lightTheme: ThemeConfig = {
  algorithm: antdTheme.defaultAlgorithm,
  token: {
    colorPrimary: brand.primary,
    colorSuccess: brand.success,
    colorWarning: brand.warning,
    colorError: brand.error,
    colorInfo: brand.info,
    borderRadius: 8,
    fontFamily:
      "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
  },
  components: {
    Layout: {
      siderBg: brand.sidebarBg,
      headerBg: '#ffffff',
      bodyBg: '#f8fafc',
    },
    Menu: {
      darkItemBg: brand.sidebarBg,
      darkItemSelectedBg: brand.sidebarActive,
      darkItemColor: brand.sidebarText,
    },
  },
};

export const darkTheme: ThemeConfig = {
  algorithm: antdTheme.darkAlgorithm,
  token: {
    colorPrimary: brand.primaryHover,
    colorSuccess: brand.success,
    colorWarning: brand.warning,
    colorError: brand.error,
    colorInfo: brand.info,
    borderRadius: 8,
    fontFamily:
      "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
  },
  components: {
    Layout: {
      siderBg: '#020617',
    },
  },
};
