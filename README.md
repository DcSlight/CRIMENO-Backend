# CRIMENO Backend API

NestJS backend for business management.

## Quick Start

```bash
npm install
npm run start:dev
```

Swagger docs:

```bash
http://localhost:3000/api/docs
```

## Environment Variables

Database connection uses these variables:

- `DB_USER`
- `DB_PASSWORD`
- `DB_HOST`
- `DB_PORT`
- `DB_NAME`

## Supported Endpoints Only

The API now supports only these operations:

- `GET /businesses` (get all businesses)
- `POST /businesses` (create business)
- `PATCH /businesses/:id` (update business)
- `DELETE /businesses/:id` (delete business)
- `PATCH /business-policies/:id` (update policy)

## 1) Get All Businesses

Endpoint:

- `GET /businesses`

Response:

- Array of business objects including `business_hours`, `business_policy`, and `cameras`.

## 2) Create Business

Endpoint:

- `POST /businesses`

Content type:

- `application/json`

Request body:

```json
{
  "store_name": "Downtown Market",
  "store_type": "grocery",
  "description": "Neighborhood store with fresh produce and daily essentials.",
  "city": "Toronto",
  "address": "123 King St W",
  "business_hours": [
    {
      "day_of_week": "monday",
      "opening_time": "09:00",
      "closing_time": "18:00"
    }
  ],
  "cameras": [
    {
      "camera_name": "Front Entrance Cam",
      "location_description": "Mounted above the main entrance door"
    }
  ],
  "business_policy": {
    "sensitivity_level": "high",
    "scoring_level": "aggressive",
    "interaction_sensitivity": "medium",
    "allowed_behaviors": ["customers chatting"],
    "forbidden_behaviors": ["restricted area access"]
  }
}
```

Validation rules:

- `store_name` required string
- `store_type` required string
- `description` required string
- `city` required string
- `address` required string
- `business_hours` optional array
- `business_hours[].day_of_week` required string
- `business_hours[].opening_time` required time string in `HH:mm` or `HH:mm:ss`
- `business_hours[].closing_time` required time string in `HH:mm` or `HH:mm:ss`
- `cameras` optional array
- `cameras[].camera_name` required string
- `cameras[].location_description` required string
- `business_policy` optional object
- `business_policy.sensitivity_level` optional enum (`low` | `medium` | `high`)
- `business_policy.scoring_level` optional enum (`conservative` | `balanced` | `aggressive`)
- `business_policy.interaction_sensitivity` optional enum (`low` | `medium` | `high`)
- `business_policy.allowed_behaviors` optional string[]
- `business_policy.forbidden_behaviors` optional string[]

Notes:

- Create runs inside a DB transaction.
- A policy row is created automatically for each new business.
- If `business_policy` is provided in POST, those values are used.
- If `business_policy` is omitted, policy defaults are used.
- If any insert fails, the whole transaction is rolled back.

## 3) Update Business

Endpoint:

- `PATCH /businesses/:id`

Partial request body (all fields optional):

```json
{
  "store_name": "Downtown Market Updated",
  "description": "Updated store description"
}
```

## 4) Delete Business

Endpoint:

- `DELETE /businesses/:id`

Response:

```json
{
  "ok": true
}
```

## 5) Update Policy

Endpoint:

- `PATCH /business-policies/:id`

Partial request body (all fields optional):

```json
{
  "sensitivity_level": "high",
  "scoring_level": "aggressive",
  "interaction_sensitivity": "medium",
  "allowed_behaviors": ["customers chatting"],
  "forbidden_behaviors": ["restricted area access"]
}
```

Optional fields include:

- `business_id`
- `sensitivity_level` (`low` | `medium` | `high`)
- `scoring_level` (`conservative` | `balanced` | `aggressive`)
- `interaction_sensitivity` (`low` | `medium` | `high`)
- `allowed_behaviors` (string[])
- `forbidden_behaviors` (string[])
