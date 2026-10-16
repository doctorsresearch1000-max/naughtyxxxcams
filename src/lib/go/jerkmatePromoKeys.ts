export type JerkmatePromoKey =
  | "jerkmate-global"
  | "jerkmate-home-wide"
  | "jerkmate-home-mobile-gif"
  | "jerkmate-following-gif"
  | "jerkmate-explore-in-feed"
  | "jerkmate-explore-gif"
  | `jerkmate-grid-${number}`;

export function isJerkmatePromoKey(value: string): value is JerkmatePromoKey {
  if (value === "jerkmate-global") return true;
  if (value === "jerkmate-home-wide") return true;
  if (value === "jerkmate-home-mobile-gif") return true;
  if (value === "jerkmate-following-gif") return true;
  if (value === "jerkmate-explore-in-feed") return true;
  if (value === "jerkmate-explore-gif") return true;
  if (/^jerkmate-grid-\d+$/.test(value)) return true;
  return false;
}
