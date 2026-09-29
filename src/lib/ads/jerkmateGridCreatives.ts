import { filterSafeJerkmateCreatives } from "@/lib/ads/jerkmateCreativePolicy";

/** Local Jerkmate in-grid creatives (public/ads/jerkmate). Review via `npm run test:ads`. */

const JERKMATE_GRID_CREATIVE_PATHS_RAW: readonly string[] = [
  "/ads/jerkmate/dd29f7ae-7854-4df3-8e8a-abde2df8d253.jpg",
  "/ads/jerkmate/63911948-323c-4a9a-9e09-c0ba002260ac.jpg",
  "/ads/jerkmate/2b6f7af2-cc02-42f0-988e-b763d3005ee9.gif",
  "/ads/jerkmate/0387e7fd-1abc-472e-8049-8f746cadc8b0.jpg",
  "/ads/jerkmate/95bb1ea3-a139-413e-872f-c89a643e3794.jpg",
  "/ads/jerkmate/cec523a9-78c0-4f14-b757-f245623efcdf.jpg",
  "/ads/jerkmate/240b0113-ab5d-4159-9e83-1005248ef570.gif",
  "/ads/jerkmate/4fb8dde8-0b89-4666-8495-b78940d919e9.gif",
  "/ads/jerkmate/87fb9656-af88-4e58-a3ce-bd472fb8f91e.gif",
  "/ads/jerkmate/beea94a1-f7b4-457e-8b82-723101ae03c9.gif",
  "/ads/jerkmate/a16e6e1a-e185-41d5-bd90-27cf199cc434.gif",
  "/ads/jerkmate/a1fa4767-f4f3-4ea7-bbf0-79ce41b31425.jpg",
  "/ads/jerkmate/92e58503-d0cf-45a4-bf19-dc54e93b3caa.jpg",
  "/ads/jerkmate/b0b140d7-72c0-41e5-891b-b2ec67b785ca.jpg",
  "/ads/jerkmate/9371fb3f-811f-45e0-84a6-9cdad7626054.jpg",
  "/ads/jerkmate/29a64ccc-f967-4f61-9488-641c929db2de.jpg",
] as const;

export const JERKMATE_GRID_CREATIVE_PATHS: readonly string[] =
  filterSafeJerkmateCreatives(JERKMATE_GRID_CREATIVE_PATHS_RAW);

export function pickJerkmateGridCreative(adSlotIndex: number): string {
  const list = JERKMATE_GRID_CREATIVE_PATHS;
  if (list.length === 0) {
    return "/ads/jerkmate/29a64ccc-f967-4f61-9488-641c929db2de.jpg";
  }
  const idx =
    ((adSlotIndex % list.length) + list.length) % list.length;
  return list[idx]!;
}
