import type { CrackPerformer } from "@/lib/crackrevenue/api";
import { getPerformerKey } from "@/lib/crackrevenue/api";
import { getSyntheticViewsLabel } from "@/lib/media/getSyntheticViews";

/**
 * Viewer line for cards — synthetic deterministic count when API has no live metric.
 */
export function performerCardMetricLabel(performer: CrackPerformer): string {
  const id =
    (performer as { feedKey?: string }).feedKey?.trim() ||
    getPerformerKey(performer) ||
    performer.itemId?.trim() ||
    performer.name?.trim() ||
    "model";
  return getSyntheticViewsLabel(id);
}
