/**
 * Validates the checked-in attraction-media contract without making network
 * requests.  Run from services/attractions-service with:
 *   npm run validate:local-media
 */
import { createHash } from 'node:crypto';
import { readFile, stat } from 'node:fs/promises';
import path from 'node:path';
import { LOCAL_ATTRACTION_MEDIA } from '../src/data/local-attraction-media';

type Attribution = {
  file: string;
  thumbnail: string;
  source: string;
  creator: string;
  licence: string;
  licenceUrl: string;
  attributionRequired?: boolean;
  modified?: boolean;
  modification?: string;
  role?: string;
  verification?: string;
};

const assetRoot = path.resolve(process.cwd(), '../../frontend/public/images/attractions');
const imagePattern = /\.(?:avif|jpe?g|png|webp)$/i;

async function exists(file: string) {
  try {
    return (await stat(file)).isFile();
  } catch {
    return false;
  }
}

async function main() {
  const attribution = JSON.parse(await readFile(path.join(assetRoot, 'ATTRIBUTION.json'), 'utf8')) as Record<string, Attribution[]>;
  const errors: string[] = [];
  const report: Array<{ slug: string; images: number; status: string }> = [];
  const hashes = new Map<string, string>();

  for (const media of LOCAL_ATTRACTION_MEDIA) {
    const directory = path.join(assetRoot, media.slug);
    const files = media.images.map((image) => path.basename(image.file));
    const records = attribution[media.slug] ?? [];
    const locationErrors: string[] = [];

    if (new Set(files).size !== 3 || files.length !== 3) locationErrors.push('catalogue must declare exactly three distinct images');
    if (records.length !== 3) locationErrors.push(`attribution has ${records.length}/3 records`);

    for (const file of files) {
      if (!imagePattern.test(file)) locationErrors.push(`${file} is not an accepted image type`);
      const fullPath = path.join(directory, file);
      if (!(await exists(fullPath))) {
        locationErrors.push(`missing ${file}`);
        continue;
      }
      const hash = createHash('sha256').update(await readFile(fullPath)).digest('hex');
      const usedBy = hashes.get(hash);
      if (usedBy) locationErrors.push(`${file} duplicates ${usedBy}`);
      else hashes.set(hash, `${media.slug}/${file}`);
    }

    for (const record of records) {
      if (!files.includes(record.file)) locationErrors.push(`attribution references undeclared ${record.file}`);
      if (!record.source || !record.creator || !record.licence || !record.licenceUrl || typeof record.attributionRequired !== 'boolean' || typeof record.modified !== 'boolean' || (record.modified && !record.modification)) locationErrors.push(`incomplete attribution for ${record.file}`);
      if (!record.role || !record.verification) locationErrors.push(`missing role or location verification for ${record.file}`);
      if (record.thumbnail && !(await exists(path.join(directory, record.thumbnail)))) locationErrors.push(`missing thumbnail ${record.thumbnail}`);
    }

    const status = locationErrors.length ? `INCOMPLETE — ${locationErrors.join('; ')}` : 'COMPLETE';
    // Count physical declared originals separately so the report remains useful
    // even while a gallery is incomplete.
    const images = (await Promise.all(files.map((file) => exists(path.join(directory, file))))).filter(Boolean).length;
    report.push({ slug: media.slug, images, status });
    errors.push(...locationErrors.map((error) => `${media.slug}: ${error}`));
  }

  console.table(report);
  if (errors.length) {
    console.error(`\nLocal media validation failed with ${errors.length} issue(s). - validate-local-media.ts:81`);
    process.exitCode = 1;
  } else {
    console.log('\nAll catalogue locations have three distinct, attributed local images. - validate-local-media.ts:84');
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
