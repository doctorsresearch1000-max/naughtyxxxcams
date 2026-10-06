#!/usr/bin/env bash
# Validates Wrangler ↔ Cloudflare API auth before deploy (non-interactive).
set -euo pipefail

cd "$(dirname "$0")/.."

echo "== Wrangler auth preflight =="

# Stale global key auth overrides API tokens and often causes 9109 in CI.
unset CLOUDFLARE_API_KEY CLOUDFLARE_EMAIL CLOUDFLARE_API_USER_SERVICE_KEY

if [[ -z "${CLOUDFLARE_API_TOKEN:-}" ]]; then
  echo "ERROR: CLOUDFLARE_API_TOKEN is not set."
  echo "Create an API token: https://developers.cloudflare.com/fundamentals/api/get-started/create-token/"
  echo "Recommended permissions: Account → Workers Scripts (Edit), Workers KV (Edit), Account Settings (Read)."
  exit 1
fi

# Trim accidental whitespace/newlines from secret managers.
CLOUDFLARE_API_TOKEN="$(printf '%s' "$CLOUDFLARE_API_TOKEN" | tr -d '\r\n')"
export CLOUDFLARE_API_TOKEN

if [[ "${CLOUDFLARE_API_TOKEN}" == cfat_* ]]; then
  echo "NOTE: Token uses the cfat_ prefix (valid). Ensure it is the *API Token* from the dashboard,"
  echo "      not a value copied from wrangler [vars] or an expired/revoked token."
fi

if [[ -n "${CLOUDFLARE_ACCOUNT_ID:-}" ]]; then
  export CLOUDFLARE_ACCOUNT_ID="$(printf '%s' "$CLOUDFLARE_ACCOUNT_ID" | tr -d '\r\n')"
fi

echo "Using wrangler.jsonc (see logs: configFileType=jsonc)."
npx wrangler whoami

echo "OK: Cloudflare API token accepted."
