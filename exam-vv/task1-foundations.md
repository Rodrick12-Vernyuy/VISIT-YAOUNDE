# Task 1 — V&V Foundations Applied to Visit Yaoundé (12 marks)

**Registration number: _______________**

## 1a. Testing vs. Debugging, Verification vs. Validation (6 marks)

### Testing vs. Debugging

**Testing** is the activity of *executing* the system (or a part of it) with selected inputs to reveal the presence of defects — it is a detection activity, and it does not touch the source code.

- **Concrete example from Visit Yaoundé:** Running `npm test` in `services/engagement-service` executes `tests/reviews.test.ts`, which sends `POST /api/v1/attractions/:id/reviews` with `{ rating: 5, comment: "..." }` twice for the same user/attraction pair and asserts the second call returns HTTP 409. This is testing: it exercises the running application through its real HTTP interface and checks an observable outcome against an expectation, without inspecting or changing a single line of `review.service.ts`.

**Debugging** is the activity that follows a *failed* test (or a bug report): locating the fault in the source code that caused the failure, understanding why, and correcting it. It is a diagnosis-and-repair activity, and it requires reading/stepping through code.

- **Concrete example from Visit Yaoundé:** During development of `auth-service`, the login test intermittently failed with `Unique constraint failed on the fields: (token)` when two logins happened within the same second. Debugging meant reading `src/utils/jwt.ts`, realizing `signRefreshToken` produced an identical JWT for two calls in the same second (because the JWT `iat` claim only has second-level resolution and nothing else in the payload varied), and adding a `jti: crypto.randomUUID()` claim so every signed token is unique regardless of timing. That act — tracing symptom → root cause → source-code fix — is debugging, not testing.

**Two advantages of testing:**
1. It is objective and repeatable — the same test suite can be re-run after every change (regression testing) without needing to re-understand the internals each time.
2. It provides measurable coverage/confidence (e.g. "31/31 tests pass," "78% branch coverage") that can be reported to a stakeholder without them reading code.

**Two advantages of debugging:**
1. It fixes the actual root cause rather than just detecting a symptom — testing alone never repairs anything.
2. It builds precise understanding of the system's internals, which improves the quality of future tests and code (e.g. the `jti` fix above led directly to reviewing every other place tokens were signed).

### Verification vs. Validation

**Verification** asks: *"Are we building the product right?"* — does the software conform to its specification / design, independent of whether that specification is what the user actually wants? It is often done without running the full system (e.g. code review, static analysis, schema/type checking).

- **Concrete example from Visit Yaoundé:** `services/engagement-service/src/validators/review.validator.ts` declares a Zod schema requiring `rating` to be an integer between 1 and 5 and `comment` to be a string of 5–2000 characters. Running `npx tsc --noEmit` (type-checking) and having Zod reject a request with `rating: 7` at runtime are both verification: they check the implementation conforms to the *specified* input contract, not whether "reviews must have a 1–5 rating" is the right rule for users in the first place.

**Validation** asks: *"Are we building the right product?"* — does the software satisfy the actual needs of its users/stakeholders, checked by exercising the real system (often end-to-end) against real usage scenarios.

- **Concrete example from Visit Yaoundé:** Manually registering a real account, browsing `/attractions`, opening an attraction's detail page, submitting a review, and confirming the review appears with the reviewer's name and the attraction's average rating visibly updates — this was done with Playwright driving an actual browser against the running app. It validates that the review feature does what a real tourist/user of the site would expect, which is a different question from "does it match the Zod schema."

**Two advantages of verification:**
1. Cheap and fast to run repeatedly (type-checks and schema checks run in seconds), catching a large class of defects before the system is even started.
2. Pinpoints the defect precisely (e.g. "line 5 of review.validator.ts rejects rating > 5") rather than just showing a symptom.

**Two advantages of validation:**
1. Catches requirement/design errors that verification cannot — code can perfectly satisfy a wrong specification, and only checking against real user needs surfaces that.
2. Builds confidence that the *whole* system (not just isolated units) behaves correctly, since it exercises real end-to-end flows across services (browser → gateway → engagement-service → attractions-service).

---

## 1b. Fault, Error, and Defect/Failure; SDLC vs. STLC (6 marks)

### Fault, Error, Defect/Failure

These three terms describe successive stages of the same underlying problem, from *cause* in the code to *observable symptom* at runtime:

- **Fault (a.k.a. Defect/Bug)** — a static, incorrect element in the code/design itself. It exists whether or not the program is ever run.
  - *Example:* In the pre-refactor version of `review.service.ts`'s `listForAttraction`, the code assumed every `Review` still had a nested `user` relation object (`review.user.fullName`) — a leftover assumption from before the monolith was split into microservices, where `Review` no longer has a DB-level foreign key to `User` at all.

- **Error** — a human mistake made during development that *introduces* a fault (a wrong belief, a mistaken assumption, a slip while typing). The error is the mental/procedural cause; the fault is what ends up in the code.
  - *Example:* The error was the (at-that-point-outdated) assumption "reviews still carry their author's data in the same query" — true in the old monolith where `Review` had a Prisma `include: { user: true }` join, but no longer true once `User` and `Review` moved into separate services/schemas with no cross-service foreign key. That mistaken belief is what caused the fault above.

- **Failure** — the *observable, runtime* deviation of the system from its expected behavior, triggered when execution reaches the fault under the right conditions.
  - *Example:* Loading an attraction's detail page in the browser threw `Cannot read properties of undefined (reading 'fullName')` in `ReviewsSection.tsx:129` and the reviews section crashed instead of rendering — that crash is the failure a user/tester actually observes.

The causal chain here is: **error** (wrong assumption about cross-service data) → **fault** (code that reads `review.user.fullName` from data that no longer contains it) → **failure** (frontend crash when a real review is rendered).

### SDLC vs. STLC activities to be followed for this campaign

**SDLC (Software Development Life Cycle)** activities — building the product:
1. Requirements — capstone brief ("Visit Yaoundé" master prompt): attractions, reviews, favorites, auth.
2. Design — REST API contract, Prisma schema, service boundaries (`auth-service` / `attractions-service` / `engagement-service` / `gateway`).
3. Implementation — writing `review.controller.ts`, `review.service.ts`, `review.repository.ts`, `review.validator.ts`.
4. Deployment — Docker Compose locally, Render/Vercel in production.
5. Maintenance — the ongoing bug fixes described above.

**STLC (Software Testing Life Cycle)** activities — the V&V campaign itself, run in parallel with/after SDLC steps 3–5, and what this dossier documents:
1. Test planning — [task2-test-design/test-plan.md](task2-test-design/test-plan.md): scope, what's in/out, entry/exit criteria.
2. Test case design — [task2-test-design/test-suite.md](task2-test-design/test-suite.md) and the EP/BVA analysis, derived from the requirements/spec (the Zod validator), not from the implementation.
3. Test environment setup — local Postgres via Docker Compose, `tests/env.setup.ts`, mocked `attractionsClient`/`authClient` at the network boundary so tests don't require every service running.
4. Test execution — `npm test` (Task 3), coverage-instrumented run (Task 4).
5. Defect reporting & retesting — [task5-defects/defect-log.md](task5-defects/defect-log.md), then re-running the suite after each fix to confirm closure.
6. Test closure — exit criteria met (all planned test cases executed, target coverage reached or gap explicitly documented).

The key distinction to state clearly under questioning: **SDLC activities produce the software; STLC activities are specifically about planning, designing, executing, and reporting on tests against that software** — STLC is a specialized sub-cycle that runs alongside SDLC, not a replacement for it.
