# Task 4b — Measured Coverage & Gap Closure

**Registration number: _______________**

**Tool:** Jest's built-in coverage instrumentation (Istanbul), run via:

```bash
cd services/engagement-service
npm run test:coverage
```

which runs `jest --runInBand --coverage`. A scoped run against just the file under structural analysis was used to produce the figures below:

```bash
npx jest --coverage --collectCoverageFrom='src/services/review.service.ts' --coverageReporters=text
```

## Before adding the gap-closing test

```
-------------------|---------|----------|---------|---------|-------------------
File               | % Stmts | % Branch | % Funcs | % Lines | Uncovered Line #s
-------------------|---------|----------|---------|---------|-------------------
All files          |   84.44 |    64.28 |     100 |   88.88 |
 review.service.ts |   84.44 |    64.28 |     100 |   88.88 | 44-46,53
-------------------|---------|----------|---------|---------|-------------------
```

Uncovered lines 44-46 and 53 are **both outside `create()`** — they sit in `update()` (lines 44-46: the success-path body, never reached because the existing suite only tests the *forbidden* branch of update) and `remove()` (line 53: the forbidden-delete throw, never reached because the existing suite only tests the *owner-deletes-their-own-review* branch). Function coverage was already 100% (every function is *called* at least once), but branch coverage inside `update`/`remove` was incomplete because not every `if` outcome was exercised.

`create()` itself — the function under CFG analysis in [cfg-analysis.md](cfg-analysis.md) — had **100% branch coverage already**, exactly as predicted: the 3-path basis set (P1/P2/P3) is fully exercised by TC-11, TC-12, and TC-01/02/03/06/08 respectively.

## Gap identified

`review.service.ts:53` — inside `remove()`:

```ts
if (review.userId !== userId && role !== 'ADMIN') {
  throw ApiError.forbidden('You can only delete your own review');   // ← never reached
}
```

No existing test constructed the specific condition **"caller is neither the review's author nor an ADMIN"** — the pre-existing suite only covered "the author deletes their own review" (condition false, falls through). This is a real, tool-identified gap, not a synthetic one — it means the delete-authorization check was, at the time of measurement, unverified by any automated test.

## Test added to close the gap

`services/engagement-service/tests/review.vv.test.ts`, `describe('Task 4b — structural coverage gap closure')`, test `GAP-01`:

```ts
it('GAP-01: a non-owner, non-admin user cannot delete another user's review', async () => {
  const created = await createReview('vv-gap-owner', { rating: 3, comment: '...' });
  const res = await request(app)
    .delete(`/api/v1/reviews/${created.body.review.id}`)
    .set('Authorization', `Bearer ${tokenFor('vv-gap-intruder', 'USER')}`);
  expect(res.status).toBe(403);
});
```

This constructs exactly the missing condition: a second, distinct non-admin user (`vv-gap-intruder`) attempting to delete a review they don't own.

## After adding the gap-closing test

```
-------------------|---------|----------|---------|---------|-------------------
File               | % Stmts | % Branch | % Funcs | % Lines | Uncovered Line #s
-------------------|---------|----------|---------|---------|-------------------
All files          |   86.66 |    78.57 |     100 |   91.66 |
 review.service.ts |   86.66 |    78.57 |     100 |   91.66 | 44-46
-------------------|---------|----------|---------|---------|-------------------
```

Branch coverage rose from **64.28% → 78.57%**; line 53 is now covered. Lines 44-46 (the success path of `update()`) remain uncovered — this is a **deliberate, documented scope decision**, not an oversight: `update()` was explicitly marked out of scope in the [test plan](../task2-test-design/test-plan.md), since this campaign's scope is review *creation*. If asked in the oral defense: "yes, I could add a test for `update()`'s success path too, but it wasn't part of the feature this campaign targets — here's the exact line, and here's the one-line test I'd add if asked" (an update() call with a valid body, from the review's own author, asserting 200 and the changed field) — which is precisely the kind of "add one test case on request" the exam brief warns to expect.

## Full-suite result after the change

```
Test Suites: 3 passed, 3 total
Tests:       30 passed, 30 total
```

(29 pre-existing engagement-service tests + 1 new gap-closing test; the 13 TC-xx + 2 INT-xx tests from Task 3 are additionally counted within that total via `review.vv.test.ts`.)
