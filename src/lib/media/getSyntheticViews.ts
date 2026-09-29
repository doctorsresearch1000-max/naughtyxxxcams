/** Deterministic viewer count for card FOMO when API has no live metric (450–12.8k). */

function hashSeed(input: string): number {
  let h = 2166136261;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

const MIN_VIEWS = 450;
const MAX_VIEWS = 12_800;

export function getSyntheticViews(modelId: string): number {
  const key = modelId.trim() || "unknown";
  const seed = hashSeed(key);
  const span = MAX_VIEWS - MIN_VIEWS + 1;
  return MIN_VIEWS + (seed % span);
}

export function formatViewsCount(count: number): string {
  if (count >= 10_000) {
    const k = count / 1000;
    const rounded = Math.round(k * 10) / 10;
    const text = rounded % 1 === 0 ? String(Math.round(rounded)) : rounded.toFixed(1);
    return `${text}k views`;
  }
  if (count >= 1000) {
    const k = count / 1000;
    const rounded = Math.round(k * 10) / 10;
    const text = rounded % 1 === 0 ? String(Math.round(rounded)) : rounded.toFixed(1);
    return `${text}k views`;
  }
  return `${count} views`;
}

export function getSyntheticViewsLabel(modelId: string): string {
  return formatViewsCount(getSyntheticViews(modelId));
}
