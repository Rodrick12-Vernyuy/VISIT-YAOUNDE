# Task 4a — Control-Flow Graph & Cyclomatic Complexity

**Registration number: _______________**

**Function under analysis:** `reviewService.create`, `services/engagement-service/src/services/review.service.ts:27-37`

```ts
async create(userId, attractionId, input) {
  const exists = await attractionsClient.attractionExists(attractionId);        // N1
  if (!exists) throw ApiError.notFound('Attraction not found');                 // N2 / N3

  const existing = await reviewRepository.findByUserAndAttraction(userId, attractionId); // N4
  if (existing) throw ApiError.conflict('You have already reviewed this attraction');    // N5 / N6

  const review = await reviewRepository.create({ userId, attractionId, rating: input.rating, comment: input.comment }); // N7
  await syncAttractionRating(attractionId);                                     // N8
  return review;                                                               // N9
}
```

This function was chosen for structural analysis (rather than, say, `listForAttraction`) because it is the smallest function in the file with **genuine decision logic** — two independent `if` guards, each with its own error exit — making it non-trivial enough for a meaningful CFG without being artificially large.

## Control-flow graph

Nodes are basic blocks (straight-line code with no internal branching); a single virtual `EXIT` node collects the three points the function can terminate at (two throws, one return), which is standard practice for computing complexity on multi-exit functions.

```
        ┌────────────────────────────┐
        │ N1: exists = await         │
        │     attractionExists(id)   │
        └─────────────┬──────────────┘
                       ▼
        ┌────────────────────────────┐
        │ N2: if (!exists)     ◇     │
        └───────┬────────────┬───────┘
        true (not found)     false (exists)
                │                    │
                ▼                    ▼
   ┌─────────────────────┐  ┌────────────────────────────┐
   │ N3: throw            │  │ N4: existing = await        │
   │  ApiError.notFound() │  │  findByUserAndAttraction()  │
   └───────────┬───────────┘  └─────────────┬──────────────┘
               │                             ▼
               │              ┌────────────────────────────┐
               │              │ N5: if (existing)     ◇     │
               │              └───────┬────────────┬────────┘
               │             true (duplicate)   false (no dup)
               │                      │                 │
               │                      ▼                 ▼
               │        ┌──────────────────────┐ ┌─────────────────────┐
               │        │ N6: throw             │ │ N7: review = await   │
               │        │  ApiError.conflict()  │ │  repository.create() │
               │        └──────────┬─────────────┘ └──────────┬────────┘
               │                   │                           ▼
               │                   │              ┌─────────────────────┐
               │                   │              │ N8: await             │
               │                   │              │  syncAttractionRating │
               │                   │              └──────────┬────────┘
               │                   │                          ▼
               │                   │              ┌─────────────────────┐
               │                   │              │ N9: return review     │
               │                   │              └──────────┬────────┘
               │                   │                          │
               └───────────────────┴──────────────────────────┘
                                    ▼
                              ┌──────────┐
                              │  EXIT    │
                              └──────────┘
```

Nodes: {N1, N2, N3, N4, N5, N6, N7, N8, N9, EXIT} → **N = 10**
Edges: N1→N2, N2→N3, N2→N4, N4→N5, N5→N6, N5→N7, N7→N8, N8→N9, N3→EXIT, N6→EXIT, N9→EXIT → **E = 11**

## Cyclomatic complexity

Using McCabe's formula for a graph with a single connected component:

```
V(G) = E − N + 2P   (P = number of connected components = 1)
     = 11 − 10 + 2
     = 3
```

Cross-checked with the simpler decision-point formula (valid because both `if`s are simple, non-compound predicates):

```
V(G) = (number of decision points) + 1 = 2 + 1 = 3
```

Both agree: **cyclomatic complexity = 3**, meaning 3 linearly independent paths form a basis for all possible paths through this function.

## Independent paths (basis set) and branch coverage

| Path | Route | Meaning | Which decision outcomes it exercises |
|---|---|---|---|
| P1 | N1→N2→N3→EXIT | Attraction does not exist → 404 | N2 = **true** |
| P2 | N1→N2→N4→N5→N6→EXIT | Attraction exists, duplicate review → 409 | N2 = false, N5 = **true** |
| P3 | N1→N2→N4→N5→N7→N8→N9→EXIT | Attraction exists, no duplicate → 201 success | N2 = false, N5 = **false** |

Executing P1, P2, and P3 together touches both `true` and `false` outcomes of both decisions (N2 and N5) — i.e. this 3-path basis set is sufficient for **100% branch coverage** of this function.

## Mapping to the test suite

This is the detail worth stating explicitly in the oral defense: **not every test case in the suite reaches `reviewService.create` at all** — several are rejected earlier in the pipeline (auth middleware, or Zod schema validation), which is correct behavior but means they don't exercise *this* function's branches:

| Path | Exercised by | Reaches `create()`? |
|---|---|---|
| P1 (not found) | TC-11 | Yes — this is the only case that reaches `create()` and hits N2=true |
| P2 (duplicate) | TC-12 (its second call) | Yes — reaches N5=true |
| P3 (success) | TC-01, TC-02, TC-03, TC-06, TC-08, INT-01, INT-02 | Yes — all valid, non-duplicate inputs |
| — | TC-04, TC-05, TC-07, TC-09, TC-13 | **No** — rejected by the Zod validator (`review.validator.ts`) before the controller/service ever runs |
| — | TC-10 | **No** — rejected by the `requireAuth` middleware before validation even runs |

This confirms the black-box-derived suite (designed purely from the API contract, Task 2) happens to already achieve full branch coverage of the in-scope function — see [coverage-report.md](coverage-report.md) for the tool-measured figures confirming this.
