# Cloudflare / Wrangler authentication (OpenNext deploy)

## What Wrangler uses

| Source | Used for CLI auth? |
|--------|-------------------|
| `CLOUDFLARE_API_TOKEN` env var | **Yes** — primary method for CI and servers |
| `CLOUDFLARE_API_KEY` + `CLOUDFLARE_EMAIL` | Legacy; **unset** these if you use an API token |
| `~/.config/.wrangler/config/default.toml` (OAuth) | Only after `wrangler login` on a laptop |
| `[vars] api_token` in `wrangler.toml` | **No** — Worker runtime env only (do not use for deploy) |

This project’s deploy config is **`wrangler.jsonc`** (`account_id`, KV, assets). OpenNext invokes Wrangler with that file.

## Error 9109 (`Invalid access token`)

From Wrangler debug logs, Cloudflare returns **401** on `GET /user/tokens/verify` — the token in `CLOUDFLARE_API_TOKEN` is rejected (revoked, wrong value, typo, or trailing newline).

**Not** caused by cached OAuth in this environment when `~/.config/.wrangler/config/` is missing (only logs/metrics).

### Fix checklist

1. Create a new **API Token** in [Cloudflare Dashboard → API Tokens](https://dash.cloudflare.com/profile/api-tokens).
   - Template: **Edit Cloudflare Workers** (or custom: Workers Scripts Edit, Workers KV Storage Edit, Account Read).
2. Export it **only** as `CLOUDFLARE_API_TOKEN` (no quotes/newlines in secret managers).
3. Unset legacy vars in the same shell:
   ```bash
   unset CLOUDFLARE_API_KEY CLOUDFLARE_EMAIL CLOUDFLARE_API_USER_SERVICE_KEY
   ```
4. Optional: `export CLOUDFLARE_ACCOUNT_ID=bbdfc44e34ccb66212863e42a81d671e` (matches `wrangler.jsonc`).
5. Verify:
   ```bash
   bash scripts/verify-cloudflare-wrangler-auth.sh
   ```
6. Deploy:
   ```bash
   bash scripts/deploy-cloudflare.sh
   ```

### Clean local Wrangler cache (optional)

Does not store API tokens unless you ran `wrangler login`:

```bash
rm -rf ~/.config/.wrangler/logs ~/.config/.wrangler/registry
# Full reset (drops OAuth if present):
# rm -rf ~/.config/.wrangler ~/.wrangler
```

### GitHub Actions

Set repository secrets `CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID` (see `.github/workflows/deploy-cloudflare.yml`).

### Security note

A token was previously committed under `wrangler.toml` `[vars] api_token`. It was removed from the repo; **revoke that token** in the Cloudflare dashboard and create a new one.
