#!/usr/bin/env node
/**
 * Cloudflare gradual deployments can leave new versions at 0% traffic.
 * Promote the newest deployable version to 100% after CI deploy.
 */
import { execSync } from "node:child_process";

const WORKER = "naughtyxxxcams";

function run(cmd) {
  return execSync(cmd, { encoding: "utf8", stdio: ["pipe", "pipe", "inherit"] });
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

const latest = list.find((v) => v?.id)?.id ?? list[0]?.id;
if (!latest) {
  console.warn("[promote-worker] No version id found — skip promote.");
  process.exit(0);
}

console.log(`[promote-worker] Routing 100% traffic to version ${latest}`);
execSync(
  `npx wrangler versions deploy ${latest}@100% -y --name ${WORKER}`,
  { stdio: "inherit" },
);
