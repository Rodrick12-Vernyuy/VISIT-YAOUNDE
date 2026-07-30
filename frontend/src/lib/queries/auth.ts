import { useMutation } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { useAuthStore } from '@/stores/auth.store';
import type { AuthUser } from '@/types';

interface AuthResponse {
  user: AuthUser;
  accessToken: string;
}

export function useLogin() {
  const setAuth = useAuthStore((state) => state.setAuth);
  return useMutation({
    mutationFn: async (input: { email: string; password: string }) => {
      const res = await api.post<AuthResponse>('/auth/login', input);
      return res.data;
    },
    onSuccess: (data) => setAuth(data.user, data.accessToken),
  });
}

export function useRegister() {
  const setAuth = useAuthStore((state) => state.setAuth);
  return useMutation({
    mutationFn: async (input: { fullName: string; email: string; password: string }) => {
      const res = await api.post<AuthResponse>('/auth/register', input);
      return res.data;
    },
    onSuccess: (data) => setAuth(data.user, data.accessToken),
  });
}

export function useLogout() {
  const clearAuth = useAuthStore((state) => state.clearAuth);
  return useMutation({
    mutationFn: async () => {
      await api.post('/auth/logout');
    },
    onSettled: () => clearAuth(),
  });
}
