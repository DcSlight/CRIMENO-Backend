---
description: 'Use when editing entity files; keep business ERD skill in sync with schema changes.'
applyTo: 'src/database/entities/**'
---

# Business Entity Skill Sync Rule

When changing business-related entities (businesses, business_hours, cameras, business_policies):

- Update .github/skills/business-erd/SKILL.md in the same task.
- Keep ERD sections accurate:
  - Table fields and types
  - One-to-many and one-to-one relationships
  - Cascade behavior
  - Unique and index constraints

Do not finish the task until ERD information in the skill file matches code.
