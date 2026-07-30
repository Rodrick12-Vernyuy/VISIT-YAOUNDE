import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type { Category } from '@/types';

export function useCategories() {
  return useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const res = await api.get<{ categories: Category[] }>('/categories');
      return res.data.categories;
    },
    staleTime: 5 * 60 * 1000,
  });
}
