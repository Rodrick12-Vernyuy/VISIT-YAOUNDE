import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type { PaginatedReviews, Review } from '@/types';

export function useReviews(attractionId: string, page = 1) {
  return useQuery({
    queryKey: ['reviews', attractionId, page],
    queryFn: async () => {
      const res = await api.get<PaginatedReviews>(`/attractions/${attractionId}/reviews`, {
        params: { page, pageSize: 10 },
      });
      return res.data;
    },
    enabled: Boolean(attractionId),
  });
}

function invalidate(queryClient: ReturnType<typeof useQueryClient>, attractionId: string) {
  queryClient.invalidateQueries({ queryKey: ['reviews', attractionId] });
  queryClient.invalidateQueries({ queryKey: ['attraction'] });
  queryClient.invalidateQueries({ queryKey: ['attractions'] });
}

export function useCreateReview(attractionId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: { rating: number; comment: string }) => {
      const res = await api.post<{ review: Review }>(`/attractions/${attractionId}/reviews`, input);
      return res.data.review;
    },
    onSuccess: () => invalidate(queryClient, attractionId),
  });
}

export function useUpdateReview(attractionId: string, reviewId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: { rating?: number; comment?: string }) => {
      const res = await api.patch<{ review: Review }>(`/reviews/${reviewId}`, input);
      return res.data.review;
    },
    onSuccess: () => invalidate(queryClient, attractionId),
  });
}

export function useDeleteReview(attractionId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (reviewId: string) => {
      await api.delete(`/reviews/${reviewId}`);
    },
    onSuccess: () => invalidate(queryClient, attractionId),
  });
}

export function useToggleReviewHelpful(attractionId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (reviewId: string) => {
      const res = await api.post<{ helpful: boolean }>(`/reviews/${reviewId}/helpful`);
      return res.data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['reviews', attractionId] }),
  });
}
