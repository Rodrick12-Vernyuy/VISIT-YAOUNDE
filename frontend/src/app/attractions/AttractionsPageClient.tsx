'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useMemo } from 'react';
import { AttractionCard } from '@/components/attractions/AttractionCard';
import { AttractionFilters, type AttractionFiltersState } from '@/components/attractions/AttractionFilters';
import { Pagination } from '@/components/attractions/Pagination';
import { AttractionMapClient } from '@/components/map/AttractionMapClient';
import { useAttractions } from '@/lib/queries/attractions';

export function AttractionsPageClient() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const filters: AttractionFiltersState = {
    q: searchParams.get('q') ?? '',
    category: searchParams.get('category') ?? '',
    district: searchParams.get('district') ?? '',
    sort: (searchParams.get('sort') as 'newest' | 'name') ?? 'newest',
  };
  const view = (searchParams.get('view') as 'list' | 'map') ?? 'list';
  const page = Number(searchParams.get('page') ?? '1');

  function updateParams(next: Partial<AttractionFiltersState> & { view?: string; page?: number }) {
    const params = new URLSearchParams(searchParams.toString());
    const merged = { ...filters, view, page: 1, ...next };

    Object.entries(merged).forEach(([key, val]) => {
      if (!val || (key === 'page' && val === 1) || (key === 'sort' && val === 'newest') || (key === 'view' && val === 'list')) {
        params.delete(key);
      } else {
        params.set(key, String(val));
      }
    });

    router.push(`/attractions?${params.toString()}`);
  }

  const queryParams = useMemo(
    () => ({
      q: filters.q || undefined,
      category: filters.category || undefined,
      district: filters.district || undefined,
      sort: filters.sort,
      page,
      pageSize: 12,
    }),
    [filters.q, filters.category, filters.district, filters.sort, page]
  );

  const { data, isLoading, isError } = useAttractions(queryParams);

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="font-display text-3xl font-bold">Attractions</h1>
      <p className="mt-1 text-muted-foreground">
        {data ? `${data.total} attraction${data.total === 1 ? '' : 's'} across Yaoundé` : 'Browse Yaoundé’s attractions'}
      </p>

      <div className="mt-6">
        <AttractionFilters
          value={filters}
          onChange={(next) => updateParams(next)}
          view={view}
          onViewChange={(next) => updateParams({ view: next })}
        />
      </div>

      <div className="mt-8">
        {isError ? (
          <p role="alert" className="py-16 text-center text-destructive">
            Attractions could not be loaded. Please refresh the page and try again.
          </p>
        ) : view === 'map' ? (
          <AttractionMapClient attractions={data?.items ?? []} height="600px" />
        ) : isLoading ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, index) => (
              <div key={index} className="aspect-[4/5] animate-pulse rounded-xl bg-muted" />
            ))}
          </div>
        ) : data?.items.length ? (
          <>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {data.items.map((attraction) => (
                <AttractionCard key={attraction.id} attraction={attraction} />
              ))}
            </div>
            <Pagination page={data.page} totalPages={data.totalPages} onPageChange={(next) => updateParams({ page: next })} />
          </>
        ) : (
          <p className="py-16 text-center text-muted-foreground">No attractions match your filters yet.</p>
        )}
      </div>
    </div>
  );
}
