#!/usr/bin/env bash
set -euo pipefail

repo_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$repo_root"

docker compose up -d postgres redis

export AXIS_DATABASE_URL="${AXIS_DATABASE_URL:-postgresql+asyncpg://axis:axis@127.0.0.1:5432/axis}"
export AXIS_REDIS_URL="${AXIS_REDIS_URL:-redis://127.0.0.1:6379/0}"
export AXIS_ALLOW_IN_MEMORY_FALLBACK="${AXIS_ALLOW_IN_MEMORY_FALLBACK:-false}"

uv run --directory apps/analyser alembic upgrade head

api_pid=""
web_pid=""

cleanup() {
  trap - EXIT INT TERM
  [[ -n "$api_pid" ]] && kill "$api_pid" 2>/dev/null || true
  [[ -n "$web_pid" ]] && kill "$web_pid" 2>/dev/null || true
}
trap cleanup EXIT INT TERM

api_ready="$(curl -fsS --max-time 2 http://127.0.0.1:8000/health/ready 2>/dev/null || true)"
if [[ "$api_ready" == *'"database":"ready"'* && "$api_ready" == *'"events":"redis"'* ]]; then
  echo "Reusing healthy API on port 8000."
elif ss -ltn | awk '$4 ~ /:8000$/ { found = 1 } END { exit !found }'; then
  echo "Port 8000 is occupied by an API that is not database/Redis ready." >&2
  exit 1
else
  uv run --directory apps/analyser uvicorn app.main:app \
    --host 127.0.0.1 --port 8000 &
  api_pid=$!
fi

if curl -fsS --max-time 2 http://127.0.0.1:5180/ >/dev/null 2>&1; then
  echo "Reusing frontend on port 5180."
elif ss -ltn | awk '$4 ~ /:5180$/ { found = 1 } END { exit !found }'; then
  echo "Port 5180 is occupied by a non-AXIS process." >&2
  exit 1
else
  npm run dev --workspace=@axis/web &
  web_pid=$!
fi

if [[ -n "$api_pid" || -n "$web_pid" ]]; then
  pids=()
  [[ -n "$api_pid" ]] && pids+=("$api_pid")
  [[ -n "$web_pid" ]] && pids+=("$web_pid")
  wait -n "${pids[@]}"
else
  echo "Both services are already running. Press Ctrl-C to exit."
  while sleep 3600; do :; done
fi
