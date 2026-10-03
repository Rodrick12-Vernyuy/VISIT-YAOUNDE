'use client';

import Image from 'next/image';
import Link from 'next/link';
import { MapPin } from 'lucide-react';
import { useAttractions } from '@/lib/queries/attractions';
import { useItineraries } from '@/lib/queries/itineraries';
import { useAuthStore } from '@/stores/auth.store';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { resolveImageUrl } from '@/lib/utils';

export default function TripsPage() {
  const user = useAuthStore((state) => state.user);
  const { data: itineraries, isLoading } = useItineraries(Boolean(user));
  const { data: attractions } = useAttractions({ pageSize: 100 });

  if (!user) return <div className="mx-auto max-w-4xl px-4 py-24 text-center text-muted-foreground">Please log in to view your itinerary.</div>;

  const places = new Map((attractions?.items ?? []).map((attraction) => [attraction.id, attraction]));
  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="font-display text-3xl font-bold">My Trips</h1>
      <p className="mt-1 text-muted-foreground">Places you have saved for your Yaoundé itinerary.</p>
      {isLoading ? <p className="mt-8 text-muted-foreground">Loading your itinerary…</p> : !itineraries?.length ? (
        <p className="mt-8 text-muted-foreground">You have not added any places yet. Browse attractions to start planning.</p>
      ) : (
        <div className="mt-8 space-y-8">
          {itineraries.map((itinerary) => (
            <section key={itinerary.id}>
              <h2 className="font-display text-2xl font-semibold">{itinerary.title}</h2>
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                {itinerary.items.map((item) => {
                  const place = places.get(item.attractionId);
                  if (!place) return null;
                  const cover = place.images.find((image) => image.isCover) ?? place.images[0];
                  return <Link href={`/attractions/${place.slug}`} key={item.id}><Card className="h-full overflow-hidden hover:shadow-md"><CardHeader className="p-0">{cover && <div className="relative aspect-[16/8]"><Image src={resolveImageUrl(cover.url)} alt={cover.altText ?? place.name} fill className="object-cover" /></div>}</CardHeader><CardContent className="space-y-2 p-4"><CardTitle>{place.name}</CardTitle><p className="line-clamp-2 text-sm text-muted-foreground">{place.shortDescription}</p><p className="flex items-center gap-1 text-sm text-muted-foreground"><MapPin className="h-4 w-4" />{place.address}</p><p className="text-xs text-muted-foreground">{place.category.name} · {place.latitude}, {place.longitude}</p></CardContent></Card></Link>;
                })}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
