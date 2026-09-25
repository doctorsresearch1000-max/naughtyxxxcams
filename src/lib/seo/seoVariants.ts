/** Stable index 0..n-1 from a string seed (per profile or category). */
export function stableVariantIndex(seed: string, modulo: number): number {
  if (modulo <= 0) return 0;
  let hash = 0;
  for (let i = 0; i < seed.length; i += 1) {
    hash = (hash * 31 + seed.charCodeAt(i)) | 0;
  }
  return Math.abs(hash) % modulo;
}

export function pickVariant<T>(seed: string, options: readonly T[]): T {
  return options[stableVariantIndex(seed, options.length)];
}
