# Task 5a — Defect Log

**Registration number: _______________**

All three defects below were genuinely found during development of this project (not seeded for the exam) — each is real, was actually fixed, and can be pointed to in the git history if asked.

**Severity scale used:**
- **Critical** — breaks a core user-facing flow for all/most users, no workaround.
- **High** — breaks a core flow under common (not universal) conditions.
- **Medium** — breaks a secondary flow or degrades correctness without blocking usage entirely.
- **Low** — cosmetic or edge-case only.

---

## DEFECT-01

| Field | Value |
|---|---|
| **Title** | Refresh token creation fails with unique-constraint error on rapid repeated logins |
| **Component** | `services/auth-service/src/utils/jwt.ts` (`signRefreshToken`) |
| **Severity** | **High** — any user who logs in twice within the same second (e.g. a double-click, or an automated test/script) gets a 500 error on the second attempt. |
| **Steps to reproduce** | 1. Call `POST /api/v1/auth/login` with valid credentials.<br>2. Immediately (within the same wall-clock second) call `POST /api/v1/auth/login` again with the same or different valid credentials.<br>3. Observe the second call. |
| **Expected result** | HTTP `200` with a new, valid refresh token issued and persisted. |
| **Actual result** | HTTP `500`, with the underlying error `Unique constraint failed on the fields: (token)` — the second login attempted to persist a `RefreshToken` row with a token value identical to the first. |
| **Root cause** | `signRefreshToken` signed a JWT from `{ sub: userId }` plus the standard `iat`/`exp` claims only. JWT's `iat` has **second-level** resolution. Two calls for the same user within the same second therefore produced byte-for-byte identical tokens (same header, same payload, same secret) — and the `RefreshToken.token` column has a unique constraint, so inserting the second identical token failed at the database layer. |
| **Fix** | Added a `jti: crypto.randomUUID()` claim to the signed payload, guaranteeing uniqueness regardless of timing. |
| **Status** | **Closed — Fixed.** Regression-covered by `services/auth-service/tests/auth.test.ts`. |

---

## DEFECT-02

| Field | Value |
|---|---|
| **Title** | Browser requests fail with a CORS error even though the gateway has CORS configured |
| **Component** | `services/auth-service/src/app.ts`, `services/attractions-service/src/app.ts`, `services/engagement-service/src/app.ts` (each had its own `cors()` middleware) |
| **Severity** | **Critical** — after the monolith-to-microservices split, **every** API call from the browser failed; the frontend was completely unusable. |
| **Steps to reproduce** | 1. Run the full stack (gateway on :4000, frontend on :3000, all three backend services running).<br>2. Open the frontend in a browser and trigger any API call (e.g. load the attractions list). |
| **Expected result** | The request succeeds; the response is returned to the frontend. |
| **Actual result** | Browser console error: `Access-Control-Allow-Origin header has a value 'http://localhost:4000' that is not equal to the supplied origin 'http://localhost:3000'`. Every request failed at the browser's CORS check before the response body was even usable. |
| **Root cause** | Each downstream service (auth/attractions/engagement) had its own `cors({ origin: env.gatewayUrl })` middleware left over from when they were still directly callable. When the gateway proxied a request to a downstream service, that service's `Access-Control-Allow-Origin` response header (set to the *gateway's* URL, `http://localhost:4000`) passed through the proxy **unchanged** back to the browser — but the browser's real origin was the *frontend* (`http://localhost:3000`), not the gateway, so the header's value didn't match what the browser expected. |
| **Fix** | Removed `cors` middleware entirely from all three downstream services — CORS now lives **only** on the gateway, the sole service a browser ever talks to directly. |
| **Status** | **Closed — Fixed.** Verified via a real Playwright browser session against the running frontend showing zero console errors after the fix. |

---

## DEFECT-03

| Field | Value |
|---|---|
| **Title** | Gateway forwards a truncated URL to attractions-service, returning "Route not found" |
| **Component** | `services/gateway/src/routes/proxy.ts` |
| **Severity** | **Critical** — the attractions list, categories, and every other proxied route were entirely unreachable through the gateway. |
| **Steps to reproduce** | 1. Start the gateway and attractions-service.<br>2. `GET http://localhost:4000/api/v1/attractions?pageSize=3` |
| **Expected result** | HTTP `200` with a paginated list of attractions. |
| **Actual result** | `{"message":"Route not found: GET /?pageSize=3"}` — attractions-service received a request for path `/` instead of `/api/v1/attractions`. |
| **Root cause** | The proxy was originally mounted as `proxyRouter.use('/api/v1/attractions', createProxyMiddleware({ target: ... }))`. Express's `router.use(path, middleware)` **strips the matched path prefix** from `req.url` before invoking the middleware — so by the time `http-proxy-middleware` saw the request, `/api/v1/attractions` had already been removed, leaving just the query string. `http-proxy-middleware` then forwarded that truncated path verbatim to attractions-service, which had no route registered for `/`. |
| **Fix** | Switched to `http-proxy-middleware`'s own `pathFilter` option (matching without stripping the prefix), mounting each proxy at the router root via `proxyRouter.use(proxy(pathFilter, target))` instead of path-scoped mounting. |
| **Status** | **Closed — Fixed.** Verified via direct `curl` calls through the gateway confirming the full path reaches attractions-service. |

---

*(Task 5a requires at least three; three are logged above. A fourth, related defect — the frontend crashing on `review.user.fullName` after the microservices split — is discussed in [fault-model.md](fault-model.md) as the running example for semantic errors, rather than repeated here.)*
