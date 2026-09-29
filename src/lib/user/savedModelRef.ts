import type { FeedPerformer } from "@/lib/feed/filterPerformers";
import { getPerformerKey, pickCoverUrl } from "@/lib/crackrevenue/api";
import type { ModelProfileView } from "@/lib/profile/modelProfile";
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

export function savedModelRefFromProfile(model: ModelProfileView): SavedModelRef {
  const performer = model.performer;
  const feedKey = performer
    ? getPerformerKey(performer)
    : `profile:${model.profileSlug}`;
  const posterUrl =
    model.avatar ||
    model.bannerUrl ||
    (performer ? pickCoverUrl(performer) : "") ||
    "";
  return {
    feedKey,
    nameClean: model.displayName,
    name: model.name,
    posterUrl,
    profilePath: `/profile/${model.profileSlug}`,
  };
}
