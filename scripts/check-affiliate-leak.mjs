#!/usr/bin/env node
/**
 * Fails CI/deploy if public responses contain bare affiliate tracker hosts.
 */
const AFFILIATE_LEAK_HOST_PATTERNS = [
  /ajrkmx\d*\.com/i,
  /(?:^|\/\/)(?:[\w-]+\.)*crakrevenue\.com/i,
  /camsk7\.com/i,
  /t\.camsk7/i,
  /jerkmate\.com/i,
  /crxcr2\.com/i,
];

const BASE =
  process.env.AFFILIATE_LEAK_CHECK_BASE_URL?.trim() ||
  process.env.NEXT_PUBLIC_SITE_URL?.trim() ||
  "https://naughtyxxxcams.com";

const PATHS = [
  "/",
  "/explore",
  "/following",
  "/api/performers?bootstrap=1",
  "/api/explore/bootstrap",
];

function findLeak(text) {
  for (const re of AFFILIATE_LEAK_HOST_PATTERNS) {
    re.lastIndex = 0;
    const m = re.exec(text);
    if (m) return m[0];
  }
  return null;
}

async function fetchText(path) {
  const url = new URL(path, BASE).toString();
  const res = await fetch(url, {
    headers: {
      "User-Agent": "nx-affiliate-leak-audit/1.0",
      Accept: "text/html,application/json,*/*",
    },
    redirect: "follow",
  });
  const text = await res.text();
  return { url, status: res.status, text };
}

const profileSlug =
  process.env.AFFILIATE_LEAK_CHECK_PROFILE_SLUG?.trim() || "test-model";

async function main() {
  const targets = [...PATHS, `/profile/${profileSlug}`];
  const failures = [];

  for (const path of targets) {
    try {
      const { url, status, text } = await fetchText(path);
      if (status >= 500) {
        failures.push({ url, reason: `HTTP ${status}` });
        continue;
      }
      const hit = findLeak(text);
      if (hit) failures.push({ url, reason: `leak:${hit}` });
    } catch (err) {
      failures.push({ url: path, reason: String(err) });
    }
  }

  if (failures.length > 0) {
    console.error("[check-affiliate-leak] FAILED\n");
    for (const f of failures) {
      console.error(`  ${f.url} → ${f.reason}`);
    }
    process.exit(1);
  }

  console.log(`[check-affiliate-leak] OK — ${targets.length} URLs clean (${BASE})`);
}

main();
