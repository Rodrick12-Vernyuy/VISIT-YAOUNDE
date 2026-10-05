'use client';

import { Play } from 'lucide-react';
import { useState } from 'react';

const VIDEOS: Record<string, { id: string; title: string; source: string }> = {
  // Published by Visit Cameroon and specifically about this monument.
  'reunification-monument': { id: 'm33nw9RrEBY', title: 'Monument de la Réunification, Yaoundé', source: 'Visit Cameroon' },
};

export function AttractionVideo({ slug, name }: { slug: string; name: string }) {
  const video = VIDEOS[slug];
  const [loaded, setLoaded] = useState(false);
  if (!video) return null;

  return (
    <section aria-labelledby="location-video-heading">
      <h2 id="location-video-heading" className="font-display text-xl font-semibold">Watch before you visit</h2>
      <div className="relative mt-3 aspect-video overflow-hidden rounded-xl bg-muted">
        {loaded ? (
          <iframe
            className="absolute inset-0 h-full w-full"
            src={`https://www.youtube-nocookie.com/embed/${video.id}?rel=0`}
            title={`${name}: ${video.title}`}
            loading="lazy"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        ) : (
          <button type="button" onClick={() => setLoaded(true)} className="flex h-full w-full flex-col items-center justify-center gap-3 bg-gradient-to-br from-black/75 to-black/45 p-6 text-center text-white transition hover:from-black/65 hover:to-black/35 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2">
            <span className="rounded-full bg-white/95 p-4 text-primary"><Play className="h-6 w-6 fill-current" aria-hidden="true" /></span>
            <span className="font-medium">Play location video</span>
            <span className="text-sm text-white/80">Source: {video.source}</span>
          </button>
        )}
      </div>
    </section>
  );
}
