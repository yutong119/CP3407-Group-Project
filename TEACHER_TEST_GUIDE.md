# SafeStay Teacher Demo Package

This guide helps a teacher run a reliable end-to-end demo of SafeStay in a classroom or assessment environment.

## 1. Prerequisites

- macOS/Linux terminal (or Windows with WSL/Git Bash)
- Node.js 18+
- npm 9+
- MySQL 8+
- Python 3 (for static frontend server)
- Network access to `localhost`

Check versions:

```bash
node -v
npm -v
python3 --version
mysql --version
```

## 2. Database Import

From project root:

```bash
mysql -u root -p < database/database.sql
```

This script recreates `safestay_db` and inserts sample data.

## 3. Backend Setup

```bash
cd backend
npm install
cp .env.example .env
```

Edit `backend/.env` and verify these values:

- `DB_HOST=localhost`
- `DB_USER=<your user>`
- `DB_PASSWORD=<your password>`
- `DB_NAME=safestay_db`
- `DB_PORT=3306`
- `JWT_SECRET=<any non-empty secret>`
- `PORT=5001`
- `AI_MODE=rule` (for stable deterministic marking)

## 4. Frontend Setup

No frontend dependencies are required.

```bash
cd frontend
python3 -m http.server 8000
```

Open:

- `http://localhost:8000/index.html`

## 5. Environment Configuration

Recommended baseline for assessment consistency:

- `AI_MODE=rule`
- `OPENAI_API_KEY` unset or left as placeholder
- `PORT=5001`

Reason: `AI_MODE=rule` produces predictable classification and action fallback behavior.

## 6. Stable Testing Mode (`AI_MODE=rule`)

In `backend/.env`:

```env
AI_MODE=rule
```

Then start backend:

```bash
cd backend
npm start
```

Expected:

- `/api/health` returns status OK
- Analysis still works without external AI keys
- Contacts/actions fall back to template guidance when OpenAI generation is unavailable

## 7. Optional OpenAI Mode

If teacher wants to evaluate AI-enhanced recommendations:

1. Set in `backend/.env`:

```env
AI_MODE=openai
OPENAI_API_KEY=<your key>
```

2. Restart backend.

Expected:

- Analyze endpoint still classifies incident
- Recommended actions and priority message may be more context-specific and language-aware

## 8. Full Manual Testing Workflow

1. Start backend (`npm start` in `backend/`).
2. Start frontend (`python3 -m http.server 8000` in `frontend/`).
3. Open `http://localhost:8000/index.html`.
4. Register a new user and log in.
5. Create a case from Describe page:
   - Try non-English description input (for example Chinese/Japanese/French).
6. Verify Result page:
   - detected case
   - urgency
   - recommended actions
7. Open Case Details:
   - verify core metadata and links
8. Open Evidence Checklist:
   - toggle items, save, refresh page, verify persistence
9. Open Contacts:
   - verify button labels are localized (`Call/Email/Visit` equivalents)
   - on desktop: Call shows modal with localized `Copy Number`/`Close`
   - on mobile: phone contacts trigger `tel:`
10. Open History:
   - new case appears in listing
11. Update case status in Case Details and verify it persists.
12. Generate Formal Report and verify data is present.
13. Change language preference and confirm translated UI after navigation.

## 9. Automated E2E Workflow

From project root:

```bash
npm run test:e2e
```

The script validates:

- backend health
- categories
- register/login
- profile
- analyze
- create case
- case details
- checklist persistence
- incident history
- status update
- formal report
- language preference
- protected route authorization

Output format uses clear `PASS` / `FAIL` lines.

Critical failures exit with code `1`.

## 10. Expected Results

- Frontend is reachable at `http://localhost:8000/index.html`
- Backend is reachable at `http://localhost:5001/api/health`
- E2E test completes with all PASS checks
- Checklist state persists after refresh
- Contacts button copy/modal labels are localized
- Non-English incident descriptions are accepted and analyzed

## 11. Troubleshooting Guide

### Backend cannot start

- Check `backend/.env` database credentials.
- Ensure MySQL is running.
- Verify `PORT` not occupied:

```bash
lsof -iTCP:5001 -sTCP:LISTEN
```

### Frontend cannot call backend

- Confirm backend is listening on `5001`.
- Confirm frontend is served via HTTP (not `file://`).

### E2E fails at register

- If email collision occurs, rerun test (script uses unique timestamp email).
- Check DB write permissions.

### E2E fails at checklist/formal report

- Confirm `database.sql` imported completely, including templates and guidance tables.

### AI behavior differs from expected

- For deterministic marking, keep `AI_MODE=rule`.
- OpenAI mode can produce variable text outputs by design.

## 12. Mobile Testing Instructions

1. Connect phone and computer to same Wi-Fi.
2. Find LAN IP on macOS:

```bash
ipconfig getifaddr en0
```

3. Open on phone:

```text
http://<LAN_IP>:8000/index.html
```

4. Verify contacts behavior:

- Phone number contact should open dialer (`tel:`).
- Email-only contact opens mail app (`mailto:`).
- Website-only contact opens browser tab.

5. Verify responsive layout:

- no horizontal overflow
- readable controls
- tappable buttons (44px minimum touch target)