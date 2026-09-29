import type { CrackPerformer } from "@/lib/crackrevenue/api";
import { ModelTubeCard } from "@/components/cams/ModelTubeCard";
import { filterFeedPerformers } from "@/lib/feed/filterPerformers";
import { CATALOG_GRID_CLASS } from "@/lib/layout/catalogGridLayout";

type ExplorePerformerGridProps = {
  performers: CrackPerformer[];
  emptyMessage?: string;
};

export function ExplorePerformerGrid({
  performers,
  emptyMessage = "No models in this category right now. Try another tag or check back soon.",
}: ExplorePerformerGridProps) {
  const cards = filterFeedPerformers(performers);

  if (cards.length === 0) {
    return (
      <p className="rounded-2xl border border-zinc-800 bg-zinc-900/80 p-4 text-xs leading-relaxed text-zinc-400">
        {emptyMessage}
      </p>
    );
  }

  return (
    <div className={CATALOG_GRID_CLASS}>
      {cards.map((performer, index) => (
        <ModelTubeCard
          key={performer.feedKey}
          performer={performer}
          gridIndex={index}
          priority={index < 4}
        />
      ))}
    </div>
  );
}
