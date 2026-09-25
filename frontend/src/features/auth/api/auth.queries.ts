import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { authService } from '@/services/auth.service';
import type { LoginRequest, LoginResponse, RegisterRequest, ForgotPasswordRequest, ResetPasswordRequest } from '../types/auth.types';
import { useAuthStore } from '@/stores/authStore';
import { useOrgStore } from '@/stores/orgStore';
import { ROUTES } from '@/routes/paths';

export function useLoginMutation() {
  const navigate = useNavigate();
  const setTokens = useAuthStore((state) => state.setTokens);
  const setUser = useAuthStore((state) => state.setUser);
  const setOrganizations = useOrgStore((state) => state.setOrganizations);
  const setActiveOrganization = useOrgStore((state) => state.setActiveOrganization);

  return useMutation({
    mutationFn: (payload: LoginRequest) => authService.login(payload),
    onSuccess: (data) => {
      setTokens(data.token, data.refreshToken);
      setUser({
        id: data.id,
        name: data.username,
        username: data.username,
        email: data.email,
      });

      const orgs = data.organizations ?? [];
      setOrganizations(orgs);

      if (orgs.length > 0) {
        const active =
          orgs.find((o) => o.id === data.currentOrganizationId) || orgs[0];
        setActiveOrganization(active ?? null);
        navigate(ROUTES.dashboard, { replace: true });
      } else {
        setActiveOrganization(null);
        navigate(ROUTES.organizations.create, { replace: true });
      }
    },
  });
}

export function useRegisterMutation() {
  const navigate = useNavigate();
  const setTokens = useAuthStore((state) => state.setTokens);
  const setUser = useAuthStore((state) => state.setUser);
  const setOrganizations = useOrgStore((state) => state.setOrganizations);
  const setActiveOrganization = useOrgStore((state) => state.setActiveOrganization);

  return useMutation<{ join: boolean; data?: LoginResponse }, unknown, RegisterRequest>({
    mutationFn: async (payload: RegisterRequest) => {
      // 1. Register account (creates organization or pending join request) atomically
      await authService.register({
        username: payload.username,
        email: payload.email,
        fullName: payload.fullName,
        password: payload.password,
        organization: payload.organization,
        joinOrganizationSlug: payload.joinOrganizationSlug,
      });

      // 2. Join-request signup: login stays blocked until the owner approves
      if (payload.joinOrganizationSlug) {
        return { join: true };
      }

      // 3. Auto-authorize to obtain JWT session
      const loginData = await authService.login({
        identifier: payload.username,
        password: payload.password,
      });
      return { join: false, data: loginData };
    },
    onSuccess: (result) => {
      if (result.join) {
        navigate(ROUTES.login, { replace: true });
        return;
      }
      const data = result.data!;
      setTokens(data.token, data.refreshToken);
      setUser({
        id: data.id,
        name: data.username,
        username: data.username,
        email: data.email,
      });
      const orgs = data.organizations ?? [];
      setOrganizations(orgs);
      const active =
        orgs.find((o) => o.id === data.currentOrganizationId) || orgs[0];
      setActiveOrganization(active ?? null);
      navigate(ROUTES.dashboard, { replace: true });
    },
  });
}

export function useLogoutMutation() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const refreshToken = useAuthStore((state) => state.refreshToken);
  const clearAuth = useAuthStore((state) => state.clear);
  const clearOrg = useOrgStore((state) => state.clear);

  return useMutation({
    mutationFn: async () => {
      const organizationId = useOrgStore.getState().activeOrganization?.id;
      if (refreshToken) {
        await authService.logout(refreshToken, organizationId);
      }
    },
    onSettled: () => {
      clearAuth();
      clearOrg();
      queryClient.clear();
      navigate(ROUTES.login, { replace: true });
    },
  });
}

export function useForgotPasswordMutation() {
  return useMutation({
    mutationFn: (payload: ForgotPasswordRequest) => authService.forgotPassword(payload),
  });
}

export function useResetPasswordMutation() {
  return useMutation({
    mutationFn: (payload: ResetPasswordRequest) => authService.resetPassword(payload),
  });
}