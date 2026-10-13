#!/usr/bin/env node
/**
 * Pre-build guard: sitemap manifest slugs must be canonical for public indexing.
 */
import { readFileSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import {
  isPublicIndexableProfileSlug,
  profileCanonicalPath,
  sanitizeModelSlug,
} from "./lib/canonical-model-slug.mjs";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const MANIFEST = join(root, "src/generated/profile-sitemap-slugs.json");
const SITE_ORIGIN = (
  process.env.NEXT_PUBLIC_SITE_URL?.trim() || "https://naughtyxxxcams.com"
)
  .replace(/\/$/, "")
  .replace(/^http:\/\//i, "https://");

let failed = false;

function fail(message) {
  console.error(`[audit-canonical-slugs] FAIL: ${message}`);
  failed = true;
}

if (!existsSync(MANIFEST)) {
  fail(`missing manifest ${MANIFEST} — run npm run generate:profile-slugs`);
} else {
  let slugs;
  try {
    slugs = JSON.parse(readFileSync(MANIFEST, "utf8"));
  } catch {
    fail("profile-sitemap-slugs.json is not valid JSON");
    slugs = [];
  }

  if (!Array.isArray(slugs)) {
    fail("profile-sitemap-slugs.json must be a JSON array");
  } else {
    const seen = new Set();
    for (const raw of slugs) {
      if (typeof raw !== "string") {
        fail(`non-string slug entry: ${String(raw)}`);
        continue;
      }
      if (!isPublicIndexableProfileSlug(raw)) {
        fail(
          `non-canonical slug "${raw}" (underscores, casing, or sanitize mismatch)`,
        );
        continue;
      }
      const reSanitized = sanitizeModelSlug(raw);
      if (reSanitized !== raw) {
        fail(`slug "${raw}" does not round-trip sanitizeModelSlug`);
      }
      const path = profileCanonicalPath(raw);
      const loc = `${SITE_ORIGIN}${path}`;
      if (loc.includes("_") || !loc.startsWith("https://")) {
        fail(`invalid sitemap loc for slug "${raw}": ${loc}`);
      }
      if (seen.has(raw)) {
        fail(`duplicate slug in manifest: ${raw}`);
      }
      seen.add(raw);
    }

    console.log(
      `[audit-canonical-slugs] OK — ${slugs.length} canonical /profile/{slug} entries`,
    );
  }
}

const exploreSlugsPath = join(root, "src/lib/explore/categorySlugs.ts");
if (existsSync(exploreSlugsPath)) {
  const src = readFileSync(exploreSlugsPath, "utf8");
  const matches = [...src.matchAll(/"([a-z0-9-]+)"/g)].map((m) => m[1]);
  for (const cat of matches) {
    if (cat.includes("_") || /[A-Z]/.test(cat)) {
      fail(`explore category slug not canonical: ${cat}`);
    }
  }
}

if (failed) {
  process.exit(1);
}
