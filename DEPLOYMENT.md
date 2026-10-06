# Phase 3 — Cloud Deployment

This deploys the Phase 2 microservices split (9 application services: gateway,
frontend, auth, attractions, engagement, notification, itinerary, search, booking)
plus the standalone chat server to Render as a
[Blueprint](https://render.com/docs/blueprint-spec), replacing the old monolith-only
deployment. Config lives in [`render.yaml`](./render.yaml).

## Architecture on Render

- **One shared Postgres instance**, multiple schemas — same pattern as `docker-compose.yml`.
  Each Prisma-backed service's `DATABASE_URL` comes from Render's `fromDatabase`
  reference; each service appends its own `?schema=X` in code (see
  `src/config/env.ts` in each service), so no per-service connection-string
  templating is needed in the YAML.
- **Every service is a public Render "web" service**, including the 7 backend
  services that only the gateway should call. This isn't a design choice — Render's
  free tier can *send* private-network requests but can't *receive* them (only paid
  plans can), so true network-level isolation (Render's "Private Service" type)
  isn't available here. The `x-internal-token` header check already built into each
  service's `/internal/*` routes (`requireInternalService` middleware) is the real
  security boundary in this deployment, standing in for network isolation.
- **Self-migrating containers.** Render doesn't support pre-deploy commands for
  Docker-runtime services, so each Prisma-backed service runs
  `node dist/scripts/migrate.js && node dist/server.js` as its container command —
  it applies any pending migrations on every boot before serving traffic.
  `prisma migrate deploy` is idempotent, so this is safe on every restart/redeploy.

## Prerequisites (create these before deploying)

1. **A Cloudinary account** (reuse the one from Phase 1 if you still have it —
   attractions-service uses the exact same `CLOUDINARY_URL` env var the old monolith
   did). Free tier is enough. Get the URL from Cloudinary's dashboard
   ("API Environment variable").
   - Without this, attractions-service falls back to local disk storage for
     uploaded images, which **will not survive a restart or redeploy** on Render's
     free tier (no persistent disk) — image uploads would silently disappear.
2. **A free Upstash Redis database** ([upstash.com](https://upstash.com)) — create
   one, then copy its `rediss://` connection URL (TLS). This is optional:
   search-service degrades gracefully to uncached lookups if `REDIS_URL` is unset
   or unreachable, but caching won't work without it.
3. Push this repo to GitHub if it isn't already there — Render's Blueprint flow
   deploys from a connected GitHub repo.

## Deploying

1. In the Render dashboard: **New → Blueprint**, connect this repo, select the
   branch. Render reads `render.yaml` and lists all 11 resources (10 services + 1
   database) it's about to create.
2. Render generates the JWT and internal-service secrets once in the shared
   `shared-secrets` environment group and supplies the same values to every
   backend service. Have these remaining secret values ready when prompted:
   - `CLOUDINARY_URL` (attractions-service) — from the Cloudinary prerequisite above.
   - `SEED_ADMIN_PASSWORD` (auth-service) — password for the seeded admin account
     (email is `admin@visityaounde.cm` by default, set in `render.yaml`).
   - `REDIS_URL` (search-service) — the Upstash `rediss://` URL, or leave blank.
3. Click **Apply**. Render builds and deploys all 10 Docker images. First deploy
   takes a while — each service builds independently.
4. Once live, verify:
   - `https://visit-yaounde-gateway.onrender.com/health` → `{"status":"ok",...}`
     for each service (swap the subdomain per service).
   - `https://visit-yaounde-frontend.onrender.com` loads and can register/log in,
     browse attractions, etc. — this exercises the full chain (frontend → gateway →
     backend services → Postgres).

## Known limitations of the free-tier deployment

Worth understanding for grading/interview purposes — these are Render free-tier
constraints, not gaps in the application's design:

- **Cold starts.** Free web services spin down after 15 minutes idle; the first
  request after that takes ~30–60s while the container restarts. The gateway and
  downstream services spin down independently, so a fully-idle app can feel slow
  on first load.
- **No real auto-scaling or load balancing.** Render's free plan caps every service
  at a single instance — autoscaling and multi-instance load balancing require a
  paid plan. The architecture is already built for it (stateless services behind a
  gateway, one shared DB, no in-memory session state), so enabling it later is a
  matter of upgrading the plan and flipping on scaling in each service's settings —
  not a code or architecture change.
- **Postgres expires in 30 days.** Render's free Postgres is deleted 30 days after
  creation (14-day grace period to upgrade first). For a capstone that needs to
  stay demoable, plan to recreate the database (migrations reapply automatically on
  next service boot; re-run each service's seed script — `npm run prisma:seed`,
  `npm run seed:images` for attractions-service — to repopulate data).
- **No network-level service isolation**, as covered above under Architecture —
  the 7 backend services are technically public URLs, protected by the internal
  token rather than by not being reachable at all.
