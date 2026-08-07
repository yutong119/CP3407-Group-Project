---
layout: home
title: SafeStay
permalink: /
---

# SafeStay — Student Incident Reporting and Emergency Guidance Platform

SafeStay is a web-based support platform designed for international students who need clear, practical guidance after incidents such as theft, a lost passport, online fraud, rental disputes, medical emergencies, or other safety-related problems. The delivered system combines a responsive multilingual frontend, a Node.js/Express REST API, a MySQL database, rule-based incident classification with optional OpenAI enhancement, evidence and checklist management, authority contacts, case history, and structured incident reporting.

> **Project goal:** reduce the uncertainty between “something happened” and “I know what to do next” by turning a natural-language incident description into an organised case record, recommended next steps, evidence guidance, and relevant contacts.

---

## Project Information

**Course:** CP3407 Software Engineering Project

**Institution:** James Cook University Singapore

**Semester:** TR3 2026

**Project Type:** Group Project - Group 3

**Supervisor:** Dr. Da Sheng Liu

---

## Development Team 3

| Student | Responsibility |
|---------|----------------|
| Yutong Ji | Backend Development, AI Integration, Documentation |
| Sin Nather Paing | Frontend Development, UI Design |
| Nang Laung Phoung | Database Design, UI Design |

---

## Project Repository

GitHub Repository:

https://github.com/yutong119/CP3407-Group-Project

---

## Repository Structure

The repository is organised into the following major directories.

```text
CP3407-Group-Project
│
├── backend/              Express.js backend server, REST APIs and business logic
├── frontend/             HTML/CSS/JavaScript web application
├── database/             Database schema, SQL scripts and data dictionary
├── docs/                 GitHub Pages project documentation
├── teacher_demo/         Teacher demonstration package and automated testing (including end to end test)
│
├── README.md             Project overview and quick start guide
├── package.json          Teacher demo scripts
├── start-demo.sh         One-command local demonstration launcher
└── .gitignore            Git ignore configuration
```

### Directory Description

| Directory / File | Description |
|------------------|-------------|
| **backend/** | Express.js backend implementing authentication, incident analysis, case management, reporting and REST APIs. |
| **frontend/** | Multi-page responsive web interface developed using HTML, CSS and JavaScript. |
| **database/** | MySQL database schema, SQL initialisation script, ERD and data dictionary. |
| **docs/** | GitHub Pages documentation including Design, Implementation, Testing and Development Tools. |
| **teacher_demo/** | Demonstration package prepared for assessment, including testing instructions and teacher resources. |

| **README.md** | Main project introduction, setup instructions and repository overview. |
| **start-demo.sh** | Starts both frontend and backend services for classroom demonstrations. |
| **package.json** | Provides convenient scripts for teacher demonstrations and automated testing. |

> The repository is organised to clearly separate application code, database resources, documentation and assessment materials, making the project easier to maintain, test and evaluate.
---

## Documentation

- Design
- Implementation
- Testing
- Development Tools

Use the navigation bar above to browse the project documentation.
## Delivered system at a glance

| Area | Delivered implementation |
| --- | --- |
| Frontend | 10 user-facing HTML pages using HTML5, CSS3 and vanilla JavaScript |
| Backend | Node.js + Express REST API with route, middleware and service modules |
| Database | MySQL schema with 8 related tables and seeded assessment/demo data |
| Authentication | Registration/login, bcrypt password hashing and JWT-protected routes |
| Incident analysis | Deterministic rule mode plus optional OpenAI `gpt-4o-mini` mode with rule fallback |
| Guidance | Category-specific guidance steps, evidence checklist templates and authority contacts from MySQL |
| Case management | Create, read, update, delete, status tracking, history and detailed case views |
| Evidence | Authenticated upload, retrieval and deletion of supported files |
| Reporting | Structured formal report data plus client-side PDF generation using jsPDF |
| Internationalisation | English, Simplified Chinese, Japanese and French locale files |
| Responsive behaviour | Shared responsive CSS, 44px touch targets and device-aware phone/email/web contact actions |
| Testing | Teacher demo package, manual acceptance workflow and automated end-to-end regression test |

## How the main user journey works

1. A student registers or logs in.
2. The student describes the incident in natural language and may add location/evidence.
3. SafeStay analyses the description, selects one of six supported categories, estimates urgency/confidence, and retrieves category-specific guidance, checklist templates and authority contacts.
4. The case is stored in MySQL and its checklist becomes persistent per-case data.
5. The student can revisit the case through History/Case Details, upload evidence, update checklist progress and status, open recommended contacts, change language, and generate a formal report/PDF.

## Major delivered features

### Incident categories

SafeStay supports six categories that match the current database and analysis service:

- Theft
- Lost Passport
- Scam / Online Fraud
- Rental Dispute
- Medical Emergency
- Other Issues

### Multilingual interface

The current repository contains four complete locale files under `frontend/locales/`: English (`en`), Simplified Chinese (`zh-CN`), Japanese (`ja`) and French (`fr`). The i18n layer applies translations to page text, placeholders, titles and ARIA labels, while the selected language is cached in `localStorage` and can be persisted to the user profile.

### Stable assessment mode and optional AI mode

SafeStay is intentionally able to run without an external AI key. With `AI_MODE=rule`, classification is deterministic and the backend retrieves stable guidance from the database. With `AI_MODE=openai` and a valid API key, OpenAI can enhance incident classification and generate context/language-aware recommended actions; invalid or unavailable AI output falls back to the rule-based classifier and database templates.

### Emergency and authority contacts

Contacts are stored in the database and can be category-specific or general. On mobile devices, phone contacts use `tel:`. On desktop, the UI presents a copy-number modal instead of attempting to dial. Email-only contacts use `mailto:` and website contacts open secure browser links.

## Project documentation

- [Design]({{ '/design/' | relative_url }}) — architecture, database and interface design
- [Implementation]({{ '/implementation/' | relative_url }}) — iterative delivery, major modules and version-control evidence
- [Testing]({{ '/testing/' | relative_url }}) — automated E2E results, acceptance workflow and test data
- [Development Tools]({{ '/tools/' | relative_url }}) — languages, frameworks, libraries and development/build tools

## Final integration status

The final integration branch combined the latest backend/frontend/multilingual work with the latest database ERD and was merged into `main` through Pull Request #69 on 7 August 2026. The final automated E2E run against `http://localhost:5001` completed with **15 PASS results and 0 failures** before the final documentation work.

---

SafeStay is a student-support and incident-organisation tool. Emergency banners and authority contacts are provided to direct users to appropriate services; the platform is not a substitute for emergency responders, professional medical diagnosis, or legal advice.
