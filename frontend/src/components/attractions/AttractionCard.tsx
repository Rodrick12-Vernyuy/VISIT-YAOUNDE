import Image from 'next/image';
import Link from 'next/link';
import { Clock, MapPin, Star } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { FavoriteButton } from '@/components/attractions/FavoriteButton';
import { resolveImageUrl } from '@/lib/utils';
import type { Attraction } from '@/types';

export function AttractionCard({ attraction }: { attraction: Attraction }) {
  const cover = attraction.images.find((image) => image.isCover) ?? attraction.images[0];

  return (
    <Link href={`/attractions/${attraction.slug}`} className="group block">
      <Card className="overflow-hidden transition-shadow hover:shadow-lg">
        <div className="relative aspect-[4/3] w-full overflow-hidden bg-muted">
          {cover ? (
            <Image
              src={resolveImageUrl(cover.url)}
              alt={cover.altText ?? attraction.name}
              fill
              sizes="(min-width: 1024px) 320px, (min-width: 640px) 45vw, 90vw"
              className="object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
              No image yet
            </div>
          )}
          <Badge className="absolute left-3 top-3 backdrop-blur">{attraction.category.name}</Badge>
          <FavoriteButton attractionId={attraction.id} className="absolute right-3 top-3" />
        </div>
        <CardContent className="space-y-2 p-4">
          <h3 className="font-display text-lg font-semibold leading-tight">{attraction.name}</h3>
          <p className="line-clamp-2 text-sm text-muted-foreground">{attraction.shortDescription}</p>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 pt-1 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <MapPin className="h-3.5 w-3.5" /> {attraction.district}
            </span>
            {attraction.estimatedVisitDuration && (
              <span className="flex items-center gap-1">
                <Clock className="h-3.5 w-3.5" /> {attraction.estimatedVisitDuration}
              </span>
            )}
            {attraction.reviewCount > 0 && (
              <span className="flex items-center gap-1">
                <Star className="h-3.5 w-3.5 fill-accent text-accent" />
                {attraction.averageRating.toFixed(1)} ({attraction.reviewCount})
              </span>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
