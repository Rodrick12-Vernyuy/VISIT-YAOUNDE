import type { Attraction } from '@/types';

// Server Components run inside the frontend container, where NEXT_PUBLIC_API_URL
// (baked in for the browser as http://localhost:4000/...) would resolve back to
// the frontend container itself. API_URL is a server-only override pointing at
// the gateway's Docker-network address.
const API_URL = process.env.API_URL ?? process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000/api/v1';

export async function fetchAttractionBySlug(slug: string) {
  const res = await fetch(`${API_URL}/attractions/${slug}`, { next: { revalidate: 60 } });
  if (res.status === 404) return null;
  if (!res.ok) throw new Error('Failed to load attraction');
  return (await res.json()) as { attraction: Attraction; nearby: Attraction[] };
}
