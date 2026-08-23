# SEN 3241 — Software Validation & Verification Campaign

**REGISTRATION NUMBER: _______________** (write this on every file before submission — the paper requires it on every page/document)

**Application under test:** Visit Yaoundé — the tourism platform capstone project in this same repository (`services/`, `frontend/`, `legacy-monolith/`).

**Core feature under campaign:** Review creation — `POST /api/v1/attractions/:id/reviews`, implemented in `services/engagement-service/src/{controllers,services,repositories,validators}/review*.ts`.

This feature was picked deliberately, not arbitrarily — say this if asked:
- It has two genuinely input-rich fields with clean, defensible boundaries: `rating` (integer, 1–5) and `comment` (string length, 5–2000 chars) — ideal for equivalence partitioning + boundary value analysis (Task 2b).
- Its service function (`reviewService.create`) has real decision branches (attraction-not-found, duplicate-review, success) — enough for a non-trivial control-flow graph (Task 4a).
- It's a genuine cross-service interaction in this microservices architecture: creating a review calls out to `attractions-service` (to check the attraction exists, and to push back the new rating average) — a real integration boundary to test (Task 3b).

## Where everything lives

| Task | Marks | File(s) |
|---|---|---|
| Task 1 — V&V Foundations | 12 | [task1-foundations.md](task1-foundations.md) |
| Task 2 — Test Design & Specification | 18 | [task2-test-design/test-plan.md](task2-test-design/test-plan.md), [task2-test-design/test-suite.md](task2-test-design/test-suite.md), [task2-test-design/ep-bva-analysis.md](task2-test-design/ep-bva-analysis.md) |
| Task 3 — Automated Test Implementation | 16 | `services/engagement-service/tests/review.vv.test.ts` (added to the real codebase so it actually runs against real code — see below) |
| Task 4 — Structural (White-Box) Coverage | 14 | [task4-structural-coverage/cfg-analysis.md](task4-structural-coverage/cfg-analysis.md), [task4-structural-coverage/coverage-report.md](task4-structural-coverage/coverage-report.md) |
| Task 5 — Defect Reporting & Fault Model | 10 | [task5-defects/defect-log.md](task5-defects/defect-log.md), [task5-defects/fault-model.md](task5-defects/fault-model.md) |

## Why the automated tests aren't inside `exam-vv/`

Task 3 requires tests that "run and report pass/fail" against a "real framework." A test file sitting in a standalone folder can't import and exercise the actual `reviewService`/`reviewController` code — so the automated test file lives where the code it tests lives: `services/engagement-service/tests/review.vv.test.ts`. This is the one addition made outside this folder; nothing else in the existing app was changed.

## How to run it (say this out loud in the oral defense)

```bash
cd services/engagement-service
npm test                          # runs the full suite, including review.vv.test.ts
npm run test:coverage             # runs with coverage instrumentation (statement + branch %)
```

Coverage output lands in `services/engagement-service/coverage/` (HTML report at `coverage/lcov-report/index.html`, plus a text summary printed to the terminal). Figures reported in [task4-structural-coverage/coverage-report.md](task4-structural-coverage/coverage-report.md) were taken from a real run — rerun it yourself before the exam to confirm they still match.
