import { prisma } from '../config/prisma';
import { COMPLETE_LOCAL_MEDIA_BY_SLUG } from '../data/local-attraction-media';

/**
 * Makes every seeded catalogue record point at its checked-in public gallery.
 * Safe at boot: it is idempotent and replaces only the known seeded records.
 */
export async function syncLocalMedia() {
  const attractions = await prisma.attraction.findMany({ select: { id: true, slug: true, images: { select: { url: true } } } });
  for (const attraction of attractions) {
    const media = COMPLETE_LOCAL_MEDIA_BY_SLUG.get(attraction.slug);
    if (!media) continue;
    const alreadyLocal = attraction.images.length === media.images.length
      && attraction.images.every((image) => image.url.startsWith(`/images/attractions/${attraction.slug}/`));
    const isLegacyCommonsGallery = attraction.images.length > 0
      && attraction.images.every((image) => /^https:\/\/(?:upload\.)?wikimedia\.org\//.test(image.url));
    // Do not overwrite photos managed by an administrator or a future media
    // provider. Only replace the previous Commons bootstrap set (or fill an
    // empty gallery) with the checked-in catalogue files.
    if (alreadyLocal || (!isLegacyCommonsGallery && attraction.images.length > 0)) continue;
    await prisma.$transaction([
      prisma.attractionImage.deleteMany({ where: { attractionId: attraction.id } }),
      prisma.attractionImage.createMany({
        data: media.images.map((image, position) => ({
          attractionId: attraction.id, url: image.file, altText: image.alt, position, isCover: position === 0,
        })),
      }),
    ]);
  }
}
