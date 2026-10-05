import { execSync } from 'child_process';
import { env } from '../config/env';
import { syncAttractionMedia } from './sync-attraction-media';

// Render's Docker services don't support pre-deploy commands, so each
// container applies its own pending migrations on boot before starting the
// server. `migrate deploy` only applies pending migrations and is safe to
// run on every restart. Uses env.databaseUrl (already schema-qualified) so
// the CLI targets the same schema the app itself connects to.
async function main() {
  execSync('npx prisma migrate deploy', {
    stdio: 'inherit',
    env: { ...process.env, DATABASE_URL: env.databaseUrl },
  });

  // Production starts backfill missing gallery images. Local development can
  // opt in explicitly without adding network work to every API restart.
  if (env.nodeEnv === 'production' || process.env.SYNC_ATTRACTION_MEDIA === 'true') await syncAttractionMedia();
}

main().catch((error) => {
  console.error('Migration/media setup failed:', error);
  process.exit(1);
});
