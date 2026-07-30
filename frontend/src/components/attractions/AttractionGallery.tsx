'use client';

import Image from 'next/image';
import { useState } from 'react';
import { cn, resolveImageUrl } from '@/lib/utils';
import type { AttractionImage } from '@/types';

export function AttractionGallery({ images, name }: { images: AttractionImage[]; name: string }) {
  const sorted = [...images].sort((a, b) => (b.isCover ? 1 : 0) - (a.isCover ? 1 : 0) || a.position - b.position);
  const [active, setActive] = useState(sorted[0]);

  if (!sorted.length) {
    return <div className="flex aspect-video items-center justify-center rounded-xl bg-muted text-muted-foreground">No images yet</div>;
  }

  return (
    <div className="space-y-3">
      <div className="relative aspect-video w-full overflow-hidden rounded-xl bg-muted">
        <Image
          src={resolveImageUrl(active.url)}
          alt={active.altText ?? name}
          fill
          priority
          sizes="(min-width: 1024px) 800px, 100vw"
          className="object-cover"
        />
      </div>
      {sorted.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {sorted.map((image) => (
            <button
              key={image.id}
              type="button"
              onClick={() => setActive(image)}
              className={cn(
                'relative h-16 w-24 shrink-0 overflow-hidden rounded-lg border-2 transition-colors',
                active.id === image.id ? 'border-primary' : 'border-transparent'
              )}
            >
              <Image src={resolveImageUrl(image.url)} alt={image.altText ?? name} fill sizes="96px" className="object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
