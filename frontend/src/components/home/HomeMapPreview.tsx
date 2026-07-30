'use client';

import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { AttractionMapClient } from '@/components/map/AttractionMapClient';
import { Button } from '@/components/ui/button';
import { useAttractions } from '@/lib/queries/attractions';

export function HomeMapPreview() {
  const { data, isLoading } = useAttractions({ pageSize: 20, sort: 'newest' });

  return (
    <div className="space-y-4">
      {isLoading ? (
        <div className="h-[400px] w-full animate-pulse rounded-xl bg-muted" />
      ) : (
        <AttractionMapClient attractions={data?.items ?? []} height="400px" zoom={12} />
      )}
      <Button variant="outline" asChild>
        <Link href="/map" className="inline-flex items-center gap-2">
          Open full live map <ArrowRight className="h-4 w-4" />
        </Link>
      </Button>
    </div>
  );
}
