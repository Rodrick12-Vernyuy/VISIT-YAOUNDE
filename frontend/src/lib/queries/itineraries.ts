import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type { Itinerary } from '@/types';

export function useItineraries(enabled: boolean) {
  return useQuery({
    queryKey: ['itineraries'],
    enabled,
    queryFn: async () => (await api.get<{ itineraries: Itinerary[] }>('/itineraries')).data.itineraries,
  });
}

/** Adds to the user's existing first trip, creating a clearly named trip on their first save. */
export function useAddToItinerary() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (attractionId: string) => {
      const itineraries = (await api.get<{ itineraries: Itinerary[] }>('/itineraries')).data.itineraries;
      if (itineraries.some((itinerary) => itinerary.items.some((item) => item.attractionId === attractionId))) {
        throw new Error('This attraction is already in your itinerary.');
      }

      let itinerary = itineraries[0];
      if (!itinerary) {
        const today = new Date();
        const endDate = new Date(today);
        endDate.setDate(endDate.getDate() + 6);
        itinerary = (
          await api.post<{ itinerary: Itinerary }>('/itineraries', {
            title: 'My Yaoundé itinerary',
            description: 'Places saved while exploring Visit Yaoundé.',
            startDate: today.toISOString(),
            endDate: endDate.toISOString(),
          })
        ).data.itinerary;
      }

      await api.post(`/itineraries/${itinerary.id}/items`, {
        attractionId,
        dayNumber: 1,
        order: itinerary.items.length,
      });
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['itineraries'] }),
  });
}
