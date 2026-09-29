/**
 * Ensures canonical model profiles stay indexable (no conditional noindex).
 * Run: node scripts/verify-profile-indexable.mjs
 */
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const metadataPath = join(
  root,
  "src/lib/seo/model-profile-metadata.ts",
);

const source = readFileSync(metadataPath, "utf8");

if (/noindex/i.test(source) && /fieldCount|MIN_FIELDS|reduced/i.test(source)) {
  console.error("FAIL: conditional noindex detected in profile metadata");
  process.exit(1);
}

const robotsFn = source.match(
  /export function buildModelProfileRobots[\s\S]*?^}/m,
)?.[0];

if (!robotsFn || !robotsFn.includes("index: true")) {
  console.error("FAIL: buildModelProfileRobots must allow index for canonical profiles");
  process.exit(1);
}

function textSimilarity(a, b) {
  const wordsA = new Set(a.toLowerCase().split(/\W+/).filter(Boolean));
  const wordsB = new Set(b.toLowerCase().split(/\W+/).filter(Boolean));
  let inter = 0;
  for (const w of wordsA) if (wordsB.has(w)) inter += 1;
  const union = wordsA.size + wordsB.size - inter;
  return union === 0 ? 0 : inter / union;
}

const intros = [
  "Nina streams live in English (US). Join the public show in one tap.",
  "Watch Nina on cam — English chat available now.",
  "Nina from US — live HD preview on this page.",
];
let maxSim = 0;
for (let i = 0; i < intros.length; i += 1) {
  for (let j = i + 1; j < intros.length; j += 1) {
    maxSim = Math.max(maxSim, textSimilarity(intros[i], intros[j]));
  }
}
if (maxSim > 0.72) {
  console.error(`FAIL: intro template similarity too high (${maxSim})`);
  process.exit(1);
}

console.log("OK: profile indexability + intro similarity checks passed");
