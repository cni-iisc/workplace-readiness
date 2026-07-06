# Production Inspection Summary

Captured from the verified backup made on 2026-07-06.

## Host

- Ubuntu 18.04.6 LTS
- Python 3.6.9
- MongoDB 4.2.25
- Gunicorn 20.0.4
- Flask 1.1.2
- PyMongo 3.10.1

## Live Service

Systemd unit:

```text
/etc/systemd/system/gunicorn_server.service
```

Working directory:

```text
/home/ubuntu/covid_19_wrc/wrc_web/workplace-readiness/server_code/
```

Command:

```text
/usr/local/bin/gunicorn --workers 3 --bind 127.0.0.1:5000 wsgi:app
```

## Nginx

The production nginx site serves:

```text
/home/ubuntu/covid_19_wrc/wrc_web/workplace-readiness/web_files/
```

and proxies:

```text
/api -> http://localhost:5000
```

## Mongo Backup Size

- `production_db/json_logs.bson`: about 644 KB
- `production_fb_db/fb_logs.bson`: about 7.6 KB

## Mongo Record Summary

- `json_logs`: 178 documents
- scored submissions: 174
- session-only submissions: 4
- `fb_logs`: 12 documents
- `json_logs` has a `uuid_1` index

The BSON summary can be regenerated without printing PII:

```bash
uv run python scripts/inspect_mongo_dump.py \
  ../backup-inspect/mongo_dump/production_db/json_logs.bson \
  ../backup-inspect/mongo_dump/production_fb_db/fb_logs.bson
```

This is a small low-traffic app. A compatibility Flask service is a better
handoff choice than a full framework/database migration.
