import { execSync } from 'child_process';
import { env } from '../config/env';
import { syncLocalMedia } from './sync-local-media';

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

  // A new Render database contains schema only after `migrate deploy`.
  // The catalogue seed is idempotent (all records are upserted), so running it
  // at boot both populates a new deployment and preserves administrator edits.
  execSync('npx tsx prisma/seed.ts', {
    stdio: 'inherit',
    env: { ...process.env, DATABASE_URL: env.databaseUrl },
  });

  // Media is imported before build and shipped as frontend public assets.
  // Gate the DB switchover so a deployment can never point at paths whose
  // files have not yet been committed to the frontend image directory.
  if (process.env.LOCAL_MEDIA_IMPORTED === 'true') await syncLocalMedia();
}

main().catch((error) => {
  console.error('Migration/media setup failed:', error);
  process.exit(1);
});
