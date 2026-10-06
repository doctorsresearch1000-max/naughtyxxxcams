/**
 * Build-time manifest for edge middleware slug checks (no runtime API in middleware).
 * Skips write if CRAK credentials missing (keeps existing JSON).
 */
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT = join(__dirname, "../src/generated/resolvable-profile-slugs.json");

const PAGE_SIZE = 100;
const MAX_PAGES = 25;
const API_BASE = "https://performersext-api.pcvdaa.com/performers-ext";
const FETCH_TIMEOUT_MS = 8_000;

const TOKEN =
  process.env.CRAK_TOKEN?.trim() ||
  process.env.CRACKREVENUE_TOKEN?.trim() ||
  "";
const API_KEY =
  process.env.CRAK_API_KEY?.trim() ||
  process.env.CRACKREVENUE_API_KEY?.trim() ||
  "";
const USER_AGENT =
  process.env.CRACKREVENUE_USER_AGENT?.trim() ||
  "NaughtyXxxCams/1.0 (+https://naughtyxxxcams.com)";
const BRAND = process.env.CRAK_BRANDS?.trim() || "";

function performerProfileSlug(raw) {
  if (!raw?.trim()) return null;
  const slug = decodeURIComponent(raw)
    .trim()
    .replace(/^@+/, "")
    .toLowerCase()
    .replace(/_/g, "-")
    .replace(/[^a-z0-9-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "");
  return slug.length > 0 ? slug : null;
}

function legacyCompact(slug) {
  return slug.replace(/-/g, "");
}

function slugFromPerformer(p) {
  return (
    performerProfileSlug(p.nameClean || p.name) ??
    performerProfileSlug(p.itemId) ??
    ""
  );
}

function lookupKeys(slug) {
  const normalized = performerProfileSlug(slug);
  if (!normalized) return [];
  const compact = legacyCompact(normalized);
  const keys = [normalized];
  if (compact && compact !== normalized) keys.push(compact);
  return keys;
}

async function fetchPage(live, page) {
  const search = new URLSearchParams({
    token: TOKEN,
    brands: BRAND,
    gender: "f",
    live: String(live),
    page: String(page),
    size: String(PAGE_SIZE),
    sorting: "score",
    lang: "es",
  });

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  try {
    const res = await fetch(`${API_BASE}?${search}`, {
      signal: controller.signal,
      headers: {
        "x-api-key": API_KEY,
        "User-Agent": USER_AGENT,
      },
    });
    if (!res.ok) return [];
    const data = await res.json();
    return Array.isArray(data?.performers) ? data.performers : [];
  } catch {
    return [];
  } finally {
    clearTimeout(timeout);
  }
}

async function fetchPool(live) {
  const pool = [];
  for (let page = 1; page <= MAX_PAGES; page += 1) {
    const performers = await fetchPage(live, page);
    if (performers.length === 0) break;
    pool.push(...performers);
    if (performers.length < PAGE_SIZE) break;
  }
  return pool;
}

async function main() {
  if (!TOKEN || !API_KEY) {
    console.warn(
      "[generate-resolvable-profile-slugs] CRAK_TOKEN/CRAK_API_KEY missing — keeping existing manifest.",
    );
    try {
      readFileSync(OUT, "utf8");
      process.exit(0);
    } catch {
      mkdirSync(dirname(OUT), { recursive: true });
      writeFileSync(OUT, "[]\n", "utf8");
      console.warn("Wrote empty manifest (middleware will fail-open).");
      process.exit(0);
    }
  }

  const [live, offline] = await Promise.all([
    fetchPool(true),
    fetchPool(false),
  ]);
  const pool = [...live, ...offline];
  const keys = new Set();

  for (const performer of pool) {
    const slug = slugFromPerformer(performer);
    if (!slug) continue;
    for (const key of lookupKeys(slug)) {
      keys.add(key);
    }
  }

  const slugs = [...keys].sort((a, b) => a.localeCompare(b));
  mkdirSync(dirname(OUT), { recursive: true });
  writeFileSync(OUT, `${JSON.stringify(slugs, null, 0)}\n`, "utf8");
  console.log(
    `[generate-resolvable-profile-slugs] Wrote ${slugs.length} lookup keys (${pool.length} performers).`,
  );
}

main();
