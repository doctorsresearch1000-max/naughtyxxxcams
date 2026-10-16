import type { FeedPerformer } from "@/lib/feed/filterPerformers";
import { getPerformerKey } from "@/lib/crackrevenue/api";
import type { PublicModelProfileView } from "@/lib/public/publicModelProfile";
import { performerProfilePathFromPerformer } from "@/lib/profile/performerHandle";
import type { SavedModelRef } from "@/lib/user/userLibrary";

export function savedModelRefFromPerformer(
  performer: FeedPerformer,
  profilePath?: string | null,
): SavedModelRef {
  const posterUrl =
    performer.posterUrl ||
    performer.liveSnapshotURL?.trim() ||
    performer.thumbnailUrl ||
    "";
  return {
    feedKey: performer.feedKey,
    nameClean: performer.nameClean,
    name: performer.name,
    posterUrl,
    profilePath: profilePath ?? performerProfilePathFromPerformer(performer),
  };
}

export function savedModelRefFromProfile(
  model: PublicModelProfileView,
): SavedModelRef {
  const feedKey = `profile:${model.profileSlug}`;
  const posterUrl = model.avatar || model.bannerUrl || "";
  return {
    feedKey,
    nameClean: model.displayName,
    name: model.name,
    posterUrl,
    profilePath: `/profile/${model.profileSlug}`,
  };
}
