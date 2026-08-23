# Test Suite — Review Creation (`POST /api/v1/attractions/:id/reviews`)

**Registration number: _______________**

Oracle convention used throughout: **HTTP status code** returned by the endpoint, plus (where noted) an observable side effect — a persisted row, or the arguments a mocked cross-service client was called with. This is a *specified* oracle (derived from the API contract, not from reading the implementation), which is what makes this black-box test design.

Shared precondition for every case unless stated otherwise: the engagement-service test app is running against a clean/seeded test database, and `attractionId = aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa` is a valid, existing attraction (`attractionsClient.attractionExists` mocked to resolve `true`).

| ID | Precondition | Input | Expected Result | Oracle | Path type |
|---|---|---|---|---|---|
| TC-01 | Authenticated as `user-1`; no existing review by this user for this attraction | `POST .../reviews`, `Authorization: Bearer <valid token for user-1>`, body `{ rating: 4, comment: "Really enjoyed this attraction, would visit again." }` | Review created | HTTP `201`; response body contains `review.id`, `review.rating === 4`; `attractionsClient.syncRating` called with `(attractionId, 4, 1)` | **Normal** |
| TC-02 | Same as TC-01, different user (`user-2`) | body `{ rating: 1, comment: "Not worth the trip, disappointing overall." }` | Review created — lower valid boundary of `rating` accepted | HTTP `201`; `review.rating === 1` | **Boundary (valid, min)** |
| TC-03 | Same as TC-01, different user (`user-3`) | body `{ rating: 5, comment: "Absolutely stunning, a must-see in Yaounde." }` | Review created — upper valid boundary of `rating` accepted | HTTP `201`; `review.rating === 5` | **Boundary (valid, max)** |
| TC-04 | Same as TC-01, different user (`user-4`) | body `{ rating: 0, comment: "Rating is one below the allowed minimum." }` | Rejected — `rating` below minimum | HTTP `400`; no row persisted; `attractionsClient.syncRating` **not** called | **Boundary (invalid, min-1) / Error** |
| TC-05 | Same as TC-01, different user (`user-5`) | body `{ rating: 6, comment: "Rating is one above the allowed maximum." }` | Rejected — `rating` above maximum | HTTP `400`; no row persisted | **Boundary (invalid, max+1) / Error** |
| TC-06 | Same as TC-01, different user (`user-6`) | body `{ rating: 4, comment: "Nice." }` — comment is exactly 5 characters | Review created — lower valid boundary of `comment` length accepted | HTTP `201` | **Boundary (valid, min)** |
| TC-07 | Same as TC-01, different user (`user-7`) | body `{ rating: 4, comment: "Nice" }` — comment is exactly 4 characters | Rejected — `comment` below minimum length | HTTP `400`; no row persisted | **Boundary (invalid, min-1) / Error** |
| TC-08 | Same as TC-01, different user (`user-8`) | body `{ rating: 4, comment: "A".repeat(2000) }` — exactly 2000 characters | Review created — upper valid boundary of `comment` length accepted | HTTP `201` | **Boundary (valid, max)** |
| TC-09 | Same as TC-01, different user (`user-9`) | body `{ rating: 4, comment: "A".repeat(2001) }` — exactly 2001 characters | Rejected — `comment` above maximum length | HTTP `400`; no row persisted | **Boundary (invalid, max+1) / Error** |
| TC-10 | Not authenticated | `POST .../reviews`, no `Authorization` header, body otherwise valid | Rejected before reaching the handler | HTTP `401`; no row persisted; `attractionsClient.attractionExists` **not** called (auth gate short-circuits first) | **Error (security path)** |
| TC-11 | Authenticated; target attraction id is well-formed but does not exist | `POST /api/v1/attractions/<other-uuid>/reviews`, valid body; `attractionsClient.attractionExists` mocked to resolve `false` | Rejected — target does not exist | HTTP `404`; no row persisted | **Error (business rule)** |
| TC-12 | Authenticated as `user-1`, who already has a review on this attraction (post TC-01) | Same user, same attraction, valid body `{ rating: 5, comment: "Trying to review again, should be rejected." }` | Rejected — duplicate review | HTTP `409`; row count for this (user, attraction) pair remains 1 | **Error (business rule)** |
| TC-13 | Authenticated; attraction exists | body `{ rating: 3.5, comment: "Rating is not an integer value here." }` | Rejected — `rating` must be an integer | HTTP `400` | **Error (type/format)** |

**13 cases** (exceeds the 8 required), covering: 1 fully-normal path (TC-01), 6 boundary cases across both input-rich fields (TC-02/03/04/05/06/07/08/09 — 8 boundary cases in total, min/max ± 1 on both `rating` and `comment`), and 5 error paths that are not pure input-boundary issues (auth, existence, duplication, type). Every case maps directly onto the equivalence classes and boundary values derived in [ep-bva-analysis.md](ep-bva-analysis.md).

Automated implementations of every case above are in `services/engagement-service/tests/review.vv.test.ts`, named by test-case ID (Task 3).
