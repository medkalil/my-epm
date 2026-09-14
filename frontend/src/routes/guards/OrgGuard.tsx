import { Navigate, Outlet } from 'react-router-dom';
import { useOrgStore } from '@/stores/orgStore';
import { ROUTES } from '@/routes/paths';

export function OrgGuard() {
  const hasOrganizations = useOrgStore((state) => state.organizations.length > 0);

  if (!hasOrganizations) {
    return <Navigate to={ROUTES.organizations.create} replace />;
  }

  return <Outlet />;
}