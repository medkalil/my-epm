import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { authService } from '@/services/auth.service';
import type { LoginRequest, RegisterRequest } from '../types/auth.types';
import { useAuthStore } from '@/stores/authStore';
import { ROUTES } from '@/routes/paths';

export function useLoginMutation() {
  const navigate = useNavigate();
  const setTokens = useAuthStore((state) => state.setTokens);
  const setUser = useAuthStore((state) => state.setUser);

  return useMutation({
    mutationFn: (payload: LoginRequest) => authService.login(payload),
    onSuccess: ({ token, refreshToken, user }) => {
      setTokens(token, refreshToken);
      setUser(user);
      navigate(ROUTES.dashboard, { replace: true });
    },
  });
}

export function useRegisterMutation() {
  const navigate = useNavigate();

  return useMutation({
    mutationFn: (payload: RegisterRequest) => authService.register(payload),
    onSuccess: () => {
      navigate(ROUTES.login);
    },
  });
}