import type { ModelProfileView } from "@/lib/profile/modelProfile";

export type PublicModelProfileView = Omit<
  ModelProfileView,
  "affiliateUrl" | "performer" | "crakLandingId"
>;

export function toPublicModelProfile(
  model: ModelProfileView,
): PublicModelProfileView {
  const {
    affiliateUrl: _affiliateUrl,
    performer: _performer,
    crakLandingId: _crakLandingId,
    ...publicModel
  } = model;
  return publicModel;
}
