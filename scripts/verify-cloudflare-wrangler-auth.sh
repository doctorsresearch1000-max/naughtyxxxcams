#!/usr/bin/env bash
# Validates Wrangler ↔ Cloudflare API auth before deploy (non-interactive).
set -euo pipefail

cd "$(dirname "$0")/.."

echo "== Wrangler auth preflight =="

# Stale global key auth overrides API tokens and often causes 9109 in CI.
unset CLOUDFLARE_API_KEY CLOUDFLARE_EMAIL CLOUDFLARE_API_USER_SERVICE_KEY

if [[ -n "${CLOUDFLARE_API_TOKEN:-}" ]]; then
  # Trim accidental whitespace/newlines from secret managers.
  CLOUDFLARE_API_TOKEN="$(printf '%s' "$CLOUDFLARE_API_TOKEN" | tr -d '\r\n')"
  export CLOUDFLARE_API_TOKEN

  if [[ "${CLOUDFLARE_API_TOKEN}" == cfat_* ]]; then
    echo "NOTE: Token uses the cfat_ prefix (valid). Ensure it is the *API Token* from the dashboard,"
    echo "      not a value copied from wrangler [vars] or an expired/revoked token."
  fi
else
  echo "CLOUDFLARE_API_TOKEN not set — checking wrangler login (OAuth) session…"
fi

if [[ -n "${CLOUDFLARE_ACCOUNT_ID:-}" ]]; then
  export CLOUDFLARE_ACCOUNT_ID="$(printf '%s' "$CLOUDFLARE_ACCOUNT_ID" | tr -d '\r\n')"
fi

echo "Using wrangler.jsonc (see logs: configFileType=jsonc)."
if ! npx wrangler whoami 2>&1 | tee /tmp/wrangler-whoami.txt; then
  echo "ERROR: Wrangler is not authenticated."
  echo "Set CLOUDFLARE_API_TOKEN or run 'npx wrangler login' in this same environment/session."
  exit 1
fi

if grep -q "not authenticated" /tmp/wrangler-whoami.txt; then
  echo "ERROR: No valid CLOUDFLARE_API_TOKEN and no wrangler OAuth session in this environment."
  echo "Create an API token: https://developers.cloudflare.com/fundamentals/api/get-started/create-token/"
  exit 1
fi

echo "OK: Cloudflare authentication verified."
