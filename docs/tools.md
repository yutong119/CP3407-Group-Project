---
layout: page
title: Development Tools
permalink: /tools/
---

# SafeStay Development and Build Tools

SafeStay intentionally uses a lightweight web stack that can be demonstrated on a standard laptop without a frontend build pipeline. The backend uses npm-managed Node.js packages, while the frontend is static HTML/CSS/JavaScript served by Python's built-in HTTP server for the assessment demo.

## 1. Core languages and platforms

| Tool / technology | How SafeStay uses it | Why it fits this project |
| --- | --- | --- |
| HTML5 | Structure for ten user-facing pages | Native browser support and simple deployment |
| CSS3 | Page styling plus shared responsive rules | No framework dependency; precise control over mobile/desktop layout |
| Vanilla JavaScript | UI logic, API calls, local/session storage and i18n | Keeps frontend setup minimal and transparent |
| Node.js | Backend JavaScript runtime and E2E test runtime | Same language across frontend/backend logic; mature package ecosystem |
| Express 4.18.2 | REST API routing and middleware | Small, modular API suitable for the project's scale |
| MySQL 8+ | Persistent relational data | Strong fit for users/cases/categories/evidence/template relationships |
| Python 3 HTTP server | Serves static frontend during demo | Zero frontend package/build dependency |

## 2. Backend npm libraries

The versions below come from `backend/package.json`.

| Library | Version | How it is used |
| --- | --- | --- |
| `express` | `^4.18.2` | API server and route modules |
| `mysql2` | `^3.6.0` | Promise-based MySQL pool and parameterised queries |
| `bcryptjs` | `^2.4.3` | Password hashing and password verification |
| `jsonwebtoken` | `^9.0.3` | JWT issuance and protected-route authentication |
| `multer` | `^1.4.5-lts.1` | Evidence-file upload handling, MIME checks and size limit |
| `express-validator` | `^7.0.0` | Registration and case-creation validation |
| `cors` | `^2.8.5` | Browser frontend/API cross-origin access |
| `dotenv` | `^16.3.1` | Local environment configuration |
| `openai` | `^6.49.0` | Optional incident classification and recommended-action generation |
| `nodemon` | `^3.0.1` (dev) | Auto-restart backend during development |

## 3. Frontend libraries and browser APIs

### jsPDF 2.5.1

`result.html` loads jsPDF from CDN and generates an A4 formal incident report in the browser. The server supplies structured report data; PDF formatting/download happens client-side.

### Google Fonts (Inter)

The UI loads the Inter typeface for consistent modern typography.

### Browser storage

- `localStorage` stores the JWT token and selected UI language.
- `sessionStorage` temporarily carries analysis data between the Describe and result/support pages.

### Browser/device APIs

- Geolocation is used by the Describe page when the user requests current location.
- `tel:` is used for phone contacts on mobile devices.
- `mailto:` is used for email contacts.
- Standard `fetch()` is used for all frontend/backend HTTP communication.

## 4. AI tool integration

The backend uses the OpenAI Node library only when `AI_MODE=openai` is enabled and a valid key is available. The implementation requests JSON output from `gpt-4o-mini`, normalises classification results to the six supported categories and three allowed urgency levels, and falls back to deterministic rules if the call fails.

For reliable assessment, `AI_MODE=rule` is recommended. This design prevents OpenAI availability from becoming a single point of failure.

## 5. Database development tools

The authoritative schema is stored as `database/database.sql`, which drops/recreates the database and inserts assessment data. `database/DATA_DICTIONARY.md` documents each table and relationship. The final repository also includes an exported ERD image used on the Design page.

The marking rubric asks for an online database diagram tool; keep/export the source diagram from the tool your team actually used and, if appropriate, link it next to the ERD image.

## 6. Git and GitHub

Git/GitHub were used for distributed version control, feature branches, integration and Pull Requests. The final repository includes branches for frontend, backend, database, multilingual work, documentation and final integration. `main` contains 105 commits in the supplied final ZIP, and Pull Request #69 performed the final integration merge on 7 August 2026.

Useful evidence includes:

```bash
git log --oneline --graph --decorate
git branch -a
git status
```

The final merge process also preserved a dedicated `final-integration` branch so the combined frontend/backend/database system could be tested before updating `main`.

## 7. Demo/build automation

### Root npm scripts

`package.json` defines two teacher/demo commands:

```bash
npm run start:demo
npm run test:e2e
```

### `start-demo.sh`

The shell script:

- checks that Node.js, npm, Python 3 and `lsof` are installed;
- checks that backend dependencies exist;
- checks ports 5001 and 8000 before starting;
- launches the backend and frontend;
- records logs under `.demo-logs/`;
- prints localhost and LAN URLs; and
- terminates child services when the script exits.

This reduces setup differences between developers and the assessor.

## 8. Development editor and debugging

The team used standard browser developer tools and local terminal logs to debug API/UI behaviour. Backend development can use `npm run dev` with nodemon, while browser console/network tools expose frontend request errors. Git was used to isolate fixes and merge feature work.

## 9. Environment configuration

The backend reads configuration from `.env` via dotenv. The repository includes `.env.example`; the real `.env` is excluded by `.gitignore`.

Important variables are:

```text
DB_HOST
DB_USER
DB_PASSWORD
DB_NAME
DB_PORT
JWT_SECRET
JWT_EXPIRE
PORT
UPLOAD_DIR
OPENAI_API_KEY
AI_MODE
```

For the teacher demo, the documented runtime uses backend port `5001`, frontend port `8000`, and `AI_MODE=rule` for deterministic behaviour.

## 10. Why this toolchain was chosen

The stack balances implementation speed and traceability. Static frontend files avoid a build framework; Express keeps endpoints modular; MySQL models the relational domain clearly; npm manages backend dependencies; GitHub records iterative engineering work; and the optional AI integration is isolated behind a stable rule/database fallback. The result is a system that can be run, tested and demonstrated with a small number of transparent commands.
