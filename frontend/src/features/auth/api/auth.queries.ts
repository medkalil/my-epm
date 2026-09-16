import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { authService } from '@/services/auth.service';
import type { LoginRequest, RegisterRequest } from '../types/auth.types';
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

  return useMutation({
    mutationFn: async (payload: RegisterRequest) => {
      // 1. Register account + provision organization atomically on the backend
      await authService.register({
        username: payload.username,
        email: payload.email,
        fullName: payload.fullName,
        password: payload.password,
        organization: payload.organization,
      });

      // 2. Auto-authenticate to obtain JWT session
      const loginData = await authService.login({
        identifier: payload.username,
        password: payload.password,
      });
      return loginData;
    },
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
      const active =
        orgs.find((o) => o.id === data.currentOrganizationId) || orgs[0];
      setActiveOrganization(active ?? null);
      navigate(ROUTES.dashboard, { replace: true });
    },
  });
}