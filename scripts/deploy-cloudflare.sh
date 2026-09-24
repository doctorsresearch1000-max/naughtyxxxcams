#!/usr/bin/env bash
set -euo pipefail

if [[ -z "${CLOUDFLARE_API_TOKEN:-}" ]]; then
  echo "Missing CLOUDFLARE_API_TOKEN (set in environment, never commit to git)."
  exit 1
fi

if [[ -z "${CLOUDFLARE_ACCOUNT_ID:-}" ]]; then
  echo "Missing CLOUDFLARE_ACCOUNT_ID."
  echo "Find it in Cloudflare Dashboard → Workers & Pages → Overview (URL contains /:account_id/)."
  exit 1
fi

cd "$(dirname "$0")/.."
npm run deploy
