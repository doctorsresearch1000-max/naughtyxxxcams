/**
 * Wide/natural sponsor strips — only 300×250 (or similar) approved assets.
 * Do not reuse in-grid paths via index offsets (prevents wrong art after list edits).
 */

export const JERKMATE_NATURAL_BANNER_PATHS: readonly string[] = [
  "/ads/jerkmate/29a64ccc-f967-4f61-9488-641c929db2de.jpg",
  "/ads/jerkmate/2b6f7af2-cc02-42f0-988e-b763d3005ee9.gif",
  "/ads/jerkmate/240b0113-ab5d-4159-9e83-1005248ef570.gif",
  "/ads/jerkmate/4fb8dde8-0b89-4666-8495-b78940d919e9.gif",
  "/ads/jerkmate/87fb9656-af88-4e58-a3ce-bd472fb8f91e.gif",
  "/ads/jerkmate/beea94a1-f7b4-457e-8b82-723101ae03c9.gif",
] as const;

export function pickJerkmateNaturalBannerSrc(slot = 0): string {
  const list = JERKMATE_NATURAL_BANNER_PATHS;
  const idx = ((slot % list.length) + list.length) % list.length;
  return list[idx]!;
}
