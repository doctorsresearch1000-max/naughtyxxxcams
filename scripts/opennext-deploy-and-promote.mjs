#!/usr/bin/env node
/**
 * Run OpenNext deploy, capture Cloudflare "Current Version ID", promote that exact version.
 */
import { spawnSync } from "node:child_process";
import { execSync } from "node:child_process";

const VERSION_RE = /Current Version ID:\s*([0-9a-f-]{36})/i;

function main() {
  const result = spawnSync(
    "npx",
    ["opennextjs-cloudflare", "deploy"],
    { encoding: "utf8", stdio: ["inherit", "pipe", "inherit"] },
  );

  const combined = `${result.stdout ?? ""}${result.stderr ?? ""}`;
  process.stdout.write(result.stdout ?? "");

  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }

  const match = combined.match(VERSION_RE);
  const versionId = match?.[1]?.trim();
  if (!versionId) {
    console.warn(
      "[deploy] Could not parse Current Version ID from deploy output — promote will use newest from list.",
    );
    execSync("node scripts/promote-cloudflare-worker.mjs", { stdio: "inherit" });
    return;
  }

  console.log(`[deploy] Parsed deploy version: ${versionId}`);
  execSync(`node scripts/promote-cloudflare-worker.mjs ${versionId}`, {
    stdio: "inherit",
    env: { ...process.env, WRANGLER_DEPLOY_VERSION_ID: versionId },
  });
}

main();
