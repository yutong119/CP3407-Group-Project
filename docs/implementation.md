---
layout: page
title: Implementation
permalink: /implementation/
---

# SafeStay Implementation

SafeStay was delivered incrementally rather than as one large final commit. The Git history records a progression from repository setup and static pages, through database/backend integration, to analysis, case workflow, multilingual/responsive improvements, and final testing/documentation hardening.

## 1. Iterative delivery evidence

The following timeline is derived from the final repository's Git history.

| Iteration / period | Delivered work | Representative repository evidence |
| --- | --- | --- |
| Project setup — 18 May | Initial repository structure and documentation foundation | `9a8cb95`, `245278d` |
| Iteration 1 — 9–18 Jun | Core Home/Login/Describe/Result UI, initial database tables, Express server, JWT authentication, user/case/category/evidence APIs, frontend API client and integration guide | `dd1d34c`–`fda290d`, `62bfa19`–`501d0a9` |
| Iteration 2 — 19 Jun–20 Jul | Emergency contacts, evidence checklist, incident analysis endpoint, category template tables, guidance steps, authority contacts, integrated result flow and richer seeded test data | `aac0091`, `fd646e6`, `9f2f9a5`, `d40dfd2`, `b430355`, `7c72161`, database sample-data commits |
| Iteration 3 — 27–28 Jul | Optional OpenAI analysis, History/Case Details/Profile/Language pages, multilingual UI, responsive layout, navigation fixes and case-display fixes | `44f1879`, `846350a`, `7f59dbb`, `ec7c868`, `cbe27cb`, `0843225`, `7dceeb1`, `1fd4b2f` |
| Final hardening — 3–7 Aug | Checklist persistence fix, OpenAI probability normalisation, formal report/PDF, device-aware contacts, multilingual AI actions, UI polish, teacher demo package, automated E2E tests, final ERD and final integration PR | `f1d16dd`–`fd5ea43`, `09f5bb2`, `eeb74bc`, PR #69 (`f021b48`) |

This history shows repeated integration of frontend, backend and database branches rather than isolated component development.

## 2. Delivered frontend

The final frontend is a responsive multi-page web interface using HTML5, CSS3 and vanilla JavaScript. A single `SafeStayAPI` client centralises backend calls and token handling, while `i18n.js` centralises translation loading.

Key delivered behaviours include:

- Register and login, including automatic login after registration.
- Authenticated navigation to personal cases and profile.
- Natural-language incident submission with backend analysis before case creation.
- Session caching of analysis data for result/evidence/contact views.
- Optional evidence upload during incident creation and later evidence management.
- Analysis result display with category, urgency, confidence, recommended actions and contacts.
- Case history and detailed case view with persistent status changes.
- Persistent checklist completion.
- Formal report generation and client-side PDF export through jsPDF.
- Four-language UI with profile persistence.
- Responsive desktop/tablet/mobile layouts and device-aware contact actions.

## 3. Delivered backend

The backend is a modular Express API rather than a single monolithic handler.

### Routing modules

| Module | Main endpoints / behaviour |
| --- | --- |
| `routes/auth.js` | Register, login, validation, bcrypt hashing, JWT issuance |
| `routes/users.js` | Profile read/update and password change |
| `routes/categories.js` | Read case categories |
| `routes/analyze.js` | Analyse incident and combine classification with guidance/checklist/contact data |
| `routes/cases.js` | Case CRUD, checklist persistence, case detail aggregation and formal report payload |
| `routes/evidence.js` | Authenticated upload/list/delete with ownership checks |

### Service modules

`analysisService.js` implements the deterministic multilingual keyword classifier and optional OpenAI path. `templateService.js` reads category guidance, checklist templates and contacts from MySQL. `checklistService.js` creates case-specific checklist rows from templates and supports persistent progress.

### Server and data access

`server.js` configures CORS, JSON/form parsing, `/uploads` static serving, a reusable `mysql2/promise` connection pool, route mounting, a health endpoint and central error handling. Database values are passed through parameterised queries.

## 4. Delivered database

`database/database.sql` can recreate `safestay_db` from scratch and seeds data suitable for demonstration/testing. It includes eight tables covering accounts, categories, cases, evidence, persistent checklist items, checklist templates, guidance steps and authority contacts.

The final database branch also supplied the ERD used in the Design page.

## 5. Incident-analysis implementation

SafeStay supports two execution modes configured by `AI_MODE`.

### Deterministic rule mode

`AI_MODE=rule` is the recommended marking/demo baseline. `detectIncident()` checks multilingual terms for the supported categories and returns a stable category, urgency and probability. This makes tests repeatable and ensures the system functions without an external API key.

### Optional OpenAI mode

When `AI_MODE=openai` and `OPENAI_API_KEY` is configured, the backend calls `gpt-4o-mini` using JSON response format. Classification output is constrained and normalised before use. A second optional AI call can generate 3–5 concise recommended actions and a priority message in the preferred/user language. If either AI call fails, SafeStay falls back to rule classification and database guidance.

This hybrid design preserves reliability while allowing an enhanced natural-language experience.

## 6. Formal report implementation

The case report endpoint aggregates:

- the owned case record;
- an incident summary;
- guidance steps;
- checklist state and template requirements;
- uploaded evidence metadata;
- recommended contacts;
- a generated formal message; and
- a generation timestamp.

`result.html` renders that data and uses jsPDF 2.5.1 to create an A4 PDF on the client side.

## 7. Demo and integration workflow

The root `start-demo.sh` provides a repeatable demonstration environment. It checks for Node.js, npm, Python 3 and `lsof`; verifies that backend dependencies exist; checks ports; starts the backend on port 5001 and the frontend on port 8000; stores logs; and prints a LAN URL for phone testing.

From the project root:

```bash
npm run start:demo
```

The automated E2E suite can then run in a second terminal:

```bash
npm run test:e2e
```

## 8. Git and GitHub version-control evidence

The final `main` history contains **105 commits**. The repository shows separate development branches for frontend, backend, database, multilingual work, documentation and final integration. The final integration process used a dedicated `final-integration` branch and Pull Request #69 to merge the combined system into `main` on 7 August 2026.

This branching history provides traceability from feature work to integration fixes and final acceptance testing. Commit messages also show targeted fixes such as `correct case details page navigation from history`, `Fix checklist persistence and history progress display`, and `Normalize OpenAI probability output` rather than only large undifferentiated commits.

## 9. Demonstration evidence to add before final submission

The code repository contains the runnable teacher demo package and test guide, but it does not contain final UI screenshots or written client-feedback records. To meet the marking rubric without inventing evidence, add the real artifacts your team actually produced.

Recommended screenshot set:

| Screenshot | What it should prove |
| --- | --- |
| Home | Final responsive landing experience and emergency entry point |
| Describe | Natural-language incident input, evidence and location |
| Result | Detected category, urgency, confidence and recommended actions |
| Evidence | Category-specific checklist and saved completion state |
| Contacts | Relevant authority contacts and action buttons |
| History + Case Details | Persisted case lifecycle and navigation |
| Language | Four-language selection/persistence |
| Formal Report/PDF | Structured report generated from case data |
| E2E terminal | Final PASS output with `Total failures: 0` |

### Client feedback

**Action required:** insert the actual client/lecturer feedback received after each iteration and state the concrete change made in response. The ZIP does not contain those feedback records, so this page deliberately does not fabricate them.

A concise evidence table can use this format:

| Iteration | Feedback received | Change implemented | Commit / screenshot evidence |
| --- | --- | --- | --- |
| 1 | _Add actual feedback_ | _Add actual response_ | _Commit / image_ |
| 2 | _Add actual feedback_ | _Add actual response_ | _Commit / image_ |
| 3 | _Add actual feedback_ | _Add actual response_ | _Commit / image_ |
