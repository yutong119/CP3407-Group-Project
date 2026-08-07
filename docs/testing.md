---
layout: page
title: Testing
permalink: /testing/
---

# SafeStay Testing

SafeStay combines deterministic test configuration, a teacher-oriented manual acceptance workflow and an automated end-to-end regression test. The final test package is runnable from the repository root and does not require OpenAI to be available.

## 1. Testing strategy

The assessment baseline uses `AI_MODE=rule` so incident classification is deterministic. This prevents an external AI response from making the core marking workflow variable while still exercising the same API, database, authentication and case-management paths used by the frontend.

The testing approach covers:

- backend availability and public reference data;
- registration/login and JWT access control;
- user profile retrieval and preference persistence;
- multilingual incident analysis;
- case creation/read/history/update;
- checklist creation and persistence;
- formal report aggregation;
- manual UI, responsive, evidence-upload and contact-action acceptance checks.

## 2. Automated E2E test

The root script is defined in `package.json`:

```bash
npm run test:e2e
```

It executes `tests/e2e-test.js`, automatically discovers a running backend at port 5001 or 5000, applies a 15-second request timeout and creates a unique teacher-demo user so repeated runs do not collide with an existing email.

### Final E2E result — 7 August 2026

The final pre-documentation run was executed against `http://localhost:5001` and completed with **0 failures**.

| # | Check | Final result | What it verifies |
| ---: | --- | --- | --- |
| 1 | Backend base URL discovery | PASS | Test can locate the running API |
| 2 | Backend health | PASS (`200`) | `/api/health` is available |
| 3 | Categories | PASS (`count=6`) | Six incident categories are returned |
| 4 | Register | PASS (`201`) | New account creation and DB write |
| 5 | Login | PASS (`200`) | Credential check and JWT issuance |
| 6 | Protected route authorization | PASS (`401`) | Protected profile rejects missing JWT |
| 7 | Profile | PASS (`200`) | JWT-authenticated user profile retrieval |
| 8 | Analyze | PASS (`200`) | Multilingual Chinese incident input is analysed and recommendations returned |
| 9 | Create case | PASS (`201`) | Analysed case is persisted and receives a case ID |
| 10 | Case details | PASS (`200`) | Created case can be retrieved with related data |
| 11 | Checklist persistence | PASS (`200`) | Checklist toggle survives a subsequent GET |
| 12 | Incident history | PASS (`200`) | New case appears in the user's case list |
| 13 | Status update | PASS (`200`) | Case status can be changed and re-read |
| 14 | Formal report | PASS (`200`) | Aggregated report payload is generated for the owned case |
| 15 | Language preference | PASS (`200`) | Preferred language update persists to profile |

Final console summary:

```text
Executed against: http://localhost:5001
Created user_id: 14, case_id: 55
Total failures: 0
```

The IDs above are transient records produced by that specific test run; future runs intentionally create new records.

## 3. What the E2E script does internally

The automated flow uses real HTTP requests and the configured MySQL database rather than mocking the API. It registers a unique user, logs in, captures the JWT, validates that the same protected route returns `401` without the token, analyses a Chinese incident description, creates a case from the analysis result, verifies case retrieval, toggles a real checklist row and reads it again, confirms history inclusion, updates status, retrieves the formal report, and persists a language preference.

Critical failures cause process exit code `1`, which makes the script suitable for repeatable regression checking before a demo or merge.

## 4. Manual acceptance workflow

`TEACHER_TEST_GUIDE.md` defines the assessment workflow below. Before the final merge, registration/login and the core case workflow were also run manually and completed successfully.

| Manual acceptance area | Acceptance expectation | Automation coverage |
| --- | --- | --- |
| Register/login | User can create an account and enter authenticated pages | Covered by E2E |
| Describe non-English incident | Description is accepted and category/urgency returned | API behaviour covered by E2E; page interaction manual |
| Result page | Category, urgency and recommended actions render | Data covered by E2E; rendering manual |
| Case Details | Case metadata and support links are available | Case API covered by E2E; navigation manual |
| Evidence Checklist | Toggle → save → refresh retains state | Persistence covered by E2E; UI manual |
| Contacts | Localised labels; mobile `tel:`; desktop copy-number behaviour | Manual/device acceptance |
| History | Newly created case appears | Covered by E2E |
| Status update | Status persists after reload | Covered by E2E |
| Formal Report | Structured data is present and PDF can be generated | Report API covered by E2E; PDF rendering/download manual |
| Language | Selection persists and translated UI appears after navigation | Backend preference covered by E2E; visual translation manual |
| Evidence upload | Supported file can be uploaded/listed/deleted | Manual/API-specific acceptance recommended |
| Responsive layout | No horizontal overflow and controls remain usable on phone/tablet | Manual/device acceptance |

## 5. Test data

`database/database.sql` recreates `safestay_db` and includes seeded records across all six case categories. It also includes evidence metadata, checklist items, reusable checklist templates, guidance steps and authority contacts. This gives the teacher/demo environment predictable category-specific content without requiring a separate data-loading step after schema import.

The automated E2E test adds its own uniquely named teacher-demo user and case, ensuring the main workflow performs real writes rather than only reading seeded rows.

## 6. Stable and optional AI testing modes

### Stable mode

```env
AI_MODE=rule
```

This is the recommended marking baseline. It is deterministic, does not need an API key and still returns database-backed actions/checklists/contacts.

### Optional AI mode

```env
AI_MODE=openai
OPENAI_API_KEY=<valid key>
```

This can be tested separately for enhanced natural-language classification and language-aware recommended actions. Because external generative output can vary, it should not replace the deterministic baseline acceptance test.

## 7. Failure handling and troubleshooting

The teacher demo documentation includes checks for occupied ports, missing MySQL/database configuration, backend reachability, incomplete database imports and AI-mode differences. `start-demo.sh` also fails early when required commands or `backend/node_modules` are missing and writes frontend/backend logs under `.demo-logs/`.

## 8. Test-development evidence

The final repository clearly demonstrates automated regression and acceptance-style testing, including a dedicated E2E suite and a repeatable teacher test guide. The repository history does **not** by itself prove that every feature was implemented using strict test-first/TDD commit ordering. If your team has genuine TDD evidence (tests written before implementation, red/green/refactor screenshots or commit links), add that evidence here rather than claiming it without support.
