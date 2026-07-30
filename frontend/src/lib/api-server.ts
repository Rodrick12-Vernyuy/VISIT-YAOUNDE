import type { Attraction } from '@/types';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000/api/v1';

export async function fetchAttractionBySlug(slug: string) {
  const res = await fetch(`${API_URL}/attractions/${slug}`, { next: { revalidate: 60 } });
  if (res.status === 404) return null;
  if (!res.ok) throw new Error('Failed to load attraction');
  return (await res.json()) as { attraction: Attraction; nearby: Attraction[] };
}
