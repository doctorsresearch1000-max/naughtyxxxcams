import type { CrackPerformer } from "@/lib/crackrevenue/api";

export function formatViewerCount(count: number): string {
  if (count >= 1_000_000) {
    return `${(count / 1_000_000).toFixed(1).replace(/\.0$/, "")}M`;
  }
  if (count >= 10_000) {
    return `${Math.round(count / 1000)}K`;
  }
  if (count >= 1000) {
    return `${(count / 1000).toFixed(1).replace(/\.0$/, "")}K`;
  }
  return String(count);
}

/** Stable display count from API score or feed key (no mock images). */
export function estimateViewerCount(
  performer: CrackPerformer,
  feedKey: string,
): number {
  const score = performer.systemScore;
  if (typeof score === "number" && Number.isFinite(score) && score > 0) {
    return Math.min(99_999, Math.max(48, Math.round(score * 38 + 120)));
  }

  let hash = 0;
  for (let i = 0; i < feedKey.length; i += 1) {
    hash = (hash * 31 + feedKey.charCodeAt(i)) | 0;
  }
  return 420 + Math.abs(hash % 18_500);
}
