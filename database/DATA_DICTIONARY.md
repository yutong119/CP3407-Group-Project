# SafeStay Data Dictionary

Source schema: [database.sql](database.sql)

## 1. users

- Purpose: stores account identity and profile preferences.
- Primary key: `user_id`
- Foreign keys: none
- Important columns:
  - `full_name`: display name
  - `email`: unique login identifier
  - `password_hash`: bcrypt hash
  - `preferred_language`: UI language preference
  - `created_at`: registration timestamp

## 2. case_categories

- Purpose: master list of incident categories used for classification and case creation.
- Primary key: `category_id`
- Foreign keys: none
- Important columns:
  - `category_name`: visible category label
  - `description`: category description
  - `urgency_level`: default urgency hint

## 3. student_cases

- Purpose: core incident records created by users.
- Primary key: `case_id`
- Foreign keys:
  - `user_id` -> `users.user_id`
  - `category_id` -> `case_categories.category_id`
- Important columns:
  - `case_title`: short case label
  - `description`: full incident narrative
  - `location`: incident location
  - `case_status`: workflow status (`In Progress`, `Resolved`, `Closed`)
  - `urgency_level`: computed urgency
  - `detected_case`: detected case type
  - `probability`: classification confidence (percentage)
  - `created_at`: case creation time

## 4. evidence_files

- Purpose: uploaded evidence metadata linked to a case.
- Primary key: `evidence_id`
- Foreign keys:
  - `case_id` -> `student_cases.case_id`
- Important columns:
  - `file_name`: original filename
  - `file_type`: MIME type
  - `file_path`: server path to file
  - `description`: user annotation
  - `uploaded_at`: upload time

## 5. checklist_items

- Purpose: per-case actionable checklist progress records.
- Primary key: `checklist_id`
- Foreign keys:
  - `case_id` -> `student_cases.case_id`
- Important columns:
  - `item_name`: checklist item text
  - `is_completed`: completion state for persistence

## 6. checklist_templates

- Purpose: default checklist template items by category.
- Primary key: `template_id`
- Foreign keys:
  - `category_id` -> `case_categories.category_id`
- Important columns:
  - `item_name`: template item text
  - `description`: optional detail
  - `is_required`: required vs optional item

## 7. guidance_steps

- Purpose: recommended procedural steps by category.
- Primary key: `step_id`
- Foreign keys:
  - `category_id` -> `case_categories.category_id`
- Important columns:
  - `step_order`: display order in UI
  - `step_title`: action title
  - `step_description`: action detail

## 8. authority_contacts

- Purpose: category-linked authorities and support contacts.
- Primary key: `contact_id`
- Foreign keys:
  - `category_id` -> `case_categories.category_id` (nullable)
- Important columns:
  - `contact_name`: contact display name
  - `contact_type`: role/type
  - `phone_number`: dialable contact number
  - `email`: support email
  - `website`: official URL
  - `description`: context or usage note

## Relationship Summary

- One `users` row can own many `student_cases` rows.
- One `case_categories` row can map to many:
  - `student_cases`
  - `checklist_templates`
  - `guidance_steps`
  - `authority_contacts`
- One `student_cases` row can own many:
  - `evidence_files`
  - `checklist_items`