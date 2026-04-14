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
  docker compose --env-file .env.production -f docker-compose.prod.yml "$@"
}

run_schema_sync() {
  docker run --rm --env-file .env.production "$API_IMAGE" \
    node apps/api/dist/scripts/sync-schema.js
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
  local ready=0
  local status_code

  for attempt in $(seq 1 30); do
    if curl -fsS --max-time 10 http://127.0.0.1:8080/api/health >/dev/null 2>&1; then
      ready=1
      break
    fi
    sleep 5
  done

  if [[ "$ready" -ne 1 ]]; then
    echo "Internal health check failed at http://127.0.0.1:8080/api/health"
    return 1
  fi

  if ! curl -fsS --max-time 10 http://127.0.0.1:8080/ >/dev/null 2>&1; then
    echo "Internal web check failed at http://127.0.0.1:8080/"
    return 1
  fi

  status_code="$(curl -sS --max-time 10 -o /tmp/login-smoke-local.json -w '%{http_code}' \
    -X POST http://127.0.0.1:8080/api/auth/login \
    -H 'Content-Type: application/json' \
    --data '{"email":"invalid@example.com","password":"invalid-password"}')"

  if [[ "$status_code" == "000" || "$status_code" -ge 500 ]]; then
    echo "Internal login smoke failed with status ${status_code}"
    cat /tmp/login-smoke-local.json || true
    return 1
  fi

  return 0
}

write_release_state() {
  local deployed_at
  deployed_at="$(date -u +%Y-%m-%dT%H:%M:%SZ)"

  cat > .release-state.json <<EOF
{
  "imageTag": "${IMAGE_TAG}",
  "apiImage": "${API_IMAGE}",
  "webImage": "${WEB_IMAGE}",
  "deployedAt": "${deployed_at}",
  "deployAction": "${DEPLOY_ACTION}"
}
EOF

  printf '%s' "$IMAGE_TAG" > .release-tag
}

main() {
  require_env APP_DIR
  cd "$APP_DIR"
  trap 'rm -f .deploy-runtime.env; logout_ghcr' EXIT

  require_file docker-compose.prod.yml
  require_file .env.production
  require_file .deploy-runtime.env

  set -a
  # shellcheck disable=SC1091
  . ./.deploy-runtime.env
  set +a

  require_env DEPLOY_ACTION
  require_env API_IMAGE
  require_env WEB_IMAGE
  require_env IMAGE_TAG
  require_env GHCR_USERNAME
  require_env GHCR_TOKEN

  df -h /
  docker system df || true
  light_cleanup
  docker system df || true
  check_free_disk

  login_ghcr

  compose pull api web

  if [[ "$DEPLOY_ACTION" == "deploy" ]]; then
    run_schema_sync </dev/null
  elif [[ "$DEPLOY_ACTION" != "rollback" ]]; then
    echo "Unsupported DEPLOY_ACTION: $DEPLOY_ACTION"
    exit 1
  fi

  compose up -d --force-recreate --remove-orphans
  compose ps

  verify_running_image nextdream-api "$API_IMAGE"
  verify_running_image nextdream-web "$WEB_IMAGE"

  if ! run_internal_smoke_checks; then
    compose ps || true
    compose logs --tail 200 api || true
    compose logs --tail 200 web || true
    curl -sS --max-time 10 http://127.0.0.1:4000/health || true
    curl -sS --max-time 10 http://127.0.0.1:8080/api/health || true
    exit 1
  fi

  write_release_state
}

main "$@"
