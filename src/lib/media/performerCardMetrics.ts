import type { CrackPerformer } from "@/lib/crackrevenue/api";

/**
 * Performers-ext does not expose real view/viewer counts.
 * Return null so UI hides the metric (no invented numbers).
 */
export function performerCardMetricLabel(_performer: CrackPerformer): string | null {
  return null;
}
