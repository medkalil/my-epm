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
      setUser({ id: data.id, name: data.username, username: data.username });

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
      // 1. Register with backend
      await authService.register({
        username: payload.username,
        password: payload.password,
      });

      // 2. Auto-authenticate to obtain JWT session
      const loginData = await authService.login({
        username: payload.username,
        password: payload.password,
      });
      return loginData;
    },
    onSuccess: (data) => {
      setTokens(data.token, data.refreshToken);
      setUser({ id: data.id, name: data.username, username: data.username });
      setOrganizations(data.organizations ?? []);
      setActiveOrganization(null);
      // Navigate to guided organization creation
      navigate(ROUTES.organizations.create, { replace: true });
    },
  });
}