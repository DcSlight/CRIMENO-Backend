# CRIMENO Backend API

NestJS backend with REST + WebSocket endpoints.

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

## Frontend Contract (Single POST Form)

The frontend should send one JSON object to create a full business record, including child rows.

Endpoint:

- `POST /businesses`

Content type:

- `application/json`

### Request Body Shape

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
    },
    {
      "day_of_week": "tuesday",
      "opening_time": "09:00",
      "closing_time": "18:00"
    }
  ],
  "business_rules": [
    {
      "rule_description": "No smoking inside the store"
    },
    {
      "rule_description": "Pets are not allowed"
    }
  ],
  "cameras": [
    {
      "camera_name": "Front Entrance Cam",
      "location_description": "Mounted above the main entrance door"
    },
    {
      "camera_name": "Checkout Cam",
      "location_description": "Ceiling camera facing the cashier area"
    }
  ]
}
```

### Validation Rules

- `store_name` required string
- `store_type` required string
- `description` required string
- `city` required string
- `address` required string
- `business_hours` optional array
- `business_hours[].day_of_week` required string
- `business_hours[].opening_time` required time string in `HH:mm` or `HH:mm:ss`
- `business_hours[].closing_time` required time string in `HH:mm` or `HH:mm:ss`
- `business_rules` optional array
- `business_rules[].rule_description` required string
- `cameras` optional array
- `cameras[].camera_name` required string
- `cameras[].location_description` required string

### Success Response (Example)

```json
{
  "id": 1,
  "store_name": "Downtown Market",
  "store_type": "grocery",
  "description": "Neighborhood store with fresh produce and daily essentials.",
  "city": "Toronto",
  "address": "123 King St W",
  "business_hours": [
    {
      "id": 1,
      "business_id": 1,
      "day_of_week": "monday",
      "opening_time": "09:00:00",
      "closing_time": "18:00:00"
    }
  ],
  "business_rules": [
    {
      "id": 1,
      "business_id": 1,
      "rule_description": "No smoking inside the store"
    }
  ],
  "cameras": [
    {
      "id": 1,
      "business_id": 1,
      "camera_name": "Front Entrance Cam",
      "location_description": "Mounted above the main entrance door"
    }
  ]
}
```

Notes:

- This create flow runs in a DB transaction.
- If one insert fails, nothing is persisted.

### Error Response (Validation)

```json
{
  "statusCode": 400,
  "message": [
    "store_name should not be empty",
    "business_hours.0.opening_time must be in HH:mm or HH:mm:ss format"
  ],
  "error": "Bad Request"
}
```

## Other Useful Endpoints

- `GET /businesses`
- `GET /businesses/:id`
- `PATCH /businesses/:id`
- `DELETE /businesses/:id`
- `GET /businesses/hours/all`
- `GET /businesses/rules/all`
- `GET /businesses/cameras/all`

## Frontend Form Mapping

Suggested form model:

- `store_name`, `store_type`, `description`, `city`, `address` as simple text inputs
- `business_hours` as repeatable group with 3 fields: `day_of_week`, `opening_time`, `closing_time`
- `business_rules` as repeatable group with 1 field: `rule_description`
- `cameras` as repeatable group with 2 fields: `camera_name`, `location_description`

Send exactly one payload to `POST /businesses` on submit.
