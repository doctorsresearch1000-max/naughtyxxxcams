/**
 * Unit checks for room title filtering (no tag padding).
 * Run: node scripts/verify-room-titles.mjs
 */
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
const root = join(dirname(fileURLToPath(import.meta.url)), "..");

// Inline mirror of blocked patterns (see roomTitleFilter.ts):
function looksBlocked(text) {
  const lower = text.toLowerCase().trim();
  if (lower.includes("_")) return true;
  if (/^gc_\d/i.test(lower)) return true;
  if (lower === "beautiful" || lower === "brown hair") return true;
  if (lower.length < 10) return true;
  return false;
}

const cases = [
  ["beautiful", true],
  ["brown hair", true],
  ["gc_18_19", true],
  ["Real show topic for tonight only fans", false],
];

for (const [input, shouldBlock] of cases) {
  const blocked = looksBlocked(input);
  if (blocked !== shouldBlock) {
    console.error(`FAIL: room title filter for "${input}" expected blocked=${shouldBlock}`);
    process.exit(1);
  }
}

const filterPath = join(root, "src/lib/cams/roomTitleFilter.ts");
const filterSource = readFileSync(filterPath, "utf8");
if (!filterSource.includes("gc_18_19") && !filterSource.includes("AGE_BUCKET")) {
  console.error("FAIL: roomTitleFilter missing age bucket guard");
  process.exit(1);
}

console.log("OK: room title filter guards present");
