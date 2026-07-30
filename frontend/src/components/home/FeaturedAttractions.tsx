'use client';

import { useAttractions } from '@/lib/queries/attractions';
import { AttractionCard } from '@/components/attractions/AttractionCard';

export function FeaturedAttractions() {
  const { data, isLoading } = useAttractions({ featured: true, pageSize: 6, sort: 'newest' });

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 3 }).map((_, index) => (
          <div key={index} className="aspect-[4/5] animate-pulse rounded-xl bg-muted" />
        ))}
      </div>
    );
  }

  if (!data?.items.length) {
    return <p className="text-sm text-muted-foreground">Featured attractions will appear here soon.</p>;
  }

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {data.items.map((attraction) => (
        <AttractionCard key={attraction.id} attraction={attraction} />
      ))}
    </div>
  );
}
