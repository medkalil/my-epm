import { Navigate, Outlet } from 'react-router-dom';
import { useCan } from '@/hooks/useCan';
import { ROUTES } from '@/routes/paths';

export function RequireAdmin() {
  const { isAdmin } = useCan();

  if (!isAdmin) {
    return <Navigate to={ROUTES.dashboard} replace />;
  }

  return <Outlet />;
}