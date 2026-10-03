'use client';

import { CalendarPlus, Check, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { useAddToItinerary, useItineraries } from '@/lib/queries/itineraries';
import { useAuthStore } from '@/stores/auth.store';

export function AddToItineraryButton({ attractionId, className }: { attractionId: string; className?: string }) {
  const user = useAuthStore((state) => state.user);
  const { data: itineraries } = useItineraries(Boolean(user));
  const addToItinerary = useAddToItinerary();
  const added = itineraries?.some((itinerary) => itinerary.items.some((item) => item.attractionId === attractionId)) ?? false;

  async function add() {
    if (!user) {
      toast.error('Please log in to add places to your itinerary.');
      return;
    }
    try {
      await addToItinerary.mutateAsync(attractionId);
      toast.success('Added to your itinerary.');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'This location could not be added to your itinerary.');
    }
  }

  return (
    <Button type="button" variant={added ? 'secondary' : 'outline'} className={className} onClick={add} disabled={added || addToItinerary.isPending}>
      {addToItinerary.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : added ? <Check className="h-4 w-4" /> : <CalendarPlus className="h-4 w-4" />}
      {added ? 'Added' : 'Add to itinerary'}
    </Button>
  );
}
