import { EmptyState } from '@/components/ui/EmptyState';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '@/routes/paths';

export function LoginRequired() {
  const navigate = useNavigate();
  return (
    <EmptyState
      description="You need to sign in to access this page."
      actionLabel="Sign in"
      onAction={() => navigate(ROUTES.login)}
    />
  );
}