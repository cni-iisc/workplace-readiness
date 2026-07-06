# COVID-19 Readiness Indicator

This repository contains the COVID-19 Workplace Readiness Indicator, originally
developed by the Centre for Networked Intelligence, Indian Institute of Science,
and the Karnataka State Disaster Management Authority.

The maintained version keeps the original static questionnaire and legacy API
contract, but replaces the old ad hoc server scripts with a small Flask service
managed by `uv`, Gunicorn, systemd, nginx, and MongoDB.

## Current Codebase

- `web_files/` contains the static questionnaire and client-side scoring code.
- `src/workplace_readiness_service/` contains the maintained Flask backend.
- `server_code/` is retained as legacy reference code.
- `config/systemd/` contains the systemd unit used on the VM.
- `config/nginx/` contains separate nginx configs for staging and production.
- `scripts/deploy_vm.sh` is the pull-based VM deploy script.

The backend intentionally preserves the legacy endpoints used by the frontend:

- `POST /api/create`
- `POST /api/retrieve`
- `POST /api/saveInputs`
- `POST /api/update`
- `POST /api/feedbackSubmit`
- `GET /health`

## Deployment

Use [Deploy On Ubuntu VM](docs/DEPLOY_ON_VM.md) for the current deployment and
handoff instructions.

Related notes:

- [Legacy README archive](docs/LEGACY_README.md)
- [Legacy data contract](docs/DATA_CONTRACT.md)
- [Production inspection summary](docs/PRODUCTION_INSPECTION.md)

## Local Development

```bash
cp .env.example .env
uv sync
RECAPTCHA_ENABLED=false EMAIL_ENABLED=false \
  uv run flask --app workplace_readiness_service.app:create_app run
```

Health check:

```bash
curl http://127.0.0.1:5000/health
```

Run checks:

```bash
uv run pytest
uv run ruff check .
```

## Copyright and License

Copyright [2020] [Indian Institute of Science, Bangalore]

SPDX-License-Identifier: Apache-2.0
