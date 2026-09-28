import type { CrackPerformer } from "@/lib/crackrevenue/api";
import { ExploreTubeGrid } from "@/components/explore/ExploreTubeGrid";

type ExploreSlushyGridProps = {
  performers: CrackPerformer[];
  emptyMessage?: string;
};

/** @deprecated Use ExploreTubeGrid — kept for import compatibility. */
export function ExploreSlushyGrid(props: ExploreSlushyGridProps) {
  return <ExploreTubeGrid {...props} />;
}
