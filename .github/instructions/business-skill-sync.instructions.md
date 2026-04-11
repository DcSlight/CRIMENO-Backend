---
description: 'Use when editing business module files; keep the business ERD skill synchronized.'
applyTo: 'src/modules/businesses/**'
---

# Business Skill Sync Rule

When changing any file under src/modules/businesses:

- Update .github/skills/business-erd/SKILL.md in the same task.
- Keep these sections accurate in the skill file:
  - Business API Contract (Allowed Routes)
  - Service Behavior Rules
  - Implementation Pointers
  - Guardrails For Future Changes
- If routes are added or removed, reflect them immediately in the skill file.
- If DTO or entity behavior changes business logic, update the skill notes.

Do not finish the task until the business skill file is synchronized.
