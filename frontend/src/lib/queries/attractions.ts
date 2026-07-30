import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type { Attraction, AttractionListParams, PaginatedAttractions } from '@/types';

export function useAttractions(params: AttractionListParams) {
  return useQuery({
    queryKey: ['attractions', params],
    queryFn: async () => {
      const res = await api.get<PaginatedAttractions>('/attractions', { params });
      return res.data;
    },
  });
}

export function useAttraction(slug: string) {
  return useQuery({
    queryKey: ['attraction', slug],
    queryFn: async () => {
      const res = await api.get<{ attraction: Attraction; nearby: Attraction[] }>(`/attractions/${slug}`);
      return res.data;
    },
    enabled: Boolean(slug),
  });
}

export function useAdminAttractions(params: AttractionListParams) {
  return useQuery({
    queryKey: ['admin-attractions', params],
    queryFn: async () => {
      const res = await api.get<PaginatedAttractions>('/attractions/admin/all', { params });
      return res.data;
    },
  });
}

export function useAdminAttraction(id: string) {
  return useQuery({
    queryKey: ['admin-attraction', id],
    queryFn: async () => {
      const res = await api.get<{ attraction: Attraction }>(`/attractions/admin/${id}`);
      return res.data.attraction;
    },
    enabled: Boolean(id),
  });
}

export interface AttractionInput {
  name: string;
  shortDescription: string;
  description: string;
  history?: string;
  district: string;
  address: string;
  latitude: number;
  longitude: number;
  openingHours: string;
  entryFee: string;
  contactPhone?: string;
  contactEmail?: string;
  estimatedVisitDuration?: string;
  bestVisitingTime?: string;
  safetyInfo?: string;
  accessibilityInfo?: string;
  visitorTips?: string;
  isFeatured?: boolean;
  isPublished?: boolean;
  categoryId: string;
}

export function useCreateAttraction() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: AttractionInput) => {
      const res = await api.post<{ attraction: Attraction }>('/attractions', input);
      return res.data.attraction;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['attractions'] });
      queryClient.invalidateQueries({ queryKey: ['admin-attractions'] });
      queryClient.invalidateQueries({ queryKey: ['admin-attraction'] });
    },
  });
}

export function useUpdateAttraction(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: Partial<AttractionInput>) => {
      const res = await api.patch<{ attraction: Attraction }>(`/attractions/${id}`, input);
      return res.data.attraction;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['attractions'] });
      queryClient.invalidateQueries({ queryKey: ['admin-attractions'] });
      queryClient.invalidateQueries({ queryKey: ['admin-attraction'] });
    },
  });
}

export function useDeleteAttraction() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/attractions/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['attractions'] });
      queryClient.invalidateQueries({ queryKey: ['admin-attractions'] });
      queryClient.invalidateQueries({ queryKey: ['admin-attraction'] });
    },
  });
}

export function useUploadAttractionImages(attractionId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (files: File[]) => {
      const formData = new FormData();
      files.forEach((file) => formData.append('images', file));
      const res = await api.post(`/attractions/${attractionId}/gallery`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['attractions'] });
      queryClient.invalidateQueries({ queryKey: ['admin-attractions'] });
      queryClient.invalidateQueries({ queryKey: ['admin-attraction'] });
    },
  });
}

export function useSetCoverImage(attractionId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (imageId: string) => {
      await api.patch(`/attractions/${attractionId}/gallery/${imageId}/cover`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['attractions'] });
      queryClient.invalidateQueries({ queryKey: ['admin-attractions'] });
      queryClient.invalidateQueries({ queryKey: ['admin-attraction'] });
    },
  });
}

export function useRemoveImage(attractionId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (imageId: string) => {
      await api.delete(`/attractions/${attractionId}/gallery/${imageId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['attractions'] });
      queryClient.invalidateQueries({ queryKey: ['admin-attractions'] });
      queryClient.invalidateQueries({ queryKey: ['admin-attraction'] });
    },
  });
}
