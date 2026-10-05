import { prisma } from '../config/prisma';

type CommonsPage = {
  imageinfo?: Array<{ url?: string; extmetadata?: { ImageDescription?: { value?: string } } }>;
};

/**
 * Backfills the public gallery with files returned by Wikimedia Commons for
 * the attraction's own name.  Commons hosts the resulting URLs, so they work
 * from Render as well as local development and do not depend on ephemeral
 * container storage.
 */
async function findCommonsPhotos(name: string): Promise<Array<{ url: string; altText: string }>> {
  // Existing seed data from early releases contained a few UTF-8 strings
  // decoded as Latin-1. Correct them for the external Commons search while
  // leaving the public attraction record untouched.
  const searchName = name
    .replaceAll('ÃƒÂ©', 'é').replaceAll('Ã©', 'é').replaceAll('Ã¨', 'è')
    .replaceAll('Ã´', 'ô').replaceAll('Ã»', 'û');
  const params = new URLSearchParams({
    action: 'query', generator: 'search', gsrsearch: `"${searchName}"`,
    gsrnamespace: '6', gsrlimit: '12', prop: 'imageinfo', iiprop: 'url|extmetadata', format: 'json', origin: '*',
  });
  const response = await fetch(`https://commons.wikimedia.org/w/api.php?${params}`, { signal: AbortSignal.timeout(12_000) });
  if (!response.ok) throw new Error(`Wikimedia Commons returned ${response.status}`);
  const payload = await response.json() as { query?: { pages?: Record<string, CommonsPage> } };
  return Object.values(payload.query?.pages ?? {})
    .map((page) => page.imageinfo?.[0])
    .filter((info): info is NonNullable<typeof info> & { url: string } => Boolean(info?.url && /\.(avif|jpe?g|png|webp)$/i.test(info.url)))
    .map((info) => ({ url: info.url, altText: info.extmetadata?.ImageDescription?.value?.replace(/<[^>]*>/g, '').trim() || name }));
}

export async function syncAttractionMedia() {
  const attractions = await prisma.attraction.findMany({ include: { images: { orderBy: { position: 'asc' } } } });
  for (const attraction of attractions) {
    const existingUrls = new Set(attraction.images.map((image) => image.url));
    const required = Math.max(0, 3 - attraction.images.length);
    if (!required) continue;
    try {
      const photos = await findCommonsPhotos(attraction.name);
      const additions = photos.filter((photo) => !existingUrls.has(photo.url)).slice(0, required);
      for (const [offset, photo] of additions.entries()) {
        await prisma.attractionImage.create({
          data: { attractionId: attraction.id, url: photo.url, altText: photo.altText, position: attraction.images.length + offset, isCover: attraction.images.length + offset === 0 },
        });
      }
      if (additions.length < required) console.warn(`Only found ${additions.length} Wikimedia photos for ${attraction.name}`);
    } catch (error) {
      // Media enrichment must never prevent the API from starting.
      console.warn(`Could not enrich media for ${attraction.name}:`, error instanceof Error ? error.message : error);
    }
  }
}
