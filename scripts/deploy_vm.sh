#!/usr/bin/env bash
set -euo pipefail

APP_DIR="${APP_DIR:-/opt/workplace-readiness/app}"
BRANCH="${BRANCH:-main}"

cd "$APP_DIR"

git fetch origin "$BRANCH"
git reset --hard "origin/$BRANCH"

uv sync --locked
sudo systemctl restart workplace-readiness
sudo systemctl --no-pager --full status workplace-readiness
