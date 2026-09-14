import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User } from '@/features/user/types/user.types';

interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  setTokens: (accessToken: string, refreshToken: string) => void;
  setUser: (user: User) => void;
  clear: () => void;
}

interface PersistedAuthState {
  user?: User | null;
  accessToken?: string | null;
  refreshToken?: string | null;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      setTokens: (accessToken, refreshToken) =>
        set({ accessToken, refreshToken, isAuthenticated: true }),
      setUser: (user) => set({ user }),
      clear: () =>
        set({ user: null, accessToken: null, refreshToken: null, isAuthenticated: false }),
    }),
    {
      name: 'epm-auth-store',
      partialize: (state) => ({
        user: state.user,
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
      }),
      merge: (persisted, current) => {
        const persistedState = persisted as Partial<PersistedAuthState> | undefined;
        return {
          ...current,
          ...persistedState,
          accessToken: persistedState?.accessToken ?? null,
          refreshToken: persistedState?.refreshToken ?? null,
          isAuthenticated: !!persistedState?.accessToken,
        };
      },
    },
  ),
);