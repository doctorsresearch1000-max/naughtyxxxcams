import type { CrackPerformer } from "@/lib/crackrevenue/api";
import { ExploreTubeGrid } from "@/components/explore/ExploreTubeGrid";

type ExploreDesktopGridProps = {
  performers: CrackPerformer[];
  emptyMessage?: string;
};

/** @deprecated Use ExploreTubeGrid — kept for import compatibility. */
export function ExploreDesktopGrid(props: ExploreDesktopGridProps) {
  return <ExploreTubeGrid {...props} />;
}
