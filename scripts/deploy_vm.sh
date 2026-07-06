#!/usr/bin/env bash
set -euo pipefail

APP_DIR="${APP_DIR:-/opt/workplace-readiness/app}"
BRANCH="${BRANCH:-modernize-maintainable-flask}"
UV_CACHE_DIR="${UV_CACHE_DIR:-/tmp/uv-cache}"

cd "$APP_DIR"

git fetch origin "$BRANCH"
git reset --hard "origin/$BRANCH"

UV_CACHE_DIR="$UV_CACHE_DIR" uv sync --frozen
sudo systemctl restart workplace-readiness
sudo systemctl --no-pager --full status workplace-readiness

