import { syncLocalMedia } from '../src/scripts/sync-local-media';
import { prisma } from '../src/config/prisma';

/** Seeds only the checked-in, frontend-hosted image paths. */
async function main() {
  await syncLocalMedia();
  console.log('Seeded local attraction galleries');
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
}).finally(() => prisma.$disconnect());
