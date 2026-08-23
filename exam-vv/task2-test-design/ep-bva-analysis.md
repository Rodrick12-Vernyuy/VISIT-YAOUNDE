# Black-Box Test Design — Equivalence Partitioning & Boundary Value Analysis

**Registration number: _______________**

**Function under analysis:** the input validation contract for review creation, specified in `services/engagement-service/src/validators/review.validator.ts`:

```ts
export const createReviewSchema = z.object({
  body: z.object({
    rating: z.number().int().min(1).max(5),
    comment: z.string().min(5).max(2000),
  }),
  ...
});
```

This is a genuinely input-rich function for black-box analysis: two independent input dimensions (`rating` — a bounded integer; `comment` — a bounded-length string), each with its own valid range and multiple ways to be invalid (out of range, wrong type).

## Why these two techniques together

**Equivalence Partitioning (EP)** divides the input domain into classes where every member of a class is expected to be treated identically by the system — so testing *one* representative per class is (in theory) as good as testing all of them. It tells you *how many* distinct behaviors to test for.

**Boundary Value Analysis (BVA)** is the observation that defects cluster at the *edges* of equivalence classes (off-by-one errors, `<` vs `<=`) — so instead of a random representative, pick the exact boundary and its immediate neighbors. It tells you *exactly which* values to test.

Used together: EP guarantees breadth (every distinct kind of input is represented), BVA guarantees the specific values chosen are the ones most likely to expose a defect.

---

## `rating` — integer, valid range [1, 5]

### Equivalence classes

| Class | Description | Representative | Valid? |
|---|---|---|---|
| R1 | Integer below the minimum | `0`, `-3` | Invalid |
| R2 | Integer within [1, 5] | `1`, `3`, `5` | **Valid** |
| R3 | Integer above the maximum | `6`, `100` | Invalid |
| R4 | Non-integer number | `3.5` | Invalid |
| R5 | Wrong type / missing | `"5"` (string), `null`, field absent | Invalid |

### Boundary values (derived from the single valid boundary [1, 5])

| Boundary | Value | Class | Expected |
|---|---|---|---|
| min − 1 | `0` | R1 | Rejected (400) |
| min | `1` | R2 | **Accepted** |
| min + 1 | `2` | R2 | Accepted (not separately tested — interior point, lower defect risk than the boundary itself) |
| max − 1 | `4` | R2 | Accepted (not separately tested, same reasoning) |
| max | `5` | R2 | **Accepted** |
| max + 1 | `6` | R3 | Rejected (400) |

**Generated test cases:** the four boundary values `0, 1, 5, 6` become **TC-04, TC-02, TC-03, TC-05** respectively. Class R4 (non-integer) is separately represented by **TC-13** (`rating: 3.5`) since BVA only concerns numeric range, not type — a distinct class needs its own representative regardless of boundary proximity. Class R5 (wrong type/missing) is a schema-level rejection identical in shape to R1/R3/R4 (all return 400 from the same Zod parse) and is not separately re-tested here to avoid redundant cases that would not add new information — a defensible black-box scoping decision, stated explicitly per the test plan's "in scope" section.

---

## `comment` — string, valid length range [5, 2000]

### Equivalence classes

| Class | Description | Representative | Valid? |
|---|---|---|---|
| C1 | Length below the minimum | length 0–4 | Invalid |
| C2 | Length within [5, 2000] | length 5–2000 | **Valid** |
| C3 | Length above the maximum | length 2001+ | Invalid |
| C4 | Wrong type / missing | `null`, field absent | Invalid |

### Boundary values (derived from the valid boundary [5, 2000])

| Boundary | Length | Class | Expected |
|---|---|---|---|
| min − 1 | 4 | C1 | Rejected (400) |
| min | 5 | C2 | **Accepted** |
| min + 1 | 6 | C2 | Accepted (not separately tested — interior point) |
| max − 1 | 1999 | C2 | Accepted (not separately tested) |
| max | 2000 | C2 | **Accepted** |
| max + 1 | 2001 | C3 | Rejected (400) |

**Generated test cases:** the four boundary lengths `4, 5, 2000, 2001` become **TC-07, TC-06, TC-08, TC-09** respectively.

---

## Combined view

`rating` and `comment` are validated independently by the same Zod schema (no cross-field rule between them), so each dimension's boundary cases can be tested while holding the other dimension fixed at a known-valid representative — which is exactly how TC-02 through TC-09 are constructed (each varies exactly one field at its boundary, keeping the other field safely inside its valid class). This isolates which field caused a given rejection, which matters both for defect diagnosis (Task 5) and for keeping each test case's oracle unambiguous.
