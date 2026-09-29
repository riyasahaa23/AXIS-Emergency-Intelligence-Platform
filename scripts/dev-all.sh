#!/usr/bin/env bash
set -euo pipefail

repo_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$repo_root"

# Use the repository-level runtime configuration consistently. The backend is
# launched with uv's --directory flag, which otherwise makes
# apps/analyser/.env take precedence and can accidentally enable anonymous
# development access while the root .env is configured for production.
if [[ -f "$repo_root/.env" ]]; then
  set -a
  # shellcheck disable=SC1091
  source "$repo_root/.env"
  set +a
fi

backend_dependencies_ready=1
if ! docker compose up -d postgres redis; then
  echo "Backend containers unavailable; starting frontend in DEMO DATA mode." >&2
  backend_dependencies_ready=0
fi

export AXIS_DATABASE_URL="${AXIS_DATABASE_URL:-postgresql+asyncpg://axis:axis@127.0.0.1:5432/axis}"
export AXIS_REDIS_URL="${AXIS_REDIS_URL:-redis://127.0.0.1:6379/0}"
export AXIS_ALLOW_IN_MEMORY_FALLBACK="${AXIS_ALLOW_IN_MEMORY_FALLBACK:-false}"
export AXIS_LIVE_DATA_ENABLED="${AXIS_LIVE_DATA_ENABLED:-true}"

wait_for_container() {
  local service="$1"
  shift
  local label="$1"
  shift
  local attempts=60

  printf 'Waiting for %s' "$label"
  while (( attempts > 0 )); do
    if docker compose exec -T "$service" "$@" >/dev/null 2>&1; then
      printf ' ready.\n'
      return 0
    fi
    printf '.'
    sleep 1
    ((attempts--))
  done
  printf '\n%s did not become ready in 60 seconds.\n' "$label" >&2
  return 1
}

if (( backend_dependencies_ready )); then
  if ! wait_for_container postgres "PostgreSQL" pg_isready -U axis -d axis; then
    backend_dependencies_ready=0
  fi
  if (( backend_dependencies_ready )) && ! wait_for_container redis "Redis" redis-cli ping; then
    backend_dependencies_ready=0
  fi
fi

if (( backend_dependencies_ready )); then
  if ! uv run --directory apps/analyser alembic upgrade head; then
    echo "Database migration unavailable; starting frontend in DEMO DATA mode." >&2
    backend_dependencies_ready=0
  fi
fi

api_pid=""
web_pid=""

cleanup() {
  trap - EXIT INT TERM
  [[ -n "$api_pid" ]] && kill "$api_pid" 2>/dev/null || true
  [[ -n "$web_pid" ]] && kill "$web_pid" 2>/dev/null || true
}
trap cleanup EXIT INT TERM

wait_for_url() {
  local url="$1"
  local label="$2"
  local attempts=60

  printf 'Waiting for %s' "$label"
  while (( attempts > 0 )); do
    if curl -fsS --max-time 2 "$url" >/dev/null 2>&1; then
      printf ' ready.\n'
      return 0
    fi
    printf '.'
    sleep 1
    ((attempts--))
  done
  printf '\n%s did not become ready in 60 seconds.\n' "$label" >&2
  return 1
}

api_key="${AXIS_API_KEY_READONLY:-}"
if [[ -z "$api_key" && -f apps/analyser/.env ]]; then
  api_key="$(awk -F= '$1 == "AXIS_API_KEY_READONLY" {print substr($0, index($0, "=")+1)}' apps/analyser/.env)"
fi
api_auth_args=()
[[ -n "$api_key" ]] && api_auth_args+=("-H" "X-API-Key: $api_key")
if (( backend_dependencies_ready )); then
  api_ready="$(curl -fsS --max-time 2 "${api_auth_args[@]}" http://127.0.0.1:8000/health/ready 2>/dev/null || true)"
  if [[ "$api_ready" == *'"database":"ready"'* && "$api_ready" == *'"events":"redis"'* ]]; then
    echo "Reusing healthy API on port 8000."
  elif ss -ltn | awk '$4 ~ /:8000$/ { found = 1 } END { exit !found }'; then
    echo "Port 8000 is occupied by an API that is not database/Redis ready; using DEMO DATA mode." >&2
    backend_dependencies_ready=0
  else
    uv run --directory apps/analyser uvicorn app.main:app \
      --host 127.0.0.1 --port 8000 &
    api_pid=$!
  fi

  if (( backend_dependencies_ready )); then
    if ! wait_for_url "http://127.0.0.1:8000/health/live" "AXIS API"; then
      backend_dependencies_ready=0
    fi
  fi
else
  echo "Starting frontend without backend: DEMO DATA mode is enabled." >&2
fi

if curl -fsS --max-time 2 http://127.0.0.1:5180/ >/dev/null 2>&1; then
  echo "Reusing frontend on port 5180."
elif ss -ltn | awk '$4 ~ /:5180$/ { found = 1 } END { exit !found }'; then
  echo "Port 5180 is occupied by a non-AXIS process." >&2
  exit 1
else
  # Local development remains usable when public feeds or the API are down.
  # The UI labels this path DEMO DATA; production never enables it.
  VITE_ENABLE_MOCK_FALLBACK="${VITE_ENABLE_MOCK_FALLBACK:-true}" \
    VITE_STRICT_LIVE_DATA="${VITE_STRICT_LIVE_DATA:-false}" \
    VITE_AXIS_API_KEY="${VITE_AXIS_API_KEY:-${AXIS_API_KEY_READONLY:-}}" \
    npm run dev --workspace=@axis/web &
  web_pid=$!
fi

wait_for_url "http://127.0.0.1:5180/" "AXIS web frontend"

frontend_url="http://localhost:5180"
if command -v xdg-open >/dev/null 2>&1; then
  xdg-open "$frontend_url" >/dev/null 2>&1 &
elif command -v open >/dev/null 2>&1; then
  open "$frontend_url" >/dev/null 2>&1 &
else
  echo "Open $frontend_url in your browser."
fi
echo "AXIS frontend: $frontend_url"
echo "AXIS backend:  http://127.0.0.1:8000"

if [[ -n "$api_pid" || -n "$web_pid" ]]; then
  pids=()
  [[ -n "$api_pid" ]] && pids+=("$api_pid")
  [[ -n "$web_pid" ]] && pids+=("$web_pid")
  wait -n "${pids[@]}"
else
  echo "Both services are already running. Press Ctrl-C to exit."
  while sleep 3600; do :; done
fi
