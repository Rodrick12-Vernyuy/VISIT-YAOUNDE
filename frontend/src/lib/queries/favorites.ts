import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { useAuthStore } from '@/stores/auth.store';
import type { Favorite } from '@/types';

export function useFavorites() {
  const user = useAuthStore((state) => state.user);
  return useQuery({
    queryKey: ['favorites'],
    queryFn: async () => {
      const res = await api.get<{ favorites: Favorite[] }>('/favorites');
      return res.data.favorites;
    },
    enabled: Boolean(user),
  });
}

export function useIsFavorited(attractionId: string) {
  const { data: favorites } = useFavorites();
  return Boolean(favorites?.some((favorite) => favorite.attraction.id === attractionId));
}

export function useToggleFavorite(attractionId: string) {
  const queryClient = useQueryClient();
  const isFavorited = useIsFavorited(attractionId);

  return useMutation({
    mutationFn: async () => {
      if (isFavorited) {
        await api.delete(`/favorites/${attractionId}`);
      } else {
        await api.post(`/favorites/${attractionId}`);
      }
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['favorites'] }),
  });
}
