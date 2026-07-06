# Deployment Notes

This branch keeps the legacy static frontend and API contract, but replaces the
old ad hoc Flask scripts with a small app-factory service managed by `uv`.

## Production Data

The production backup was copied locally and verified with SHA-256:

```text
6793bf2647d88a20e087cbed60a604b5e988cab88b84296d25d55b82d4049e10
```

Local backup path:

```text
/Users/snehas/Documents/work/artpark/code/cni-iisc/covid_readiness_backup_20260706_082648.tar.gz
```

The backup contains:

- `mongo_dump/production_db/json_logs.bson`
- `mongo_dump/production_fb_db/fb_logs.bson`
- nginx site config
- `gunicorn_server.service`
- cron snapshots
- system package metadata
- redacted environment reference

Do not commit the backup or extracted Mongo dump.

## Runtime Configuration

Create `.env` from `.env.example` and fill the secret values:

```bash
cp .env.example .env
```

Required values:

- `SENDER_EMAIL`
- `SENDER_PASSWORD`
- `CAPTCHA_PRIVATE`
- `DB_JSON`
- `DB_FEEDBACK`
- `HTTP_ORIGIN`
- `MONGO_URI`
- `STATIC_ROOT` if Gunicorn is not launched from the repository root or
  `server_code`

Optional values:

- `ADMIN_EMAIL`
- `REPORT_RECIPIENTS`
- `RECAPTCHA_ENABLED`
- `EMAIL_ENABLED`

For local API testing without external services:

```bash
RECAPTCHA_ENABLED=false EMAIL_ENABLED=false uv run flask --app workplace_readiness_service.app:create_app run
```

## Mongo Restore On A New Instance

Extract the verified backup on the target host, then restore MongoDB:

```bash
tar -xzf covid_readiness_backup_20260706_082648.tar.gz
mongorestore --drop --db production_db mongo_dump/production_db
mongorestore --drop --db production_fb_db mongo_dump/production_fb_db
```

`--drop` deletes existing target collections before restoring. Use it only on a
fresh or intentionally replaceable MongoDB instance.

## Service

Install dependencies:

```bash
uv sync --frozen
```

Run locally:

```bash
uv run flask --app workplace_readiness_service.app:create_app run --host 127.0.0.1 --port 5000
```

Run with Gunicorn:

```bash
uv run gunicorn --workers 3 --bind 127.0.0.1:5000 wsgi:app
```

Health check:

```bash
curl http://127.0.0.1:5000/health
```

Expected response:

```json
{"status":"ok"}
```

## Nginx Shape

The old production server used nginx to serve static files directly and proxy
`/api` to Gunicorn:

```nginx
location / {
    root /home/ubuntu/covid_19_wrc/wrc_web/workplace-readiness/web_files/;
}

location /api {
    proxy_pass http://localhost:5000;
}
```

For the new deployment, keep that same shape or serve static files from Flask
for this low-traffic service. The direct nginx static path is still preferred
because it matches the known-good deployment.
