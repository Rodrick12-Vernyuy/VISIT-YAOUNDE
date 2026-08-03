# Visit Yaoundé

**Visit Yaoundé** is a tourism platform for Yaoundé, Cameroon — a place to discover the city's monuments, museums,
parks, wildlife, and cultural sites. This repository is a capstone project that started as `GlobeTrotter`, a Flask
monolith starter, and has since been rebuilt as a Node.js/Next.js application following the standard capstone
progression: **Phase 1 (Monolith) → Phase 2 (Microservices) → Phase 3 (Cloud Deployment) → Phase 4 (Resilience)**.

- **Phase 1** — a single Express/TypeScript monolith covering auth, attractions, categories, reviews, and
  favorites. Preserved, untouched, at [`legacy-monolith/backend`](legacy-monolith/backend) as the "before" artifact.
- **Phase 2 (current)** — the monolith decomposed into four independently-deployable services (below), talking to
  each other over HTTP through an API gateway. This is what runs today.
- **Phase 3 / 4** — not started yet. See [Roadmap](#roadmap).

---

## Architecture (Phase 2: Microservices)

```
                     ┌──────────────┐
   Browser ────────▶ │   Gateway    │  :4000   (only service the browser ever talks to)
                     └──────┬───────┘
                            │ proxies by path prefix, unchanged external API
              ┌─────────────┼──────────────┐
              ▼              ▼              ▼
       ┌────────────┐ ┌──────────────┐ ┌───────────────┐
       │ auth-service│ │ attractions- │ │  engagement-   │
       │   :4001     │ │ service :4002│ │  service :4003 │
       └──────┬──────┘ └──────┬───────┘ └───────┬────────┘
              │                │                 │
              └───────┬────────┴────────┬────────┘
                       ▼                 ▼
              Postgres (one instance, three schemas: auth / attractions / engagement)
```

- **auth-service** — owns `User`, `RefreshToken`. Register/login/refresh/logout/profile. Issues JWTs.
- **attractions-service** — owns `Category`, `Attraction`, `AttractionImage`. CRUD, search/filter, image
  uploads (Cloudinary or local disk). Exposes `/internal/*` routes for other services.
- **engagement-service** — owns `Review`, `ReviewHelpful`, `Favorite`. Stores `userId`/`attractionId` as plain
  columns — **no cross-service foreign keys**. Calls attractions-service to verify an attraction exists and to
  push back rating aggregates, and calls auth-service to fetch reviewer names for display (API composition,
  since the data now spans two services instead of one join).
- **gateway** — the only service the frontend calls. Routes `/api/v1/auth/*` → auth-service,
  `/api/v1/attractions/*` + `/api/v1/categories/*` → attractions-service (except
  `/api/v1/attractions/:id/reviews`, which goes to engagement-service), `/api/v1/reviews/*` +
  `/api/v1/favorites/*` → engagement-service. **The external API shape is identical to the old monolith** — the
  frontend needed zero changes.
- Downstream services trust the gateway/each other via a shared `INTERNAL_SERVICE_TOKEN` header on `/internal/*`
  routes, and verify user JWTs statelessly (shared `JWT_ACCESS_SECRET`) — no per-request call back to auth-service
  for every protected route.

---

## Tech stack

**Backend** — Node.js, Express, TypeScript, PostgreSQL, Prisma (one schema per service, `output` pinned locally
per service to avoid npm-workspace hoisting clobbering each other's generated client), JWT auth (+ Google OAuth,
disabled until configured), Multer, Cloudinary (optional — falls back to local disk storage), Axios
(service-to-service calls), `http-proxy-middleware` (gateway), Winston, Helmet, rate limiting, Jest/Supertest.

**Frontend** — Next.js (App Router), TypeScript, Tailwind CSS, Radix UI primitives (shadcn-style components),
Framer Motion, TanStack Query, Zustand, React Hook Form + Zod, Axios, Leaflet/react-leaflet, Vitest + React
Testing Library. Unchanged by the microservices split — it only ever talks to the gateway.

**Infra** — Docker, Docker Compose (Postgres + Redis + 4 services + frontend).

---

## Project structure

```
.
├── legacy-monolith/
│   └── backend/                  # Phase 1 artifact — untouched, still runs standalone
├── services/
│   ├── gateway/                  # Reverse proxy, no database
│   ├── auth-service/
│   │   └── prisma/schema.prisma  # schema="auth"; User, RefreshToken
│   ├── attractions-service/
│   │   └── prisma/schema.prisma  # schema="attractions"; Category, Attraction, AttractionImage
│   └── engagement-service/
│       └── prisma/schema.prisma  # schema="engagement"; Review, ReviewHelpful, Favorite
│       # each service/ follows the same layout: src/{config,controllers,services,
│       # repositories,routes,middleware,validators,utils}/, tests/, Dockerfile
├── frontend/
│   └── src/
│       ├── app/                  # Routes: /, /attractions, /attractions/[slug], /map, /login, /register, /profile, /admin/...
│       ├── components/           # ui/ (primitives), layout/, home/, attractions/ (incl. reviews & favorites), map/, admin/
│       ├── lib/                  # axios client, react-query hooks, utils
│       └── stores/               # zustand auth store
└── docker-compose.yml            # postgres, redis, gateway, auth/attractions/engagement-service, frontend
```

---

## Getting started (local development)

### Prerequisites
- Node.js 20+
- Docker Desktop (for Postgres + Redis)

### 1. Start Postgres and Redis

```bash
docker compose up -d postgres redis
```

### 2. Configure environment variables

```bash
cp services/auth-service/.env.example services/auth-service/.env
cp services/attractions-service/.env.example services/attractions-service/.env
cp services/engagement-service/.env.example services/engagement-service/.env
cp services/gateway/.env.example services/gateway/.env
```

Defaults work out of the box: Postgres on `localhost:5433` (one instance, split by `?schema=` per service),
local disk image storage, email/password auth only, and a shared dev `INTERNAL_SERVICE_TOKEN`. To enable
Cloudinary or Google OAuth, fill in the relevant variables in `services/attractions-service/.env` /
`services/auth-service/.env`.

Create `frontend/.env.local`:

```
NEXT_PUBLIC_API_URL=http://localhost:4000/api/v1
```

### 3. Install dependencies (from the repo root — npm workspace)

```bash
npm install
```

### 4. Migrate and seed each service's schema

```bash
cd services/auth-service        && npx prisma migrate dev && npx tsx prisma/seed.ts   # admin user
cd ../attractions-service       && npx prisma migrate dev && npx tsx prisma/seed.ts   # categories + attractions
cd ../engagement-service        && npx prisma migrate dev                              # no seed data needed
```

This creates 7 categories, 10 real Yaoundé attractions, and an admin account:

```
admin@visityaounde.cm / ChangeMe123!
```

### 5. Run everything

```bash
cd services/auth-service && npm run dev          # :4001
cd services/attractions-service && npm run dev   # :4002
cd services/engagement-service && npm run dev    # :4003
cd services/gateway && npm run dev               # :4000  ← frontend talks to this
npm run dev:frontend                             # :3000  (from repo root)
```

Swagger-style interactive docs aren't set up per-service yet (previously served from the monolith at
`/api/docs`) — hit the REST endpoints directly per the [API overview](#api-overview) below, or see
`legacy-monolith/backend` for the old Swagger setup as reference.

---

## Running with Docker Compose (full stack)

```bash
docker compose up -d --build
```

Builds and starts Postgres, Redis, all four services, and the frontend together. Run migrations/seed once per
service the same way as above, pointed at the compose network (or via `docker compose exec <service> npx prisma
migrate deploy`).

---

## Environment variables

Each service has its own `.env.example`. Common ones:

| Variable | Where | Default | Description |
|---|---|---|---|
| `DATABASE_URL` | auth/attractions/engagement | `...5433/visit_yaounde?schema=<service>` | Same Postgres instance, different schema per service |
| `JWT_ACCESS_SECRET` | all backend services | dev placeholder | **Must** be identical across services and overridden in production — it's how each service independently verifies tokens issued by auth-service |
| `JWT_REFRESH_SECRET` | auth-service only | dev placeholder | Only auth-service issues/verifies refresh tokens |
| `INTERNAL_SERVICE_TOKEN` | auth/attractions/engagement | dev placeholder | Shared secret guarding `/internal/*` routes from anything but other services |
| `GATEWAY_URL` | auth/attractions/engagement | `http://localhost:4000` | Used only for logging/reference — CORS lives solely on the gateway |
| `AUTH_SERVICE_URL` / `ATTRACTIONS_SERVICE_URL` / `ENGAGEMENT_SERVICE_URL` | gateway | `http://localhost:400{1,2,3}` | Proxy targets |
| `CLOUDINARY_URL` | attractions-service | empty | Leave empty to store uploads on local disk instead |
| `NEXT_PUBLIC_API_URL` | frontend | `http://localhost:4000/api/v1` | Always points at the gateway, never a service directly |

---

## API overview

Unchanged from before the microservices split — the gateway preserves the exact same external contract.

| Method | Endpoint | Auth | Resolves to |
|---|---|---|---|
| POST | `/api/v1/auth/register` | — | auth-service |
| POST | `/api/v1/auth/login` | — | auth-service |
| POST | `/api/v1/auth/refresh` | — | auth-service |
| POST | `/api/v1/auth/logout` | — | auth-service |
| GET / PATCH | `/api/v1/auth/me` | user | auth-service |
| GET | `/api/v1/categories` | — | attractions-service |
| GET | `/api/v1/attractions` | — | attractions-service |
| GET | `/api/v1/attractions/:slug` | — | attractions-service |
| GET | `/api/v1/attractions/admin/all` \| `/admin/:id` | admin | attractions-service |
| POST / PATCH / DELETE | `/api/v1/attractions[/:id]` | admin | attractions-service |
| POST / PATCH / DELETE | `/api/v1/attractions/:id/gallery[/:imageId[/cover]]` | admin | attractions-service |
| GET / POST | `/api/v1/attractions/:id/reviews` | — / user | **engagement-service** (note: different service than the rest of `/attractions`) |
| PATCH / DELETE | `/api/v1/reviews/:reviewId` | user | engagement-service |
| POST | `/api/v1/reviews/:reviewId/helpful` | user | engagement-service |
| GET / POST / DELETE | `/api/v1/favorites[/:attractionId]` | user | engagement-service |

Internal-only (never routed through the gateway, guarded by `INTERNAL_SERVICE_TOKEN`):

| Method | Endpoint | Called by | Purpose |
|---|---|---|---|
| GET | `attractions-service:4002/internal/attractions/:id/exists` | engagement-service | Verify an attraction exists before creating a review/favorite |
| PATCH | `attractions-service:4002/internal/attractions/:id/rating` | engagement-service | Push back `averageRating`/`reviewCount` after a review changes |
| GET | `auth-service:4001/internal/users?ids=` | engagement-service | Fetch reviewer display names for the review list (API composition) |

---

## Testing

Each service has its own Jest + Supertest suite (30 tests total: auth 7, attractions 8, engagement 14 — reviews
and favorites — gateway 2 health/routing checks):

```bash
cd services/auth-service && npm test
cd services/attractions-service && npm test
cd services/engagement-service && npm test
cd services/gateway && npm test
npm run test:frontend    # Vitest + React Testing Library, from repo root
```

`legacy-monolith/backend` keeps its own original test suite and can still be run standalone from within that
directory if you want to compare Phase 1 vs Phase 2 behavior directly.

---

## Roadmap

- **Phase 3 — Cloud Deployment**: containerize and deploy the 4-service topology properly (not just the old
  monolith, which is what's currently live on Render/Vercel), with load balancing and auto-scaling.
- **Phase 4 — Resilience**: caching (Redis is provisioned but not yet wired into any service), message queues,
  circuit breakers, fault tolerance between services.
- **Feature roadmap** (orthogonal to the phases above, pick up anytime): Hotels/Restaurants/Events modules +
  basic itineraries; full admin CMS (roles & permissions, media library, analytics, activity logs, SEO settings,
  contact inbox); real-time notifications (Socket.io) + AI tourist assistant + Google OAuth; SEO + WCAG AA
  accessibility pass; test coverage hardening to 80%+ with Cypress e2e + CI.
