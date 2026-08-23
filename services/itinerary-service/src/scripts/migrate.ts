import { execSync } from 'child_process';
import { env } from '../config/env';

// Render's Docker services don't support pre-deploy commands, so each
// container applies its own pending migrations on boot before starting the
// server. `migrate deploy` only applies pending migrations and is safe to
// run on every restart. Uses env.databaseUrl (already schema-qualified) so
// the CLI targets the same schema the app itself connects to.
execSync('npx prisma migrate deploy', {
  stdio: 'inherit',
  env: { ...process.env, DATABASE_URL: env.databaseUrl },
});
