import { useAuthStore } from '@/stores/authStore';
import { useOrgStore } from '@/stores/orgStore';

export function useAuth() {
  const user = useAuthStore((state) => state.user);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const accessToken = useAuthStore((state) => state.accessToken);

  return { user, isAuthenticated, accessToken };
}

export function useActiveOrg() {
  const activeOrganization = useOrgStore((state) => state.activeOrganization);
  return { activeOrganization };
}