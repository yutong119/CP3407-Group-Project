---
layout: page
title: Design
permalink: /design/
---

# SafeStay Design

The design separates the browser interface, API/application logic and persistent data so that each major component has a clear responsibility. This makes the system easier to test, replace and extend while keeping the assessment/demo environment simple to run locally.

## 1. Architectural design

### 1.1 Component responsibilities

| Component | Main responsibility | Current implementation |
| --- | --- | --- |
| Presentation layer | Collect input and present guidance/case information | Multi-page HTML/CSS/JavaScript frontend |
| Frontend API client | Centralise HTTP calls and JWT handling | `frontend/api.js` |
| Internationalisation | Load locale JSON and translate UI elements | `frontend/i18n.js` + four locale files |
| HTTP API layer | Route requests, parse input and return JSON | Express app in `backend/server.js` |
| Authentication middleware | Protect user-specific resources | JWT verification in `backend/middleware/auth.js` |
| Application services | Classification, fallback, templates and checklist creation | `analysisService.js`, `templateService.js`, `checklistService.js` |
| Data access | Reusable pooled MySQL connections and parameterised queries | `mysql2/promise` connection pool |
| Persistent data | Users, cases, evidence metadata, templates, steps and contacts | MySQL `safestay_db` |
| File storage | Store uploaded evidence files | `backend/uploads/` via Multer |
| Optional external AI | Enhance classification/actions when explicitly enabled | OpenAI `gpt-4o-mini` |

### 1.2 Runtime data flow

```text
Student browser
    │
    ├── HTML/CSS pages + i18n.js
    │
    └── frontend/api.js
            │  HTTP/JSON + Bearer JWT
            ▼
       Express API (port 5001 in demo)
            │
            ├── auth/users/cases/evidence/categories routes
            ├── analyze route
            │      ├── analysisService
            │      │      ├── deterministic rule classifier
            │      │      └── optional OpenAI classification/action generation
            │      └── templateService
            │
            ├── checklistService
            │
            ├── MySQL connection pool ─────► safestay_db
            │
            └── Multer file storage ───────► backend/uploads/
```

This flow is deliberately layered: the frontend never talks directly to MySQL, protected case/evidence/profile actions pass through JWT middleware, and database-backed guidance remains available even when the optional OpenAI path is disabled or unavailable.

### 1.3 UML Component Architecture

The following UML component diagram presents the overall architecture of SafeStay and the relationships between its major software components.

![SafeStay UML Component Architecture]({{ '/assets/architecture-uml.png' | relative_url }})

The architecture follows a layered structure. The frontend web application communicates with the Express backend through RESTful HTTP requests using JSON. Authentication is managed using JWT and bcrypt, while incident analysis supports both deterministic rule-based processing and optional OpenAI enhancement.

Backend routes coordinate the main application functions, including authentication, case management, incident analysis, evidence management and reporting. Application services retrieve persistent guidance, checklist templates and authority contact information from the MySQL database.

This separation keeps presentation, application logic and persistent data independent, making the system easier to maintain, test and extend.

## 2. Database design

The final database contains **8 tables** and uses foreign keys to keep users, categories, cases, evidence and guidance data connected.

![SafeStay final ERD]({{ '/assets/CP3407ERD-diagram.png' | relative_url }})

### 2.1 Table responsibilities

| Table | Purpose |
| --- | --- |
| `users` | Account identity, bcrypt password hash and preferred language |
| `case_categories` | Master list of six supported incident categories |
| `student_cases` | Core incident record and status/urgency/classification data |
| `evidence_files` | Uploaded evidence metadata linked to a case |
| `checklist_items` | Persistent completion state for each case |
| `checklist_templates` | Category-specific default evidence/checklist requirements |
| `guidance_steps` | Ordered category-specific next-step guidance |
| `authority_contacts` | General or category-specific support/emergency contacts |

### 2.2 Key relationships

- One user can own many student cases.
- One category can classify many cases and define many checklist templates, guidance steps and authority contacts.
- One case can own many evidence-file records and many persistent checklist items.
- `authority_contacts.category_id` is nullable so general contacts can be returned alongside category-specific contacts.

### 2.3 Database design justification

The schema separates **case-specific state** (`student_cases`, `evidence_files`, `checklist_items`) from **reusable category templates** (`checklist_templates`, `guidance_steps`, `authority_contacts`). This avoids copying the same reference guidance into every case while still allowing each case to persist its own progress. Parameterised `mysql2` queries are used throughout the backend instead of string-concatenating user values.

## 3. Interface design

SafeStay uses a guided multi-page workflow rather than exposing database concepts directly to the student. The current frontend contains ten user-facing pages:

| Page | Main purpose |
| --- | --- |
| `index.html` | Landing page, common case shortcuts, emergency entry point |
| `login.html` | Registration and login |
| `describe.html` | Natural-language incident description, location and optional evidence |
| `result.html` | Detected case, urgency, recommendations and formal report/PDF |
| `history.html` | User case history |
| `case_details.html` | Detailed case metadata, status and links to support functions |
| `evidence.html` | Persistent evidence checklist |
| `contacts.html` | Category-relevant authority/support contacts |
| `profile.html` | Profile, language, notifications and recent cases |
| `language.html` | Language selection and persistence |

### 3.1 Navigation and task flow

The primary workflow is intentionally linear at the start and non-linear after a case is created:

```text
Home → Login/Register → Describe → Analysis Result
                                  │
                                  ├── Evidence Checklist
                                  ├── Recommended Contacts
                                  ├── Formal Report / PDF
                                  └── History → Case Details → update/revisit
```

### 3.2 Responsive and mobile design

The shared `responsive.css` enforces a minimum 44px control height, prevents horizontal overflow, widens layouts for tablets/desktops and collapses grids for narrow phones. Contact actions are device aware: telephone links open the dialler on mobile, while desktop users receive a copy-number modal. The frontend API base URL uses the current browser hostname with backend port `5001`, allowing a phone on the same LAN to use the same backend host without editing JavaScript.

### 3.3 Internationalisation design

`i18n.js` reads a stored language code, loads English as the fallback locale, loads the selected locale, and applies text/placeholder/title/ARIA translations using `data-i18n*` attributes. This keeps page layout separate from translated strings and provides a predictable English fallback when a translation key cannot be loaded.

### 3.4 Interface Prototype

The following image is a temporary visual reference used while preparing the final interface prototype.

![SafeStay temporary UI design reference]({{ '/assets/ui-prototype-placeholder.jpg' | relative_url }})

The final prototype will be recreated using the required online prototyping tool and will demonstrate the planned navigation and visual structure of the major SafeStay screens.

## 4. Important design decisions

### Database-backed guidance with AI fallback

SafeStay does not depend on generative AI for core operation. In stable `AI_MODE=rule`, the classifier is deterministic and category guidance comes from MySQL. In optional `AI_MODE=openai`, OpenAI can classify multilingual natural-language incidents and generate context-aware actions. OpenAI output is normalised to the six allowed categories, three urgency levels and a 0–100 probability; failure falls back to the deterministic classifier.

### Authentication and ownership checks

Passwords are hashed with bcrypt. JWT tokens identify the signed-in user, and case/evidence/profile endpoints verify authentication before exposing user-specific information. Case and evidence queries include ownership checks so one user cannot retrieve another user's case through the normal API.

### Reusable templates and persistent case progress

When a case is created, checklist items are copied from the selected category's templates into case-specific `checklist_items`. The student can then mark items complete without changing the shared template used by future cases.

### Local demo deployment

The root `start-demo.sh` starts the backend and frontend together, writes logs to `.demo-logs/`, checks for required commands/port conflicts, and prints both localhost and LAN URLs. This provides a repeatable demonstration environment while keeping the production components independently testable.
