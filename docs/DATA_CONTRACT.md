# Legacy Data Contract

The frontend posts form-encoded data with a single `data` field containing a
JSON string. The new backend intentionally preserves these endpoints:

- `POST /api/create`
- `POST /api/retrieve`
- `POST /api/saveInputs`
- `POST /api/update`
- `POST /api/feedbackSubmit`

## MongoDB

Production uses two databases:

- `production_db`, collection `json_logs`
- `production_fb_db`, collection `fb_logs`

`json_logs` has an index on `uuid`.

## Submission Documents

New session:

```json
{
  "uuid": "generated uuid",
  "inputs": {
    "cmpName": "Organisation",
    "emailAddr": "user@example.com"
  },
  "date": "UTC datetime",
  "score_gen": false
}
```

Saved inputs:

```json
{
  "uuid": "existing uuid",
  "inputs": {
    "...": "questionnaire fields"
  },
  "date": "UTC datetime",
  "input_mod": true
}
```

Generated score:

```json
{
  "uuid": "existing or generated uuid",
  "inputs": {
    "...": "questionnaire fields"
  },
  "outputs": {
    "Infrastructure": 0,
    "Epidemic related: Precautions": 0,
    "Epidemic related: Awareness and readiness": 0,
    "Epidemic related: Advertisement and outreach": 0,
    "Transportation": 0,
    "Employee interactions: Mobility": 0,
    "Employee interactions: Meetings": 0,
    "Employee interactions: Outside contacts": 0,
    "Canteen/pantry": 0,
    "Hygiene and sanitation": 0,
    "Total": 0
  },
  "suggestions": {
    "...": "HTML suggestion strings"
  },
  "date": "UTC datetime",
  "score_gen": true,
  "input_mod": false
}
```

`/api/retrieve` returns a JSON array and excludes `_id`, `outputs`,
`suggestions`, and `date`, matching the old PyMongo/BSON behavior.

## Feedback Documents

```json
{
  "fbName": "Name",
  "fbEmail": "user@example.com",
  "fbText": "Feedback",
  "recaptcha": "token"
}
```

