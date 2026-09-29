"use client";

import Image from "next/image";
import Link from "next/link";
import { ApiAvatar } from "@/components/media/ApiAvatar";
import { useEffect, useMemo, useRef, useState } from "react";
import { AffiliateOutboundLink } from "@/components/conversion/AffiliateOutboundLink";
import { ConversionSlideSheet } from "@/components/conversion/ConversionSlideSheet";
import { LikeActionButton } from "@/components/feed/LikeActionButton";
import { useConversionAttentionPulse } from "@/hooks/useConversionAttentionPulse";
import { ModelProfileDesktopView } from "@/components/profile/ModelProfileDesktopView";
import { ProfileMobileLiveHeader } from "@/components/profile/ProfileMobileLiveHeader";
import { ProfileStickyCta } from "@/components/profile/ProfileStickyCta";
import { ProfileFaqSection } from "@/components/profile/ProfileFaqSection";
import { ProfileSeoContentBlock } from "@/components/profile/ProfileSeoContentBlock";
import { LiveBadge } from "@/components/cams/LiveBadge";
import { trackCtaClickOut, trackModelPageView } from "@/lib/analytics/track";
import { affiliateClaims } from "@/copy/model-page";
import { uiStrings } from "@/lib/i18n/uiStrings";
import { profileFollowersLabel } from "@/lib/profile/followersDisplay";
import { SaveToFavoritesButton } from "@/components/profile/SaveToFavoritesButton";
import { savedModelRefFromProfile } from "@/lib/user/savedModelRef";
import type { ModelProfileView } from "@/lib/profile/modelProfile";
import type { GeneratedProfileSEO } from "@/lib/profile/seoContent";
import type { RecommendedProfile } from "@/lib/profile/profilePresentation";

type ModelProfileSlushyViewProps = {
  model: ModelProfileView;
  seo: GeneratedProfileSEO;
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
  attentionPulse = false,
  onTrack,
}: {
  href: string;
  live: boolean;
  label: string;
  attentionPulse?: boolean;
  onTrack?: () => void;
}) {
  const pulseClass =
    attentionPulse && live
      ? "animate-[cta-glow_1.8s_ease-in-out_infinite] ring-2 ring-[#39FF14]/55"
      : "";

  if (!live) {
    return (
      <AffiliateOutboundLink
        href={href}
        className="flex w-full items-center justify-between rounded-full border border-white/15 bg-[#1C1C1E] px-5 py-4 text-base font-bold text-zinc-200 ring-1 ring-white/5 transition active:scale-[0.99]"
      >
        <span>Notify me when she&apos;s live</span>
        <span aria-hidden>🔔</span>
      </AffiliateOutboundLink>
    );
  }

  return (
    <AffiliateOutboundLink
      href={href}
      onClick={onTrack}
      className={`flex w-full items-center justify-between rounded-full bg-[var(--nx-action)] px-5 py-4 text-base font-extrabold text-black shadow-[0_0_24px_rgba(57,255,20,0.35)] transition hover:bg-[var(--nx-action-hover)] active:scale-[0.99] ${pulseClass}`}
    >
      <span>{label}</span>
      <span aria-hidden>💬</span>
    </AffiliateOutboundLink>
  );
}

export function ModelProfileSlushyView({
  model,
  seo,
  recommended,
}: ModelProfileSlushyViewProps) {
  const isLive = model.status === "live";
  const [activeTag, setActiveTag] = useState<string | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  const conversionAttentionPulse = useConversionAttentionPulse(true);
  const likeKey = `profile-${model.profileSlug}`;
  const primaryCtaRef = useRef<HTMLDivElement>(null);
  const followersCount = profileFollowersLabel();
  const liveCtaLabel = uiStrings.watchLiveCta(model.name);

  useEffect(() => {
    trackModelPageView(model.profileSlug);
  }, [model.profileSlug]);

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

  const libraryRef = useMemo(
    () => savedModelRefFromProfile(model),
    [model],
  );

  const nextProfilePath =
    recommended.find((r) => r.slug !== model.profileSlug)?.profilePath ??
    recommended[0]?.profilePath ??
    "/explore";

  const openSheet = () => setSheetOpen(true);

  return (
    <>
      <ModelProfileDesktopView
        model={model}
        seo={seo}
        recommended={recommended}
        conversionAttentionPulse={conversionAttentionPulse}
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
          <ProfileMobileLiveHeader model={model} />

          <div className="relative z-10 -mt-11 flex justify-center">
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
          <h1 className="text-2xl font-black leading-tight tracking-tight">
            {seo.landerH1}
          </h1>
          <p className="mt-1 text-sm font-semibold text-zinc-400">
            {model.handle.startsWith("@") ? model.handle : `@${model.handle}`}
          </p>

          <div className="mt-3 flex justify-center">
            <LikeActionButton
              feedKey={likeKey}
              displayCountLabel={followersCount}
            />
          </div>
        </section>

        <section className="space-y-2 px-4 pt-4">
          <div ref={primaryCtaRef}>
            <PrimaryCta
              href={model.affiliateUrl}
              live={isLive}
              label={liveCtaLabel}
              attentionPulse={conversionAttentionPulse}
              onTrack={() => trackCtaClickOut("primary", model.profileSlug)}
            />
          </div>
          <p className="text-center text-[11px] text-zinc-500">
            {affiliateClaims.verifiedProfile}
          </p>
        </section>

        <section className="px-5 pt-4 text-center">
          <p className="text-sm leading-relaxed text-zinc-300">{model.bio}</p>
        </section>

        <section className="px-4 pt-3">
          <div className="nx-chip-scroll hide-scrollbar flex gap-2 overflow-x-auto pb-1">
            <span className="shrink-0 rounded-full bg-[#1C1C1E] px-3 py-1.5 text-xs text-zinc-300 ring-1 ring-white/5">
              {followersCount}
            </span>
            <span className="shrink-0 rounded-full bg-[#1C1C1E] px-3 py-1.5 text-xs text-zinc-300 ring-1 ring-white/5">
              {model.language}
            </span>
            <span className="shrink-0 rounded-full bg-[#1C1C1E] px-3 py-1.5 text-xs text-zinc-300 ring-1 ring-white/5">
              {countryFlag(model.country)} {model.country}
            </span>
          </div>
        </section>

        <section className="px-4 pt-4">
          <SaveToFavoritesButton modelRef={libraryRef} />
        </section>

        <section className="px-4 pt-8">
          <h2 className="mb-3 text-center text-xs font-black tracking-[0.2em] text-white">
            {uiStrings.gallery}
          </h2>

          {model.galleryItems.length >= 8 && galleryTags.length > 0 ? (
            <div className="nx-chip-scroll hide-scrollbar mb-3 flex gap-2 overflow-x-auto pb-2">
              <button
                type="button"
                onClick={() => setActiveTag(null)}
                className={`shrink-0 rounded-full px-4 py-2 text-xs font-bold ${
                  activeTag === null
                    ? "bg-[var(--nx-action)] text-black"
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
                      ? "bg-[var(--nx-action)] text-black"
                      : "bg-[#1C1C1E] text-zinc-300 ring-1 ring-white/10"
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>
          ) : null}

          <div className="grid grid-cols-3 gap-2">
            {filteredGallery.map((item, index) => (
              <button
                key={item.id}
                type="button"
                onClick={() =>
                  item.locked ? openSheet() : window.open(model.affiliateUrl, "_blank")
                }
                className="relative aspect-[3/4] overflow-hidden rounded-[18px] bg-[#1C1C1E] ring-1 ring-white/5"
              >
                <Image
                  src={item.src}
                  alt=""
                  fill
                  unoptimized
                  loading={index === 0 ? "eager" : "lazy"}
                  className={`object-cover ${item.locked ? "blur-md brightness-50" : ""}`}
                  sizes="33vw"
                />
                {item.locked ? (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                    <span className="text-2xl" aria-hidden>🔒</span>
                  </div>
                ) : null}
              </button>
            ))}
          </div>
        </section>

        {recommended.length > 0 && (
          <section className="px-4 pt-10">
            <h2 className="text-center text-xs font-black tracking-[0.2em] text-white">
              {uiStrings.moreLiveNow}
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
                      loading="lazy"
                      className="object-cover"
                      sizes="144px"
                    />
                    {friend.live ? (
                      <span className="absolute left-2 top-2">
                        <LiveBadge />
                      </span>
                    ) : null}
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

        <section className="px-4 pt-8">
          <h2 className="mb-4 text-center text-xs font-black tracking-[0.2em] text-[var(--nx-action)]">
            About {model.displayName}
          </h2>
          <div className="grid grid-cols-2 gap-3">
            {model.aboutCards
              .filter((card) => card.value && card.value !== "—")
              .map((card) => (
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

        <section className="space-y-4 px-4 pt-8">
          <ProfileSeoContentBlock seo={seo} />
          <ProfileFaqSection items={seo.faqItems} />
        </section>

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
              label={liveCtaLabel}
              onTrack={() => trackCtaClickOut("end_card", model.profileSlug)}
            />
            <Link
              href={nextProfilePath}
              className="flex w-full items-center justify-between rounded-full border border-white/15 bg-transparent px-5 py-4 text-sm font-bold text-white transition hover:bg-white/5"
            >
              <span>{uiStrings.nextProfile}</span>
              <span aria-hidden>→</span>
            </Link>
          </div>
        </section>
      </div>

      <ProfileStickyCta
        href={model.affiliateUrl}
        live={isLive}
        modelName={model.name}
        profileSlug={model.profileSlug}
        primaryCtaRef={primaryCtaRef}
      />
    </main>
    </>
  );
}
