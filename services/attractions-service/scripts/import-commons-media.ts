/*
 * One-time/repeatable catalogue importer. Run from services/attractions-service:
 *   npm run import:local-media
 *
 * It deliberately only accepts Commons files with a reuse-friendly licence and
 * writes a source/author/licence record alongside the downloaded assets.
 */
import { mkdir, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { LOCAL_ATTRACTION_MEDIA } from '../src/data/local-attraction-media';

type CommonsInfo = { thumburl?: string; descriptionurl?: string; extmetadata?: Record<string, { value?: string }> };
type CommonsPage = { imageinfo?: CommonsInfo[] };
const outputRoot = path.resolve(process.cwd(), '../../frontend/public/images/attractions');
const acceptableLicence = /^(CC0|Public domain|CC BY(?:-SA)?)/i;
const text = (value?: string) => (value ?? '').replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();

async function findPhotos(query: string) {
  const params = new URLSearchParams({
    action: 'query', generator: 'search', gsrsearch: `"${query}"`, gsrnamespace: '6', gsrlimit: '20',
    prop: 'imageinfo', iiprop: 'url|extmetadata', iiurlwidth: '1600', format: 'json', origin: '*',
  });
  const response = await fetch(`https://commons.wikimedia.org/w/api.php?${params}`, { signal: AbortSignal.timeout(30_000) });
  if (!response.ok) throw new Error(`Commons returned ${response.status}`);
  const payload = await response.json() as { query?: { pages?: Record<string, CommonsPage> } };
  const uniqueSources = new Set<string>();
  return Object.values(payload.query?.pages ?? {}).flatMap((page) => page.imageinfo ?? []).filter((info) => {
    const licence = text(info.extmetadata?.LicenseShortName?.value);
    const source = info.descriptionurl ?? info.thumburl;
    if (!info.thumburl || !source || !acceptableLicence.test(licence) || uniqueSources.has(source)) return false;
    uniqueSources.add(source);
    return true;
  });
}

type ImportIssue = { slug: string; reason: string };

async function main() {
  const attribution: Record<string, unknown[]> = {};
  const imported: string[] = [];
  const manualCuration: ImportIssue[] = [];
  await mkdir(outputRoot, { recursive: true });

  for (const media of LOCAL_ATTRACTION_MEDIA) {
    try {
      const photos = await findPhotos(media.query);
      if (photos.length < 3) {
        const reason = `only ${photos.length} reusable Commons images`;
        console.warn(`WARNING: ${media.slug} has ${reason}. This location requires manual image curation.`);
        manualCuration.push({ slug: media.slug, reason });
        continue;
      }

      // Download all six assets into memory first. A network failure must not
      // replace a previously complete local gallery with a partial one.
      const downloads = await Promise.all(photos.slice(0, 3).map(async (photo, index) => {
        const thumbnailUrl = photo.thumburl!.replace('/1600px-', '/360px-');
        const [image, thumbnail] = await Promise.all([
          fetch(photo.thumburl!, { signal: AbortSignal.timeout(60_000) }),
          fetch(thumbnailUrl, { signal: AbortSignal.timeout(60_000) }),
        ]);
        if (!image.ok || !thumbnail.ok) throw new Error(`download failed (hero ${image.status}, thumbnail ${thumbnail.status})`);
        return {
          index, image: Buffer.from(await image.arrayBuffer()), thumbnail: Buffer.from(await thumbnail.arrayBuffer()), photo,
        };
      }));

      const folder = path.join(outputRoot, media.slug);
      await rm(folder, { recursive: true, force: true });
      await mkdir(folder, { recursive: true });
      attribution[media.slug] = [];
      for (const download of downloads) {
        const number = download.index + 1;
        await writeFile(path.join(folder, `${media.slug}-${number}.jpg`), download.image);
        await writeFile(path.join(folder, `${media.slug}-${number}-thumb.jpg`), download.thumbnail);
        attribution[media.slug].push({
          file: `${media.slug}-${number}.jpg`, thumbnail: `${media.slug}-${number}-thumb.jpg`, source: download.photo.descriptionurl,
          creator: text(download.photo.extmetadata?.Artist?.value), licence: text(download.photo.extmetadata?.LicenseShortName?.value),
          licenceUrl: text(download.photo.extmetadata?.LicenseUrl?.value),
        });
      }
      imported.push(media.slug);
      console.log(`Imported 3 distinct local images for ${media.slug}`);
    } catch (error) {
      const reason = error instanceof Error ? error.message : String(error);
      console.warn(`WARNING: ${media.slug} could not be imported (${reason}). This location requires manual image curation.`);
      manualCuration.push({ slug: media.slug, reason });
    }
  }
  await writeFile(path.join(outputRoot, 'ATTRIBUTION.json'), `${JSON.stringify(attribution, null, 2)}\n`);

  console.log('\nMEDIA IMPORT COMPLETE');
  console.log(`Successfully imported: ${imported.length} locations`);
  console.log('\nLocations requiring manual curation:');
  if (manualCuration.length) manualCuration.forEach(({ slug, reason }) => console.log(`- ${slug} (${reason})`));
  else console.log('- None');
}

main().catch((error) => { console.error(error); process.exitCode = 1; });
