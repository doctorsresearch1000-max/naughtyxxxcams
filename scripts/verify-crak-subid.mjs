#!/usr/bin/env node
/**
 * Ensures CrakRevenue tracking URLs in source either use *_BASE constants
 * (wrapped in jerkmateTracking) or go through crak-subid helpers.
 */
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative } from "node:path";

const ROOT = join(import.meta.dirname, "..");
const SRC = join(ROOT, "src");
const SUBID = "naughtyxxxcams_com";

const ALLOWLIST_FILES = new Set([
  "src/lib/crackrevenue/crak-subid.ts",
  "src/lib/crackrevenue/jerkmateTracking.ts",
  "src/lib/crackrevenue/jerkmateAffiliate.ts",
  "src/lib/feed/nativeIframeFeed.ts",
  "src/lib/cams/roomTitleFilter.ts",
]);

const CRAK_URL_RE =
  /https?:\/\/(?:[\w-]+\.)*(?:crakrevenue\.com|ajrkmx5\.com)[^\s"'`)>]*/gi;

function walk(dir, out = []) {
  for (const name of readdirSync(dir)) {
    const full = join(dir, name);
    const st = statSync(full);
    if (st.isDirectory()) {
      if (name === "node_modules" || name === ".next") continue;
      walk(full, out);
    } else if (/\.(tsx?|mjs)$/.test(name)) {
      out.push(full);
    }
  }
  return out;
}

const violations = [];

for (const file of walk(SRC)) {
  const rel = relative(ROOT, file).replace(/\\/g, "/");
  if (ALLOWLIST_FILES.has(rel)) continue;

  const text = readFileSync(file, "utf8");
  const matches = text.match(CRAK_URL_RE);
  if (!matches) continue;

  for (const url of matches) {
    if (url.includes(`subid=${SUBID}`) || url.includes(`subid%3D${SUBID}`)) {
      continue;
    }
    violations.push({ rel, url: url.slice(0, 120) });
  }
}

if (violations.length > 0) {
  console.error("[verify-crak-subid] Hardcoded Crak URLs without subid wrapper:\n");
  for (const v of violations) {
    console.error(`  ${v.rel}\n    ${v.url}\n`);
  }
  process.exit(1);
}

console.log("[verify-crak-subid] OK — no bare Crak affiliate URLs outside allowlist.");
process.exit(0);
