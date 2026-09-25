"use client";

import { useMemo } from "react";
import { ChatWithModelCta } from "@/components/conversion/ChatWithModelCta";
import { DesktopLivePlayerShell } from "@/components/desktop/DesktopLivePlayerShell";
import { ProfileGallerySection } from "@/components/profile/desktop/ProfileGallerySection";
import { ProfileInterestsSection } from "@/components/profile/desktop/ProfileInterestsSection";
import { ProfileRecommendedGrid } from "@/components/profile/desktop/ProfileRecommendedGrid";
import { ProfileTipMenuSection } from "@/components/profile/desktop/ProfileTipMenuSection";
import { ProfileWelcomeHero } from "@/components/profile/desktop/ProfileWelcomeHero";
import {
  performerDisplayTags,
  performerShortBio,
} from "@/lib/desktop/performerCatalogMeta";
import { filterFeedPerformers } from "@/lib/feed/filterPerformers";
import { buildTipMenu } from "@/lib/profile/buildTipMenu";
import type { ModelProfileView } from "@/lib/profile/modelProfile";
import type { RecommendedProfile } from "@/lib/profile/profilePresentation";
type ModelProfileDesktopViewProps = {
  model: ModelProfileView;
  seoIntro: string;
  recommended: RecommendedProfile[];
};

export function ModelProfileDesktopView({
  model,
  seoIntro,
  recommended,
}: ModelProfileDesktopViewProps) {
  const likeKey = `profile-${model.profileSlug}`;

  const feedPerformer = useMemo(() => {
    if (!model.performer) return null;
    const list = filterFeedPerformers([model.performer]);
    return list[0] ?? null;
  }, [model.performer]);

  const tags = model.performer
    ? performerDisplayTags(model.performer)
    : model.traits.slice(0, 12);

  const welcomeText =
    model.performer
      ? performerShortBio(model.performer)
      : model.bio;

  const tipMenu = useMemo(
    () => buildTipMenu(model.performer),
    [model.performer],
  );

  return (
    <main className="hidden min-h-screen bg-zinc-950 pb-16 text-white lg:block">
      <div className="mx-auto max-w-[1600px] space-y-6 px-4 pt-[calc(var(--app-header-height)+1rem)]">
        <ProfileWelcomeHero
          model={model}
          welcomeText={welcomeText}
          likeKey={likeKey}
        >
          <ChatWithModelCta
            modelName={model.displayName}
            affiliateUrl={model.affiliateUrl}
            visible={true}
            className="w-full !py-3.5 !text-sm"
          />
          <a
            href={model.affiliateUrl}
            target="_blank"
            rel="nofollow noopener sponsored"
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-[#39FF14]/50 bg-zinc-950 px-4 py-3.5 text-sm font-extrabold text-white transition hover:bg-[#39FF14]/10 hover:ring-1 hover:ring-[#39FF14]/40"
          >
            Go to private room
            <span aria-hidden>→</span>
          </a>
        </ProfileWelcomeHero>

        <div className="relative h-[min(72vh,820px)] min-h-[480px] overflow-hidden rounded-2xl border border-zinc-800 bg-black ring-1 ring-[#39FF14]/15">
          {feedPerformer ? (
            <DesktopLivePlayerShell performer={feedPerformer} fillParent />
          ) : null}
        </div>

        <p className="text-center text-xs text-zinc-500">{seoIntro}</p>

        <ProfileGallerySection items={model.galleryItems} />

        <ProfileInterestsSection tags={tags} aboutCards={model.aboutCards} />

        <ProfileTipMenuSection
          items={tipMenu}
          affiliateUrl={model.affiliateUrl}
        />

        <ProfileRecommendedGrid recommended={recommended} />
      </div>
    </main>
  );
}
