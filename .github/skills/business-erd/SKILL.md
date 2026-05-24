---
name: business-erd
description: 'Use when working on the business domain ERD, business entities, business relationships, or business API routes. Includes the source of truth for businesses, business_hours, cameras, business_policies, and allowed business endpoints.'
---

# Business ERD Skill

Use this skill as the canonical context for all business-domain backend work in this repository.

## Domain Scope

This skill covers:

- Business data model (ERD)
- Business create/update/delete and list APIs
- Business policy update API
- Business-domain service/controller constraints

This skill does not cover:

- WebSocket broadcast flows
- Florence/Qwen/tracker modules
- Non-business modules

## ERD (Source of Truth)

## Table: businesses

- id (PK)
- store_name (string, required)
- store_type (string, required)
- description (text, required)
- city (string, required)
- address (string, required)

## Table: business_hours

- id (PK)
- business_id (FK -> businesses.id, indexed, required)
- day_of_week (string, required)
- opening_time (time, required)
- closing_time (time, required)

Relationship:

- businesses 1 -> many business_hours
- on delete business: CASCADE to business_hours

## Table: cameras

- id (PK)
- business_id (FK -> businesses.id, indexed, required)
- camera_name (string, required)
- location_description (text, required)

Relationship:

- businesses 1 -> many cameras
- on delete business: CASCADE to cameras

## Table: business_policies

- id (PK)
- business_id (FK -> businesses.id, unique, required)
- sensitivity_level (enum: low|medium|high, default: medium)
- scoring_level (enum: conservative|balanced|aggressive, default: balanced)
- interaction_sensitivity (enum: low|medium|high, default: medium)
- allowed_behaviors (text[], default empty)
- forbidden_behaviors (text[], default empty)

Relationship:

- businesses 1 -> 1 business_policies
- unique constraint on business_policies.business_id
- on delete business: CASCADE to business_policies

## Business API Contract (Allowed Routes)

Only these routes are in scope unless user explicitly asks to expand:

- GET /businesses
- POST /businesses
- PATCH /businesses/:id
- DELETE /businesses/:id
- GET /business-policies/business/:businessId
- PATCH /business-policies/:id

## Service Behavior Rules

When creating a business:

- Run inside a DB transaction.
- Insert businesses row first.
- Insert optional business_hours rows.
- Insert optional cameras rows.
- Insert one business_policies row.
- Accept optional business_policy object in POST /businesses.
- If business_policy is provided, use provided values.
- If business_policy is omitted, apply defaults.
- Return full business graph with relations.

When updating business:

- Validate business exists.
- Update only provided fields.
- Return business with relations.

When deleting business:

- Validate by affected row count.
- Rely on DB cascading for related rows.

When updating policy:

- Validate policy exists.
- If moving policy to another business_id, ensure target business exists.
- Enforce one-policy-per-business uniqueness.

When getting policy by business id:

- Validate business exists.
- Return policy with related business entity.

## Implementation Pointers

Relevant files:

- src/database/entities/business.entity.ts
- src/database/entities/business-hours.entity.ts
- src/database/entities/camera.entity.ts
- src/database/entities/business-policy.entity.ts
- src/modules/businesses/businesses.controller.ts
- src/modules/businesses/businesses.service.ts
- src/modules/businesses/business-policies.controller.ts
- src/modules/businesses/business-policies.service.ts

## Guardrails For Future Changes

- Do not reintroduce removed business routes unless the user asks explicitly.
- Keep business graph relation names stable: business_hours, cameras, business_policy.
- Keep create flow transactional.
- Keep policy defaults and unique business_id rule intact.

## Maintenance Sync Protocol

When business-domain code changes, update this skill in the same task.

Minimum sections to keep synchronized:
- ERD (Source of Truth)
- Business API Contract (Allowed Routes)
- Service Behavior Rules
- Implementation Pointers

Related auto-instructions are defined under:
- .github/instructions/business-skill-sync.instructions.md
- .github/instructions/business-entity-skill-sync.instructions.md
- .github/instructions/business-readme-skill-sync.instructions.md
