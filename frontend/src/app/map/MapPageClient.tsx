'use client';

import { useState } from 'react';
import { AttractionMapClient } from '@/components/map/AttractionMapClient';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAttractions } from '@/lib/queries/attractions';
import { useCategories } from '@/lib/queries/categories';

const ANY = 'any';

export default function MapPageClient({ destinationSlug }: { destinationSlug?: string }) {
  const [category, setCategory] = useState('');
  const { data: categories } = useCategories();
  const { data, isLoading } = useAttractions({ category: category || undefined, pageSize: 100 });

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold">Live map</h1>
          <p className="mt-1 text-muted-foreground">Every published attraction, plotted across Yaoundé.</p>
        </div>
        <Select value={category || ANY} onValueChange={(next) => setCategory(next === ANY ? '' : next)}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filter by category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ANY}>All categories</SelectItem>
            {categories?.map((cat) => (
              <SelectItem key={cat.id} value={cat.slug}>
                {cat.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <div className="h-[70vh] w-full animate-pulse rounded-xl bg-muted" />
      ) : (
        <AttractionMapClient
          attractions={data?.items ?? []}
          height="70vh"
          zoom={12}
          destinationSlug={destinationSlug}
        />
      )}
    </div>
  );
}