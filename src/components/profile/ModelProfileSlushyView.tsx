"use client";

import Image from "next/image";
import Link from "next/link";
import { ApiAvatar } from "@/components/media/ApiAvatar";
import { useMemo, useState } from "react";
import { ChatWithModelCta } from "@/components/conversion/ChatWithModelCta";
import { ConversionSlideSheet } from "@/components/conversion/ConversionSlideSheet";
import { LikeActionButton } from "@/components/feed/LikeActionButton";
import { useDelayedConversionCta } from "@/hooks/useDelayedConversionCta";
import { ModelProfileDesktopView } from "@/components/profile/ModelProfileDesktopView";
import { useDesktopGatedAction } from "@/hooks/useDesktopGatedAction";
import type { ModelProfileView } from "@/lib/profile/modelProfile";
import type { RecommendedProfile } from "@/lib/profile/profilePresentation";

type ModelProfileSlushyViewProps = {
  model: ModelProfileView;
  seoIntro: string;
  recommended: RecommendedProfile[];
};

function countryFlag(code: string): string {
  if (!code || code.length !== 2) return "🌍";
  const upper = code.toUpperCase();
  return String.fromCodePoint(
    ...[...upper].map((c) => 0x1f1e6 + c.charCodeAt(0) - 65),
  );
}

function PrimaryCta({
  href,
  live,
  label,
  onGatedClick,
}: {
  href: string;
  live: boolean;
  label: string;
  onGatedClick: (e: React.MouseEvent<HTMLAnchorElement>) => void;
}) {
  if (!live) {
    return (
      <a
        href={href}
        target="_blank"
        rel="nofollow noopener"
        onClick={onGatedClick}
        className="flex w-full items-center justify-between rounded-full border border-white/15 bg-[#1C1C1E] px-5 py-4 text-base font-bold text-zinc-200 ring-1 ring-white/5 transition active:scale-[0.99]"
      >
        <span>Notify me when she&apos;s live</span>
        <span aria-hidden>🔔</span>
      </a>
    );
  }

  return (
    <a
      href={href}
      target="_blank"
      rel="nofollow noopener"
      onClick={onGatedClick}
      className="flex w-full items-center justify-between rounded-full bg-[#39FF14] px-5 py-4 text-base font-extrabold text-black shadow-[0_0_24px_rgba(57,255,20,0.35)] transition hover:bg-[#00FF7F] active:scale-[0.99]"
    >
      <span>{label}</span>
      <span aria-hidden>💬</span>
    </a>
  );
}

export function ModelProfileSlushyView({
  model,
  seoIntro,
  recommended,
}: ModelProfileSlushyViewProps) {
  const isLive = model.status === "live";
  const [activeTag, setActiveTag] = useState<string | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  const conversionReady = useDelayedConversionCta(true, 15_000);
  const { gateAnchorClick, runGated } = useDesktopGatedAction();
  const chatCtaLabel = `Chat with ${model.displayName}`;
  const likeKey = `profile-${model.profileSlug}`;

  const galleryTags = useMemo(() => {
    const set = new Set<string>();
    for (const item of model.galleryItems) {
      for (const tag of item.tags) set.add(tag);
    }
    return Array.from(set).slice(0, 10);
  }, [model.galleryItems]);

  const filteredGallery = useMemo(() => {
    if (!activeTag) return model.galleryItems;
    return model.galleryItems.filter((item) => item.tags.includes(activeTag));
  }, [activeTag, model.galleryItems]);

  const nextProfilePath =
    recommended.find((r) => r.slug !== model.profileSlug)?.profilePath ??
    recommended[0]?.profilePath ??
    "/explore";

  const openSheet = () => {
    runGated(() => setSheetOpen(true));
  };

  const gatedAffiliateClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    gateAnchorClick(e, model.affiliateUrl);
  };

  return (
    <>
      <ModelProfileDesktopView
        model={model}
        seoIntro={seoIntro}
        recommended={recommended}
      />
    <main className="min-h-screen bg-[#0A0A0A] pb-28 text-white lg:hidden">
      <ConversionSlideSheet
        open={sheetOpen}
        modelName={model.displayName}
        affiliateUrl={model.affiliateUrl}
        onClose={() => setSheetOpen(false)}
      />
      <div className="mx-auto max-w-md">
        <section className="relative">
          <div className="relative mx-3 mt-2 h-[min(68vh,520px)] overflow-hidden rounded-[28px] bg-[#1C1C1E] ring-1 ring-white/10">
            {model.bannerUrl?.trim() ? (
              <Image
                src={model.bannerUrl}
                alt={model.displayName}
                fill
                priority
                unoptimized
                sizes="100vw"
                className="object-cover"
              />
            ) : null}
            <div className="absolute inset-0 bg-gradient-to-b from-black/25 via-transparent to-[#0A0A0A]" />

            {isLive && (
              <span className="absolute left-4 top-4 rounded-full bg-[#39FF14] px-3 py-1 text-[11px] font-black tracking-wide text-black shadow-lg shadow-[#39FF14]/30">
                • LIVE
              </span>
            )}

            <div className="absolute right-3 top-16 flex flex-col gap-2">
              {model.badges.map((badge) => (
                <span
                  key={badge}
                  className={`rotate-2 rounded-xl px-3 py-1.5 text-[10px] font-black tracking-wide text-black shadow-lg ${
                    badge.includes("BEST")
                      ? "bg-orange-400"
                      : "bg-[#39FF14]"
                  }`}
                >
                  {badge}
                </span>
              ))}
            </div>
          </div>

          <div className="relative z-10 -mt-14 flex justify-center">
            <div className="relative h-28 w-28 overflow-hidden rounded-full border-4 border-[#0A0A0A] ring-2 ring-[#39FF14]/40">
              <ApiAvatar
                src={model.avatar}
                alt={model.name}
                fill
                className="object-cover"
                sizes="112px"
              />
            </div>
          </div>
        </section>

        <section className="px-5 pt-4 text-center">
          <h1 className="text-3xl font-black tracking-tight">
            {model.displayName}
          </h1>
          <p className="mt-1 text-sm font-semibold text-zinc-400">
            {model.handle.startsWith("@") ? model.handle : `@${model.handle}`}
          </p>

          <div className="mt-4 flex justify-center">
            <LikeActionButton feedKey={likeKey} />
          </div>

          <div className="mt-4 flex justify-center">
            <ChatWithModelCta
              modelName={model.displayName}
              affiliateUrl={model.affiliateUrl}
              visible={conversionReady}
            />
          </div>

          <p className="mt-4 text-sm leading-relaxed text-zinc-300">{model.bio}</p>
          <p className="mt-2 line-clamp-3 text-xs text-zinc-500">{seoIntro}</p>

          <div className="mt-5 flex flex-wrap items-center justify-center gap-5 text-xs text-zinc-300">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-[#1C1C1E] px-3 py-1.5 ring-1 ring-white/5">
              <span className="text-[#39FF14]">👤</span>
              {model.followersLabel} followers
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-[#1C1C1E] px-3 py-1.5 ring-1 ring-white/5">
              <span className="text-[#39FF14]">🛡️</span>
              Verified identity
            </span>
          </div>
        </section>

        <section className="space-y-3 px-4 pt-8">
          {conversionReady ? (
            <PrimaryCta
              href={model.affiliateUrl}
              live={isLive}
              label={chatCtaLabel}
              onGatedClick={gatedAffiliateClick}
            />
          ) : (
            <button
              type="button"
              onClick={openSheet}
              className="flex w-full items-center justify-between rounded-full border border-[#39FF14]/35 bg-[#1C1C1E] px-5 py-4 text-base font-bold text-zinc-200 ring-1 ring-white/5 transition active:scale-[0.99]"
            >
              <span>Chat unlocks in a moment…</span>
              <span aria-hidden>💬</span>
            </button>
          )}
          <button
            type="button"
            onClick={() => runGated(() => {})}
            className="flex w-full items-center justify-between rounded-full border border-white/10 bg-[#1C1C1E] px-5 py-4 text-sm font-semibold text-white ring-1 ring-white/5"
          >
            <span>Save to favorites</span>
            <span aria-hidden>🔖</span>
          </button>
        </section>

        <section className="px-4 pt-10">
          <h2 className="mb-4 text-center text-xs font-black tracking-[0.25em] text-[#39FF14]">
            ABOUT {model.displayName.toUpperCase()}
          </h2>
          <div className="grid grid-cols-2 gap-3">
            {model.aboutCards.map((card) => (
              <div
                key={card.label}
                className={`rounded-2xl bg-[#1C1C1E] p-4 ring-1 ring-white/5 ${
                  card.span === "full" ? "col-span-2" : ""
                }`}
              >
                <p className="text-[10px] font-semibold uppercase tracking-wide text-zinc-500">
                  {card.label}
                </p>
                <p className="mt-1.5 text-sm font-semibold text-white">
                  {card.value}
                </p>
              </div>
            ))}
          </div>
        </section>

        <section className="px-4 pt-10">
          <h2 className="text-center text-xs font-black tracking-[0.25em] text-white">
            PRIVATE GALLERY
          </h2>
          <p className="mt-2 text-center text-xs text-zinc-500">
            {model.galleryItems.length} posts ·{" "}
            {model.galleryItems.filter((g) => g.locked).length} locked
          </p>

          <div className="hide-scrollbar mt-4 flex gap-2 overflow-x-auto pb-2">
            <button
              type="button"
              onClick={() => setActiveTag(null)}
              className={`shrink-0 rounded-full px-4 py-2 text-xs font-bold ${
                activeTag === null
                  ? "bg-[#39FF14] text-black"
                  : "bg-[#1C1C1E] text-zinc-300 ring-1 ring-white/10"
              }`}
            >
              All
            </button>
            {galleryTags.map((tag) => (
              <button
                key={tag}
                type="button"
                onClick={() => setActiveTag(tag)}
                className={`shrink-0 rounded-full px-4 py-2 text-xs font-bold capitalize ${
                  activeTag === tag
                    ? "bg-[#39FF14] text-black"
                    : "bg-[#1C1C1E] text-zinc-300 ring-1 ring-white/10"
                }`}
              >
                {tag}
              </button>
            ))}
          </div>

          <div className="mt-4 grid grid-cols-3 gap-2">
            {filteredGallery.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => item.locked && openSheet()}
                className="relative aspect-[3/4] overflow-hidden rounded-[18px] bg-[#1C1C1E] ring-1 ring-white/5"
              >
                <Image
                  src={item.src}
                  alt=""
                  fill
                  unoptimized
                  className={`object-cover ${item.locked ? "blur-md brightness-50" : ""}`}
                  sizes="33vw"
                />
                {item.locked && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                    <span className="text-2xl" aria-hidden>🔒</span>
                  </div>
                )}
                <div className="absolute bottom-1.5 left-1.5 flex items-center gap-1 rounded-md bg-black/55 px-1.5 py-0.5 text-[10px] font-semibold">
                  <span aria-hidden>👁</span>
                  {item.viewsLabel}
                </div>
              </button>
            ))}
          </div>
        </section>

        {recommended.length > 0 && (
          <section className="px-4 pt-10">
            <h2 className="text-center text-xs font-black tracking-[0.25em] text-white">
              MORE LIVE NOW
            </h2>
            <div className="mt-4 flex gap-3 overflow-x-auto pb-2">
              {recommended.map((friend) => (
                <Link
                  key={friend.slug}
                  href={friend.profilePath}
                  className="relative w-36 shrink-0 overflow-hidden rounded-3xl bg-[#1C1C1E] ring-1 ring-white/5"
                >
                  <div className="relative aspect-[3/4] w-full">
                    <Image
                      src={friend.avatar}
                      alt={friend.name}
                      fill
                      unoptimized
                      className="object-cover"
                      sizes="144px"
                    />
                    {friend.live && (
                      <span className="absolute left-2 top-2 rounded-full bg-[#39FF14] px-2 py-0.5 text-[9px] font-black text-black">
                        LIVE
                      </span>
                    )}
                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black to-transparent p-2">
                      <p className="truncate text-xs font-bold">{friend.name}</p>
                      <p className="text-[10px] text-zinc-300">
                        {countryFlag(friend.countryCode)} {friend.countryCode}
                      </p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        <section className="px-4 pt-12 text-center">
          <div className="mx-auto mb-4 h-16 w-12 overflow-hidden rounded-xl bg-[#1C1C1E] ring-1 ring-white/10">
            <ApiAvatar
              src={model.avatar}
              alt={model.name}
              width={48}
              height={64}
              className="h-full w-full object-cover"
            />
          </div>
          <h3 className="text-sm font-black tracking-[0.15em]">
            YOU&apos;VE SEEN ALL OF {model.displayName}
          </h3>
          <p className="mt-2 text-xs leading-relaxed text-zinc-500">
            Liked {model.name}? Jump into her live chat or explore the next
            recommended model.
          </p>

          <div className="mt-6 space-y-3">
            <PrimaryCta
              href={model.affiliateUrl}
              live={isLive}
              label={chatCtaLabel}
              onGatedClick={gatedAffiliateClick}
            />
            <Link
              href={nextProfilePath}
              className="flex w-full items-center justify-between rounded-full border border-white/15 bg-transparent px-5 py-4 text-sm font-bold text-white transition hover:bg-white/5"
            >
              <span>Next profile</span>
              <span aria-hidden>→</span>
            </Link>
          </div>
        </section>
      </div>
    </main>
    </>
  );
}
