'use client';

import dynamic from 'next/dynamic';

export const AttractionMapClient = dynamic(
  () => import('@/components/map/AttractionMap').then((mod) => mod.AttractionMap),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-[480px] w-full animate-pulse items-center justify-center rounded-xl border border-border bg-muted text-sm text-muted-foreground">
        Loading map…
      </div>
    ),
  }
);
