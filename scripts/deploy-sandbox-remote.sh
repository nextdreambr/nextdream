#!/usr/bin/env bash
set -euo pipefail

require_env() {
  local key="$1"
  if [[ -z "${!key:-}" ]]; then
    echo "Missing required environment variable: $key"
    exit 1
  fi
}

require_file() {
  local path="$1"
  if [[ ! -f "$path" ]]; then
    echo "Required file not found: $path"
    exit 1
  fi
}

get_positive_number() {
  local raw="$1"
  local fallback="$2"

  if [[ "$raw" =~ ^[0-9]+$ ]] && [[ "$raw" -gt 0 ]]; then
    printf '%s' "$raw"
    return 0
  fi

  printf '%s' "$fallback"
}

compose() {
  docker compose \
    --project-name nextdream-sandbox \
    --env-file .env.sandbox \
    -f docker-compose.sandbox.yml \
    "$@"
}

wait_for_container_health() {
  local container_name="$1"
  local max_attempts="${2:-30}"
  local sleep_seconds="${3:-2}"
  local health_status=""

  for attempt in $(seq 1 "$max_attempts"); do
    health_status="$(docker inspect --format '{{if .State.Health}}{{.State.Health.Status}}{{else}}no-healthcheck{{end}}' "$container_name" 2>/dev/null || true)"

    case "$health_status" in
      healthy)
        return 0
        ;;
      unhealthy|no-healthcheck)
        echo "Container ${container_name} health status is ${health_status}"
        return 1
        ;;
      *)
        sleep "$sleep_seconds"
        ;;
    esac
  done

  echo "Timed out waiting for container ${container_name} to become healthy"
  return 1
}

check_free_disk() {
  local available_mb
  local minimum_mb

  available_mb="$(df -Pm / | awk 'NR==2 { print $4 }')"
  minimum_mb="$(get_positive_number "${MIN_FREE_DISK_MB:-}" 2048)"

  if [[ "$available_mb" -lt "$minimum_mb" ]]; then
    echo "Insufficient free disk space: ${available_mb}MB available, ${minimum_mb}MB required"
    exit 1
  fi
}

light_cleanup() {
  docker container prune -f >/dev/null 2>&1 || true
  docker image prune -f >/dev/null 2>&1 || true
  docker builder prune -f >/dev/null 2>&1 || true
}

login_ghcr() {
  echo "$GHCR_TOKEN" | docker login ghcr.io -u "$GHCR_USERNAME" --password-stdin >/dev/null
}

logout_ghcr() {
  docker logout ghcr.io >/dev/null 2>&1 || true
}

verify_running_image() {
  local container_name="$1"
  local expected_image="$2"
  local actual_image

  actual_image="$(docker inspect "$container_name" --format '{{.Config.Image}}' 2>/dev/null || true)"
  if [[ "$actual_image" != "$expected_image" ]]; then
    echo "Container ${container_name} is running ${actual_image}, expected ${expected_image}"
    exit 1
  fi
}

run_internal_smoke_checks() {
  local base_url
  local status_code

  base_url="http://${SANDBOX_API_BIND_ADDRESS:-127.0.0.1}:${SANDBOX_API_HOST_PORT:-4001}"

  if ! curl -fsS --max-time 10 "${base_url}/health" >/dev/null 2>&1; then
    echo "Internal health check failed at ${base_url}/health"
    return 1
  fi

  status_code="$(curl -sS --max-time 10 -o /tmp/sandbox-demo-login.json -w '%{http_code}' \
    -X POST "${base_url}/auth/demo-login" \
    -H 'Content-Type: application/json' \
    --data '{"persona":"paciente"}')"

  if [[ "$status_code" != "200" ]]; then
    echo "Sandbox demo login smoke failed with status ${status_code}"
    cat /tmp/sandbox-demo-login.json || true
    return 1
  fi

  return 0
}

write_release_state() {
  local deployed_at
  deployed_at="$(date -u +%Y-%m-%dT%H:%M:%SZ)"

  cat > .sandbox-release-state.json <<EOF
{
  "imageTag": "${IMAGE_TAG}",
  "apiImage": "${API_IMAGE}",
  "deployedAt": "${deployed_at}",
  "deployAction": "${DEPLOY_ACTION}"
}
EOF

  printf '%s' "$IMAGE_TAG" > .sandbox-release-tag
}

main() {
  require_env APP_DIR
  cd "$APP_DIR"
  trap 'rm -f .deploy-runtime.env; logout_ghcr' EXIT

  require_file docker-compose.sandbox.yml
  require_file .env.sandbox
  require_file .deploy-runtime.env

  set -a
  # shellcheck disable=SC1091
  . ./.env.sandbox
  # shellcheck disable=SC1091
  . ./.deploy-runtime.env
  set +a

  require_env DEPLOY_ACTION
  require_env API_IMAGE
  require_env IMAGE_TAG
  require_env GHCR_USERNAME
  require_env GHCR_TOKEN

  if [[ "$DEPLOY_ACTION" != "deploy" && "$DEPLOY_ACTION" != "rollback" ]]; then
    echo "Unsupported DEPLOY_ACTION: $DEPLOY_ACTION"
    exit 1
  fi

  df -h /
  docker system df || true
  light_cleanup
  docker system df || true
  check_free_disk

  login_ghcr

  compose pull api
  compose up -d --force-recreate --remove-orphans
  compose ps

  wait_for_container_health nextdream-sandbox-api
  verify_running_image nextdream-sandbox-api "$API_IMAGE"

  if ! run_internal_smoke_checks; then
    compose ps || true
    compose logs --tail 200 api || true
    curl -sS --max-time 10 "http://${SANDBOX_API_BIND_ADDRESS:-127.0.0.1}:${SANDBOX_API_HOST_PORT:-4001}/health" || true
    exit 1
  fi

  write_release_state
}

main "$@"
