/**
 * SEO guardrails for canonical model profiles (point 14).
 * Run: npm run test:seo
 */
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const metadataPath = join(root, "src/lib/seo/model-profile-metadata.ts");
const qualityPath = join(root, "src/lib/seo/profileContentQuality.ts");
const modelPagePath = join(root, "src/copy/model-page.ts");

const SIMILARITY_THRESHOLD = 0.72;

const source = readFileSync(metadataPath, "utf8");

if (/noindex/i.test(source) && /fieldCount|MIN_FIELDS|reduced/i.test(source)) {
  console.error("FAIL: conditional noindex detected in profile metadata");
  process.exit(1);
}

const robotsFn = source.match(
  /export function buildModelProfileRobots[\s\S]*?^}/m,
)?.[0];

const allowsIndex =
  robotsFn &&
  (robotsFn.includes("index: true") || robotsFn.includes("INDEXABLE_ROBOTS"));
if (!allowsIndex) {
  console.error(
    "FAIL: buildModelProfileRobots must allow index for canonical profiles",
  );
  process.exit(1);
}

if (/index:\s*false[\s\S]*profileSlug|profileSlug[\s\S]*index:\s*false/i.test(source)) {
  const canonicalBlock = source.includes("intent === \"vip\"");
  if (!canonicalBlock) {
    console.error("FAIL: unexpected noindex on canonical profile metadata");
    process.exit(1);
  }
}

function textSimilarity(a, b) {
  const wordsA = new Set(a.toLowerCase().split(/\W+/).filter(Boolean));
  const wordsB = new Set(b.toLowerCase().split(/\W+/).filter(Boolean));
  if (wordsA.size === 0 || wordsB.size === 0) return 0;
  let inter = 0;
  for (const w of wordsA) if (wordsB.has(w)) inter += 1;
  const union = wordsA.size + wordsB.size - inter;
  return union === 0 ? 0 : inter / union;
}

/** Keep in sync with src/copy/model-page.ts introTemplateVariants */
const introTemplates = [
  (name, language, country, live) =>
    `${name} streams live in ${language}${country ? ` (${country})` : ""}. ${live ? "Join the public show in one tap." : "Save the profile to catch the next session."}`,
  (name, language, _country, live) =>
    `Watch ${name} on cam — ${language} chat${live ? " available now" : " when she's online"}.`,
  (name, _language, country, live) =>
    `${name}${country ? ` from ${country}` : ""} — ${live ? "live HD preview on this page" : "offline; notifications coming soon"}.`,
];

const sampleModels = [
  { slug: "alice-cam", name: "Alice", language: "English", country: "US", live: true },
  { slug: "bella-live", name: "Bella", language: "Spanish", country: "ES", live: false },
  { slug: "cara-hd", name: "Cara", language: "French", country: "FR", live: true },
  { slug: "dana-room", name: "Dana", language: "German", country: "DE", live: false },
  { slug: "ella-show", name: "Ella", language: "Italian", country: "IT", live: true },
];

function stableVariantIndex(seed, count) {
  let hash = 0;
  for (let i = 0; i < seed.length; i += 1) {
    hash = (hash * 31 + seed.charCodeAt(i)) | 0;
  }
  return Math.abs(hash) % count;
}

const intros = sampleModels.map((m) => {
  const idx = stableVariantIndex(m.slug, introTemplates.length);
  const fn = introTemplates[idx];
  return fn(m.name, m.language, m.country, m.live);
});

let maxSim = 0;
for (let i = 0; i < intros.length; i += 1) {
  for (let j = i + 1; j < intros.length; j += 1) {
    maxSim = Math.max(maxSim, textSimilarity(intros[i], intros[j]));
  }
}

if (maxSim > SIMILARITY_THRESHOLD) {
  console.error(
    `FAIL: intro template similarity too high across sample (${maxSim.toFixed(3)} > ${SIMILARITY_THRESHOLD})`,
  );
  process.exit(1);
}

const qualitySource = readFileSync(qualityPath, "utf8");
const minFieldsMatch = qualitySource.match(
  /PROFILE_LONG_INTRO_MIN_FIELDS\s*=\s*(\d+)/,
);
const minFields = minFieldsMatch ? Number(minFieldsMatch[1]) : 4;

const modelPageSource = readFileSync(modelPagePath, "utf8");
const variantCount = (modelPageSource.match(/\(name: string/g) || []).length;
if (variantCount < 3) {
  console.error(`FAIL: expected at least 3 intro variants, found ${variantCount}`);
  process.exit(1);
}

let reducedCount = 0;
for (const m of sampleModels) {
  let fields = 0;
  if (m.name) fields += 1;
  if (m.language) fields += 1;
  if (m.country) fields += 1;
  if (fields < minFields) reducedCount += 1;
}

console.log(
  `OK: indexability + intro similarity (max ${maxSim.toFixed(3)}); ${variantCount} templates; min fields ${minFields}; sample reduced ${reducedCount}/${sampleModels.length}`,
);
