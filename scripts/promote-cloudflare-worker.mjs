#!/usr/bin/env node
/**
 * Cloudflare gradual deployments can leave new versions at 0% traffic.
 * Promote a deployable version to 100% after CI deploy.
 *
 * Prefer WRANGLER_DEPLOY_VERSION_ID (from `wrangler deploy` stdout) or argv[2].
 * Fallback: newest version by created_on (NOT first row — that was routing to stale builds).
 */
import { execSync } from "node:child_process";

const WORKER = "naughtyxxxcams";

function run(cmd, inherit = false) {
  return execSync(cmd, {
    encoding: "utf8",
    stdio: inherit ? "inherit" : ["pipe", "pipe", "inherit"],
  });
}

function versionTimestamp(version) {
  const raw =
    version?.created_on ??
    version?.created_at ??
    version?.metadata?.created_on ??
    version?.uploaded_on ??
    0;
  const ms = Date.parse(String(raw));
  return Number.isFinite(ms) ? ms : 0;
}

function pickNewestVersionId(list) {
  const withId = list.filter((v) => v?.id);
  if (!withId.length) return null;
  withId.sort((a, b) => versionTimestamp(b) - versionTimestamp(a));
  return withId[0].id;
}

function promote(versionId) {
  if (!versionId) {
    console.warn("[promote-worker] No version id — skip promote.");
    process.exit(0);
  }
  console.log(`[promote-worker] Routing 100% traffic to version ${versionId}`);
  execSync(
    `npx wrangler versions deploy ${versionId}@100% -y --name ${WORKER}`,
    { stdio: "inherit" },
  );
}

const explicit =
  process.env.WRANGLER_DEPLOY_VERSION_ID?.trim() ||
  process.argv[2]?.trim() ||
  "";

if (explicit) {
  promote(explicit);
  process.exit(0);
}

let raw;
try {
  raw = run(`npx wrangler versions list --name ${WORKER} --json`);
} catch (err) {
  console.warn("[promote-worker] versions list failed — skip promote.", err?.message);
  process.exit(0);
}

let parsed;
try {
  parsed = JSON.parse(raw);
} catch {
  console.warn("[promote-worker] Could not parse versions JSON — skip promote.");
  process.exit(0);
}

const list = Array.isArray(parsed)
  ? parsed
  : parsed?.versions ?? parsed?.result ?? [];

const latest = pickNewestVersionId(list);
if (!latest) {
  console.warn("[promote-worker] No version id found — skip promote.");
  process.exit(0);
}

promote(latest);
