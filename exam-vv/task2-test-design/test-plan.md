# Test Plan — Review Creation Feature

**Registration number: _______________**
**Application:** Visit Yaoundé — `services/engagement-service`
**Feature under test:** `POST /api/v1/attractions/:id/reviews` (create a review)

## 1. Objective

Verify that review creation correctly accepts valid input, rejects invalid input at every documented boundary, enforces the business rules (one review per user per attraction, target attraction must exist, caller must be authenticated), and correctly triggers the cross-service rating-sync call to `attractions-service`.

## 2. Scope

**In scope:**
- Input validation of `rating` (integer 1–5) and `comment` (string, 5–2000 characters) — the two input-rich fields validated by `review.validator.ts`.
- Business-rule branches in `reviewService.create` — attraction existence check, duplicate-review check, success path.
- Authentication/authorization gate (`requireAuth` middleware) in front of the route.
- The side effect of a successful creation: `attractionsClient.syncRating` is called with the recomputed average and count.

**Out of scope for this campaign** (would need their own test plans): review *update*/*delete*/*helpful-vote* endpoints, the `listForAttraction` read path, the frontend `ReviewsSection` component, and the real (non-mocked) network call to `attractions-service` — that boundary is tested via a mock (see Task 3), not a live service, since a unit/integration suite for one service should not require every other service to be running.

## 3. Approach

- **Black-box design** (Task 2) drives the test case *inputs and expected outputs*, derived purely from the documented contract (`review.validator.ts`'s Zod schema and the API's documented status codes) — not from reading the implementation.
- **Equivalence Partitioning + Boundary Value Analysis** applied specifically to `rating` and `comment` (see [ep-bva-analysis.md](ep-bva-analysis.md)) to systematically generate the boundary/error cases below, rather than picking them ad hoc.
- **Automated execution** (Task 3) via Jest + Supertest against a real Express app instance and a real (local) Postgres database, with only the outbound calls to other microservices mocked at the client-module boundary.
- **White-box coverage** (Task 4) measured afterward on `reviewService.create`, to check the black-box-derived suite actually exercises every branch, and to close any gap found.

## 4. Test Items

| Item | Location |
|---|---|
| Route wiring / auth gate | `services/engagement-service/src/routes/review.routes.ts` |
| Input validation | `services/engagement-service/src/validators/review.validator.ts` |
| Business logic | `services/engagement-service/src/services/review.service.ts` (`create`) |
| Persistence | `services/engagement-service/src/repositories/review.repository.ts` |

## 5. Test Environment

- Local PostgreSQL (via `docker compose up -d postgres`), `engagement` schema, migrated via `npx prisma migrate deploy`.
- `attractionsClient` and `authClient` modules mocked with `jest.mock(...)` — this is a deliberate, documented choice: it isolates *this* service's logic from the availability/state of the other two services, which is standard practice for a microservice's own test suite (their contracts are exercised separately, by `attractions-service`'s and `auth-service`'s own suites).
- Test JWTs minted locally via the `tokenFor()` test helper (signs with the same `JWT_ACCESS_SECRET` the service verifies with), rather than calling the real `auth-service` login endpoint.

## 6. Entry Criteria

- `services/engagement-service` type-checks clean (`npm run lint` → `tsc --noEmit`, exit 0).
- Local Postgres reachable and migrated.

## 7. Exit Criteria

- All test cases in [test-suite.md](test-suite.md) implemented as automated tests and passing (Task 3).
- Statement and branch coverage measured for `reviewService.create`; any uncovered branch is either covered by an added test or explicitly justified (Task 4).
- All defects found during the campaign logged with a defined severity and status (Task 5).

## 8. Roles

Individual project — one student (QA engineer role) designs, implements, executes, and reports on the entire campaign; the Examiner acts as reviewer/auditor during the Wednesday oral defense.
