#!/usr/bin/env node
/**
 * Refresh /public/explore/categories/*.jpg from live Streamate performer snapshots
 * (same partner thumbs as the feed — NSFW, category-matched).
 *
 * Usage: CRAK_TOKEN=… CRAK_API_KEY=… node scripts/refresh-explore-category-covers.mjs
 */
import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const outDir = path.join(root, "public", "explore", "categories");

const HUB_SLUGS = [
  "latinas",
  "verified",
  "milf",
  "petite",
  "cosplay",
  "couples",
];

const CATEGORY_MAP = {
  latinas: { api: { ethnicities: "hispanic" } },
  verified: {
    api: {},
    clientMatch: ["gc_18_19", "gc_20_29", "young", "verified"],
  },
  milf: { api: { tags: "milf" } },
  petite: { api: { tags: "petite" }, clientMatch: ["skinny", "petite"] },
  cosplay: {
    api: { tags: "dancing" },
    clientMatch: ["cosplay", "costume", "roleplay", "anime"],
  },
  couples: {
    api: { tags: "kinky" },
    clientMatch: ["couple", "couples", "duo", "pair"],
  },
};

const API_BASE = "https://performersext-api.pcvdaa.com/performers-ext";
const TARGET_W = 900;
const TARGET_H = 506;

function loadWranglerVars() {
  const jsonc = path.join(root, "wrangler.jsonc");
  if (fs.existsSync(jsonc)) {
    const stripped = fs
      .readFileSync(jsonc, "utf8")
      .replace(/\/\*[\s\S]*?\*\//g, "")
      .replace(/^\s*\/\/.*$/gm, "");
    try {
      const cfg = JSON.parse(stripped);
      const v = cfg.vars ?? {};
      return { token: v.CRAK_TOKEN, key: v.CRAK_API_KEY };
    } catch {
      /* fall through */
    }
  }
  const toml = path.join(root, "wrangler.toml");
  if (fs.existsSync(toml)) {
    const text = fs.readFileSync(toml, "utf8");
    return {
      token: text.match(/CRAK_TOKEN\s*=\s*"([^"]+)"/)?.[1],
      key: text.match(/CRAK_API_KEY\s*=\s*"([^"]+)"/)?.[1],
    };
  }
  return {};
}

const wrangler = loadWranglerVars();
const TOKEN = process.env.CRAK_TOKEN ?? wrangler.token ?? "";
const API_KEY = process.env.CRAK_API_KEY ?? wrangler.key ?? "";
const UA =
  process.env.CRACKREVENUE_USER_AGENT ??
  "NaughtyXxxCams/1.0 (+https://naughtyxxxcams.com)";

if (!TOKEN || !API_KEY) {
  console.error("Missing CRAK_TOKEN / CRAK_API_KEY");
  process.exit(1);
}

function tagBlob(p) {
  return [
    ...(p.autoTags ?? []),
    ...(p.characteristicsTags ?? []),
    ...(p.customTags ?? []),
    p.name ?? "",
    p.nameClean ?? "",
  ]
    .join(" ")
    .toLowerCase();
}

function matchesEthnicity(p, value) {
  const ethnicities = p.characteristic?.ethnicities ?? [];
  return ethnicities.some((e) =>
    String(e).toLowerCase().includes(value.toLowerCase()),
  );
}

function matchesCategory(p, config, { strictClient = false } = {}) {
  if (p.live === false) return false;
  const blob = tagBlob(p);
  const { api = {}, clientMatch } = config;

  if (api.ethnicities && !matchesEthnicity(p, api.ethnicities)) return false;
  if (api.tags && !blob.includes(api.tags.toLowerCase())) return false;

  if (clientMatch?.length) {
    const hit = clientMatch.some((h) => blob.includes(h.toLowerCase()));
    if (strictClient) return hit;
    if (hit) return true;
  }

  if (api.ethnicities || api.tags) return true;
  return false;
}

function matchesVerifiedYoung(p) {
  const blob = tagBlob(p);
  if (blob.includes("verified")) return true;
  const age = p.characteristic?.age;
  if (typeof age === "number" && age >= 18 && age <= 29) return true;
  return ["gc_18_19", "gc_20_29", "young"].some((t) => blob.includes(t));
}

const STRICT_PICK = {
  verified: (p) => matchesVerifiedYoung(p),
  cosplay: (p) =>
    matchesCategory(p, CATEGORY_MAP.cosplay, { strictClient: true }) ||
    tagBlob(p).includes("cosplay"),
  couples: (p) =>
    matchesCategory(p, CATEGORY_MAP.couples, { strictClient: true }),
  petite: (p) => tagBlob(p).includes("petite") || tagBlob(p).includes("skinny"),
};

function coverUrl(p) {
  const snap = p.liveSnapshotURL?.trim();
  const thumb = p.thumbnailUrl?.trim();
  return snap || thumb || null;
}

function scorePerformer(p) {
  let s = Number(p.systemScore) || 0;
  if (p.liveSnapshotURL) s += 50;
  if (p.live !== false) s += 20;
  return s;
}

async function fetchPool(pages = 4) {
  const merged = [];
  const seen = new Set();

  for (let page = 1; page <= pages; page++) {
    const url = new URL(API_BASE);
    url.searchParams.set("token", TOKEN);
    url.searchParams.set("brands", "streamate");
    url.searchParams.set("gender", "f");
    url.searchParams.set("live", "true");
    url.searchParams.set("size", "100");
    url.searchParams.set("page", String(page));
    url.searchParams.set("sorting", "score");
    url.searchParams.set("lang", "es");

    const res = await fetch(url, {
      headers: {
        "User-Agent": UA,
        Accept: "application/json",
        "x-api-key": API_KEY,
      },
    });
    if (!res.ok) break;
    const json = await res.json().catch(() => ({}));
    for (const p of json.performers ?? []) {
      const key = p.itemId || p.nameClean || p.name;
      if (!key || seen.has(key)) continue;
      seen.add(key);
      merged.push(p);
    }
  }

  return merged;
}

function pickBest(pool, slug, usedKeys) {
  const config = CATEGORY_MAP[slug];
  const extra = STRICT_PICK[slug];
  const notUsed = (p) => {
    const key = p.itemId || p.nameClean || p.name;
    return key && !usedKeys.has(key) && coverUrl(p);
  };

  let candidates = pool
    .filter((p) => notUsed(p) && matchesCategory(p, config))
    .sort((a, b) => scorePerformer(b) - scorePerformer(a));

  if (extra) {
    const strict = pool
      .filter((p) => notUsed(p) && extra(p))
      .sort((a, b) => scorePerformer(b) - scorePerformer(a));
    if (strict.length) candidates = strict;
  }

  if (candidates.length) return candidates[0];

  const fallback = pool
    .filter((p) => notUsed(p))
    .sort((a, b) => scorePerformer(b) - scorePerformer(a));
  return fallback[0] ?? null;
}

async function downloadToFile(url, dest) {
  const res = await fetch(url, { headers: { "User-Agent": UA } });
  if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
  const buf = Buffer.from(await res.arrayBuffer());
  const tmp = `${dest}.raw`;
  fs.writeFileSync(tmp, buf);
  try {
    execSync(
      `ffmpeg -y -hide_banner -loglevel error -i "${tmp}" -vf "scale=${TARGET_W}:${TARGET_H}:force_original_aspect_ratio=increase,crop=${TARGET_W}:${TARGET_H}" -q:v 3 "${dest}"`,
      { stdio: "pipe" },
    );
  } catch {
    fs.copyFileSync(tmp, dest);
  } finally {
    try {
      fs.unlinkSync(tmp);
    } catch {
      /* ignore */
    }
  }
}

async function main() {
  fs.mkdirSync(outDir, { recursive: true });
  console.log("Fetching live performer pool…");
  const pool = await fetchPool();
  console.log(`Pool size: ${pool.length}`);

  const usedKeys = new Set();

  for (const slug of HUB_SLUGS) {
    const performer = pickBest(pool, slug, usedKeys);
    if (!performer) {
      console.warn(`[${slug}] No performer with cover — skip`);
      continue;
    }
    const key = performer.itemId || performer.nameClean || performer.name;
    usedKeys.add(key);
    const url = coverUrl(performer);
    const dest = path.join(outDir, `${slug}.jpg`);
    const label = performer.nameClean || performer.name || performer.itemId;
    console.log(`[${slug}] ${label} → ${dest}`);
    await downloadToFile(url, dest);
  }

  console.log("Done.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
