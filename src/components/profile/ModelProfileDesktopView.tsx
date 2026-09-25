"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, type MouseEvent } from "react";
import { ChatWithModelCta } from "@/components/conversion/ChatWithModelCta";
import { DesktopLivePlayerShell } from "@/components/desktop/DesktopLivePlayerShell";
import { LikeActionButton } from "@/components/feed/LikeActionButton";
import {
  performerDisplayTags,
  performerShortBio,
} from "@/lib/desktop/performerCatalogMeta";
import { filterFeedPerformers } from "@/lib/feed/filterPerformers";
import type { ModelProfileView } from "@/lib/profile/modelProfile";
import type { RecommendedProfile } from "@/lib/profile/profilePresentation";
import { useDesktopGatedAction } from "@/hooks/useDesktopGatedAction";
import { useDelayedConversionCta } from "@/hooks/useDelayedConversionCta";

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
  const conversionReady = useDelayedConversionCta(true, 8_000);
  const { gateAnchorClick } = useDesktopGatedAction();
  const likeKey = `profile-${model.profileSlug}`;

  const feedPerformer = useMemo(() => {
    if (!model.performer) return null;
    const list = filterFeedPerformers([model.performer]);
    return list[0] ?? null;
  }, [model.performer]);

  const tags = model.performer
    ? performerDisplayTags(model.performer)
    : model.traits.slice(0, 8);

  const gatedAffiliateClick = (e: MouseEvent<HTMLAnchorElement>) => {
    gateAnchorClick(e, model.affiliateUrl);
  };

  return (
    <main className="hidden min-h-screen bg-zinc-950 pb-12 text-white lg:block">
      <div className="mx-auto max-w-[1600px] px-4 pt-[calc(var(--app-header-height)+1rem)]">
        <div className="grid min-h-[calc(100vh-var(--app-header-height)-2rem)] grid-cols-[1fr_380px] gap-4">
          <section className="flex min-h-0 flex-col gap-4">
            <div className="relative h-[min(70vh,820px)] min-h-[480px] overflow-hidden rounded-2xl border border-zinc-800 bg-black ring-1 ring-[#39FF14]/10">
              {feedPerformer ? (
                <DesktopLivePlayerShell performer={feedPerformer} fillParent />
              ) : (
                <div className="relative h-full min-h-[480px]">
                  {model.bannerUrl ? (
                    <Image
                      src={model.bannerUrl}
                      alt={model.displayName}
                      fill
                      className="object-cover"
                      unoptimized
                    />
                  ) : null}
                </div>
              )}
            </div>

            <div className="rounded-2xl border border-zinc-800 bg-zinc-900/80 p-4">
              <h1 className="text-2xl font-black">{model.displayName}</h1>
              <p className="text-sm text-zinc-400">{model.handle}</p>
              <p className="mt-3 text-sm leading-relaxed text-zinc-300">
                {model.performer
                  ? performerShortBio(model.performer)
                  : model.bio}
              </p>
              <p className="mt-2 text-xs text-zinc-500">{seoIntro}</p>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-md bg-zinc-950 px-2 py-0.5 text-[10px] font-semibold uppercase text-zinc-300 ring-1 ring-zinc-800"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </section>

          <aside className="flex flex-col gap-3 overflow-y-auto rounded-2xl border border-zinc-800 bg-zinc-900/90 p-4">
            <div className="flex items-center justify-between">
              <span
                className={`rounded-full px-3 py-1 text-[11px] font-black ${
                  model.status === "live"
                    ? "bg-[#39FF14] text-black"
                    : "bg-zinc-800 text-zinc-300"
                }`}
              >
                {model.status === "live" ? "• LIVE" : "OFFLINE"}
              </span>
              <LikeActionButton feedKey={likeKey} />
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              {model.aboutCards.slice(0, 6).map((card) => (
                <div
                  key={card.label}
                  className="rounded-xl bg-zinc-950 p-3 ring-1 ring-zinc-800"
                >
                  <p className="text-[10px] font-semibold uppercase text-zinc-500">
                    {card.label}
                  </p>
                  <p className="mt-1 font-semibold text-white">{card.value}</p>
                </div>
              ))}
            </div>

            <ChatWithModelCta
              modelName={model.displayName}
              affiliateUrl={model.affiliateUrl}
              visible={conversionReady}
              className="w-full !text-sm"
            />

            <a
              href={model.affiliateUrl}
              target="_blank"
              rel="nofollow noopener"
              onClick={gatedAffiliateClick}
              className="flex w-full items-center justify-between rounded-xl border border-[#39FF14]/40 bg-zinc-950 px-4 py-3 text-sm font-bold text-white transition hover:border-[#39FF14]"
            >
              Go to private room
              <span aria-hidden>→</span>
            </a>

            {recommended.length > 0 ? (
              <div className="mt-2 border-t border-zinc-800 pt-4">
                <p className="text-[10px] font-black tracking-widest text-zinc-500">
                  MORE LIVE
                </p>
                <ul className="mt-2 space-y-2">
                  {recommended.slice(0, 6).map((r) => (
                    <li key={r.slug}>
                      <Link
                        href={r.profilePath}
                        className="flex items-center gap-2 rounded-lg p-2 transition hover:bg-zinc-800/80 hover:ring-1 hover:ring-[#39FF14]/25"
                      >
                        <span className="relative h-10 w-10 overflow-hidden rounded-full bg-zinc-800">
                          <Image
                            src={r.avatar}
                            alt={r.name}
                            fill
                            className="object-cover"
                            unoptimized
                            sizes="40px"
                          />
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-sm font-bold">
                            {r.name}
                          </span>
                          {r.live ? (
                            <span className="text-[10px] font-bold text-[#39FF14]">
                              LIVE
                            </span>
                          ) : null}
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
          </aside>
        </div>

        <section className="mt-8">
          <h2 className="text-xs font-black tracking-[0.25em] text-[#39FF14]">
            GALLERY
          </h2>
          <div className="mt-4 grid grid-cols-6 gap-2">
            {model.galleryItems.map((item) => (
              <div
                key={item.id}
                className="relative aspect-[3/4] overflow-hidden rounded-xl bg-zinc-900 ring-1 ring-zinc-800"
              >
                <Image
                  src={item.src}
                  alt=""
                  fill
                  unoptimized
                  className={`object-cover ${item.locked ? "blur-md brightness-50" : ""}`}
                  sizes="16vw"
                />
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
