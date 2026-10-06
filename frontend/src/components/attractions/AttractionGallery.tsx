'use client';

import Image from 'next/image';
import { ChevronLeft, ChevronRight, Expand, X } from 'lucide-react';
import { useState } from 'react';
import { cn, resolveImageUrl, resolveThumbnailUrl } from '@/lib/utils';
import type { AttractionImage } from '@/types';

export function AttractionGallery({ images, name }: { images: AttractionImage[]; name: string }) {
  const sorted = [...images].sort((a, b) => (b.isCover ? 1 : 0) - (a.isCover ? 1 : 0) || a.position - b.position);
  const [activeIndex, setActiveIndex] = useState(0);
  const [unavailable, setUnavailable] = useState<string[]>([]);
  const [isExpanded, setIsExpanded] = useState(false);

  if (!sorted.length) return <div className="flex aspect-video items-center justify-center rounded-xl bg-muted text-muted-foreground">Photos coming soon</div>;

  const active = sorted[activeIndex] ?? sorted[0];
  const availableCount = sorted.filter((image) => !unavailable.includes(image.id)).length;
  const move = (direction: 1 | -1) => {
    for (let offset = 1; offset <= sorted.length; offset += 1) {
      const next = (activeIndex + direction * offset + sorted.length) % sorted.length;
      if (!unavailable.includes(sorted[next].id)) return setActiveIndex(next);
    }
  };
  const markUnavailable = (id: string) => {
    setUnavailable((current) => (current.includes(id) ? current : [...current, id]));
    move(1);
  };
  const imageAlt = active.altText ?? `${name} — photo ${activeIndex + 1}`;

  return (
    <div className="space-y-3">
      <div className="relative aspect-video w-full overflow-hidden rounded-xl bg-muted">
        {availableCount > 0 && !unavailable.includes(active.id) ? (
          <Image src={resolveImageUrl(active.url)} alt={imageAlt} fill priority sizes="(min-width: 1024px) 800px, 100vw" className="object-cover" onError={() => markUnavailable(active.id)} />
        ) : <div className="flex h-full items-center justify-center text-muted-foreground">Photos are temporarily unavailable</div>}
        {sorted.length > 1 && availableCount > 1 && <>
          <button type="button" aria-label="Previous photo" onClick={() => move(-1)} className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-background/90 p-2 shadow-sm transition hover:bg-background focus:outline-none focus:ring-2 focus:ring-primary"><ChevronLeft className="h-5 w-5" aria-hidden="true" /></button>
          <button type="button" aria-label="Next photo" onClick={() => move(1)} className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-background/90 p-2 shadow-sm transition hover:bg-background focus:outline-none focus:ring-2 focus:ring-primary"><ChevronRight className="h-5 w-5" aria-hidden="true" /></button>
        </>}
        {availableCount > 0 && <button type="button" aria-label="View photo larger" onClick={() => setIsExpanded(true)} className="absolute bottom-3 right-3 rounded-md bg-background/90 p-2 shadow-sm transition hover:bg-background focus:outline-none focus:ring-2 focus:ring-primary"><Expand className="h-4 w-4" aria-hidden="true" /></button>}
        <span className="absolute bottom-3 left-3 rounded-md bg-background/90 px-2.5 py-1 text-sm font-medium shadow-sm">{activeIndex + 1} / {sorted.length}</span>
      </div>
      {sorted.length > 1 && <div className="flex gap-2 overflow-x-auto pb-1" aria-label={`${name} photo gallery`}>
        {sorted.map((image, index) => <button key={image.id} type="button" aria-label={`Show photo ${index + 1}`} aria-current={active.id === image.id} onClick={() => setActiveIndex(index)} className={cn('relative h-16 w-24 shrink-0 overflow-hidden rounded-lg border-2 transition-colors focus:outline-none focus:ring-2 focus:ring-primary', active.id === image.id ? 'border-primary' : 'border-transparent', unavailable.includes(image.id) && 'opacity-40')}>
          <Image src={resolveThumbnailUrl(image.url)} alt="" fill sizes="96px" className="object-cover" onError={() => setUnavailable((current) => (current.includes(image.id) ? current : [...current, image.id]))} />
        </button>)}
      </div>}
      {isExpanded && availableCount > 0 && <div role="dialog" aria-modal="true" aria-label={`${name} photo viewer`} className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4" onClick={() => setIsExpanded(false)}>
        <div className="relative h-full w-full max-w-6xl" onClick={(event) => event.stopPropagation()}>
          <Image src={resolveImageUrl(active.url)} alt={imageAlt} fill sizes="100vw" className="object-contain" onError={() => markUnavailable(active.id)} />
          <button type="button" aria-label="Close photo viewer" onClick={() => setIsExpanded(false)} className="absolute right-2 top-2 rounded-full bg-background/90 p-2 text-foreground"><X className="h-5 w-5" aria-hidden="true" /></button>
        </div>
      </div>}
    </div>
  );
}
