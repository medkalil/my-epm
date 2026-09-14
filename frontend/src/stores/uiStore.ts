import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { ThemeMode, Locale } from '@/types/common';

interface UiState {
  sidebarCollapsed: boolean;
  themeMode: ThemeMode;
  locale: Locale;
  toggleSidebar: () => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
  setThemeMode: (mode: ThemeMode) => void;
  setLocale: (locale: Locale) => void;
}

export const useUiStore = create<UiState>()(
  persist(
    (set) => ({
      sidebarCollapsed: false,
      themeMode: 'light',
      locale: 'en',
      toggleSidebar: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
      setSidebarCollapsed: (sidebarCollapsed) => set({ sidebarCollapsed }),
      setThemeMode: (themeMode) => set({ themeMode }),
      setLocale: (locale) => set({ locale }),
    }),
    {
      name: 'epm-ui-store',
    },
  ),
);