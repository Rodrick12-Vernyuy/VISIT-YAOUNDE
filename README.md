# Visit Yaoundé

**Visit Yaoundé** is a tourism platform for Yaoundé, Cameroon — a place to discover the city's monuments, museums,
parks, wildlife, and cultural sites. This repository originally started as `GlobeTrotter`, a Flask capstone
starter; it has been rebuilt from scratch as a full-stack Node.js/Next.js application.

This is a multi-phase build. **Phase 1** covers authentication and the Attractions module end-to-end (API, admin
CMS, public pages, and an interactive map). **Phase 2** adds reviews (ratings + comments, editable, "helpful"
votes), favorites, and a user profile page. See [Roadmap](#roadmap) for what's planned next.

---

## Tech stack

**Backend** — Node.js, Express, TypeScript, PostgreSQL, Prisma, JWT auth (+ Google OAuth, disabled until
configured), Multer, Cloudinary (optional — falls back to local disk storage), Winston, Swagger, Helmet, rate
limiting, Jest/Supertest.

**Frontend** — Next.js (App Router), TypeScript, Tailwind CSS, Radix UI primitives (shadcn-style components),
Framer Motion, TanStack Query, Zustand, React Hook Form + Zod, Axios, Leaflet/react-leaflet, Vitest + React
Testing Library.

**Infra** — Docker, Docker Compose (Postgres + Redis + backend + frontend).

---

## Project structure

```
.
├── backend/
│   ├── prisma/schema.prisma      # Data model
│   ├── prisma/seed.ts            # Categories + Yaoundé attractions + admin user
│   ├── src/
│   │   ├── config/               # env, logger, prisma client, cloudinary, passport, swagger
│   │   ├── controllers/          # Request handlers
│   │   ├── services/             # Business logic
│   │   ├── repositories/         # Prisma data access
│   │   ├── routes/               # Express routers
│   │   ├── middleware/           # auth, validation, rate limiting, uploads, error handling
│   │   ├── validators/           # Zod schemas
│   │   └── utils/                # ApiError, JWT helpers, asyncHandler
│   └── tests/                    # Jest + Supertest
├── frontend/
│   └── src/
│       ├── app/                  # Routes: /, /attractions, /attractions/[slug], /map, /login, /register, /profile, /admin/...
│       ├── components/           # ui/ (primitives), layout/, home/, attractions/ (incl. reviews & favorites), map/, admin/
│       ├── lib/                  # axios client, react-query hooks, utils
│       └── stores/               # zustand auth store
└── docker-compose.yml            # postgres, redis, backend, frontend
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
cp backend/.env.example backend/.env
```

The defaults work out of the box: Postgres on `localhost:5433` (remapped from the standard 5432 to avoid
colliding with any other local Postgres install), local disk image storage, and email/password auth only.
To enable Cloudinary or Google OAuth, fill in the relevant variables — see
[Environment variables](#environment-variables) below.

Create `frontend/.env.local`:

```
NEXT_PUBLIC_API_URL=http://localhost:4000/api/v1
```

### 3. Install dependencies (from the repo root — this is an npm workspace)

```bash
npm install
```

### 4. Migrate and seed the database

```bash
cd backend
npx prisma migrate dev
npx prisma db seed
```

This creates 7 categories, 10 real Yaoundé attractions (Reunification Monument, National Museum, Mvog-Betsi Zoo,
Mount Fébé, the Benedictine Monastery, etc.), and an admin account:

```
admin@visityaounde.cm / ChangeMe123!
```

### 5. Run the apps

```bash
npm run dev:backend    # http://localhost:4000  (Swagger docs at /api/docs)
npm run dev:frontend   # http://localhost:3000
```

---

## Running with Docker Compose (full stack)

```bash
docker compose up -d --build
```

This builds and starts Postgres, Redis, the backend API, and the frontend together. Run migrations/seed once
against the containerized database the same way as above (with `DATABASE_URL` pointed at the compose network,
or via `docker compose exec backend npx prisma migrate deploy && docker compose exec backend npx prisma db seed`).

---

## Environment variables

| Variable | Default | Description |
|---|---|---|
| `DATABASE_URL` | `postgresql://postgres:postgres@localhost:5433/visit_yaounde` | Postgres connection string |
| `JWT_ACCESS_SECRET` / `JWT_REFRESH_SECRET` | dev placeholders | **Must** be overridden in production |
| `JWT_ACCESS_TTL` / `JWT_REFRESH_TTL_DAYS` | `15m` / `30` | Token lifetimes |
| `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` / `GOOGLE_CALLBACK_URL` | empty | Leave empty to disable Google sign-in |
| `CLOUDINARY_URL` | empty | Leave empty to store uploads on local disk (`backend/uploads/`) instead |
| `UPLOAD_DIR` | `uploads` | Local upload directory (used when Cloudinary is disabled) |
| `RATE_LIMIT_WINDOW_MS` / `RATE_LIMIT_MAX` | `900000` / `300` | API rate limiting |
| `SEED_ADMIN_EMAIL` / `SEED_ADMIN_PASSWORD` | see `.env.example` | Admin account created by the seed script |
| `NEXT_PUBLIC_API_URL` (frontend) | `http://localhost:4000/api/v1` | Backend API base URL |

---

## API overview

Full interactive documentation is served at **`/api/docs`** (Swagger UI) once the backend is running.

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/api/v1/auth/register` | — | Register (email/password) |
| POST | `/api/v1/auth/login` | — | Log in |
| POST | `/api/v1/auth/refresh` | — | Refresh access token |
| POST | `/api/v1/auth/logout` | — | Revoke refresh token |
| GET | `/api/v1/auth/me` | user | Current user |
| PATCH | `/api/v1/auth/me` | user | Update display name |
| GET | `/api/v1/categories` | — | List categories |
| GET | `/api/v1/attractions` | — | List/search/filter published attractions |
| GET | `/api/v1/attractions/:slug` | — | Attraction detail + nearby attractions |
| GET | `/api/v1/attractions/admin/all` | admin | List all attractions, including drafts |
| GET | `/api/v1/attractions/admin/:id` | admin | Attraction detail by id, including drafts |
| POST | `/api/v1/attractions` | admin | Create attraction |
| PATCH | `/api/v1/attractions/:id` | admin | Update attraction |
| DELETE | `/api/v1/attractions/:id` | admin | Delete attraction |
| POST | `/api/v1/attractions/:id/gallery` | admin | Upload images (multipart, field `images`) |
| PATCH | `/api/v1/attractions/:id/gallery/:imageId/cover` | admin | Set cover image |
| DELETE | `/api/v1/attractions/:id/gallery/:imageId` | admin | Delete an image |
| GET | `/api/v1/attractions/:id/reviews` | — | List reviews for an attraction |
| POST | `/api/v1/attractions/:id/reviews` | user | Create a review (one per user per attraction) |
| PATCH | `/api/v1/reviews/:reviewId` | user | Edit your own review |
| DELETE | `/api/v1/reviews/:reviewId` | user/admin | Delete your own review (admin can delete any) |
| POST | `/api/v1/reviews/:reviewId/helpful` | user | Toggle "helpful" vote (not on your own review) |
| GET | `/api/v1/favorites` | user | List your saved attractions |
| POST | `/api/v1/favorites/:attractionId` | user | Save an attraction |
| DELETE | `/api/v1/favorites/:attractionId` | user | Remove a saved attraction |

---

## Testing

```bash
npm run test:backend    # Jest + Supertest — requires Postgres running (see step 1 above)
npm run test:frontend   # Vitest + React Testing Library
```

---

## Roadmap

Phase 1 covers Attractions end-to-end. Phase 2 (done) adds reviews, favorites, and user profiles — basic
itineraries were deferred out of Phase 2 to keep it a focused slice; they're folded into Phase 3 below. Planned
follow-ups:

- **Phase 3** — Hotels, Restaurants, Events modules; basic itineraries; "nearby restaurants/hotels" on attraction
  pages.
- **Phase 4** — Full admin CMS: roles & permissions, media library, analytics, activity logs, homepage content
  management, SEO settings, contact message inbox.
- **Phase 5** — Real-time notifications (Socket.io), AI tourist assistant, activate Google OAuth, live weather.
- **Phase 6** — SEO (sitemap, structured data, OG tags), WCAG AA accessibility pass, Redis caching, perf tuning.
- **Phase 7** — Test coverage hardening (target 80%+) + Cypress e2e, GitHub Actions CI.
- **Phase 8** — Production infra: Kubernetes manifests, AWS (EKS/RDS/S3/CloudFront/Route53), Nginx, Prometheus/
  Grafana/Loki/Alertmanager monitoring.
