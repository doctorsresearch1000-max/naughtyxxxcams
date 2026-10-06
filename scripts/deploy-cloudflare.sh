#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")/.."

# Avoid legacy Global API Key auth shadowing CLOUDFLARE_API_TOKEN (common 9109 cause).
unset CLOUDFLARE_API_KEY CLOUDFLARE_EMAIL CLOUDFLARE_API_USER_SERVICE_KEY

if [[ -z "${CLOUDFLARE_API_TOKEN:-}" ]]; then
  echo "CLOUDFLARE_API_TOKEN not set — will rely on wrangler login (OAuth) if present."
fi

if [[ -z "${CLOUDFLARE_ACCOUNT_ID:-}" ]]; then
  echo "Missing CLOUDFLARE_ACCOUNT_ID (optional if wrangler.jsonc account_id is set)."
  echo "Find it in Cloudflare Dashboard → Workers & Pages → Overview (URL contains /:account_id/)."
  echo "This repo uses account_id in wrangler.jsonc: bbdfc44e34ccb66212863e42a81d671e"
fi

bash scripts/verify-cloudflare-wrangler-auth.sh
npm run deploy
