"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { AffiliateOutboundLink } from "@/components/conversion/AffiliateOutboundLink";
import { LiveEmbed } from "@/components/feed/LiveEmbed";
import { FeedViewportProvider } from "@/components/feed/FeedViewportContext";
import { SessionAudioProvider } from "@/components/feed/SessionAudioProvider";
import { ProfilePlayerPosterFallback } from "@/components/profile/ProfilePlayerPosterFallback";
import { crackPerformerToFeedPerformer } from "@/lib/feed/filterPerformers";
import type { ModelProfileView } from "@/lib/profile/modelProfile";
import { openAffiliateOutbound } from "@/lib/crackrevenue/jerkmateAffiliate";
import {
  injectStreamPreconnects,
  warmPerformerStream,
} from "@/lib/feed/streamEmbedWarmup";

const HEADER_HEIGHT_PX = 420;
const STREAM_TIMEOUT_MS = 5_000;

type ProfileMobileLiveHeaderProps = {
  model: ModelProfileView;
};

type RevealPhase = "loading" | "playing" | "fallback";

export function ProfileMobileLiveHeader({ model }: ProfileMobileLiveHeaderProps) {
  const feedPerformer = useMemo(() => {
    if (!model.performer) return null;
    const row = crackPerformerToFeedPerformer(model.performer, {
      requirePoster: false,
    });
    if (!row) return null;
    if (row.posterUrl) return row;
    const fallback =
      model.bannerUrl?.trim() || model.avatar?.trim() || "";
    return fallback ? { ...row, posterUrl: fallback } : row;
  }, [model.performer, model.bannerUrl, model.avatar]);

  const [armed, setArmed] = useState(false);
  const [phase, setPhase] = useState<RevealPhase>("loading");

  const posterUrl =
    feedPerformer?.posterUrl ||
    model.bannerUrl ||
    model.avatar ||
    "";

  const catalogLive = model.status === "live";
  const canMountStream = catalogLive && Boolean(feedPerformer);

  const openAffiliate = useCallback(() => {
    openAffiliateOutbound(model.affiliateUrl);
  }, [model.affiliateUrl]);

  useEffect(() => {
    injectStreamPreconnects();
    setArmed(true);
    try {
      const raw = sessionStorage.getItem("nx-last-warm-feed-key");
      if (!raw || !feedPerformer) return;
      const parsed = JSON.parse(raw) as { feedKey?: string; at?: number };
      if (
        parsed.feedKey === feedPerformer.feedKey &&
        typeof parsed.at === "number" &&
        Date.now() - parsed.at < 120_000
      ) {
        warmPerformerStream(feedPerformer.feedKey, feedPerformer.embedPlan, {
          pin: true,
        });
      }
    } catch {
      /* ignore */
    }
  }, [feedPerformer]);

  useEffect(() => {
    if (!armed || !feedPerformer) return;
    warmPerformerStream(feedPerformer.feedKey, feedPerformer.embedPlan, {
      pin: true,
    });
  }, [armed, feedPerformer]);

  useEffect(() => {
    setPhase("loading");
  }, [feedPerformer?.feedKey, catalogLive]);

  useEffect(() => {
    if (!canMountStream || phase !== "loading") return;
    const id = window.setTimeout(() => {
      setPhase((current) => (current === "loading" ? "fallback" : current));
    }, STREAM_TIMEOUT_MS);
    return () => window.clearTimeout(id);
  }, [canMountStream, phase, feedPerformer?.feedKey]);

  const handleStreamRevealed = useCallback(() => {
    setPhase("playing");
  }, []);

  const handleStreamDisconnected = useCallback(() => {
    setPhase("fallback");
  }, []);

  const showOverlay = canMountStream && phase !== "playing";
  const showFallbackCta = phase === "fallback" && catalogLive;

  return (
    <div
      className="relative mx-3 mt-2 h-[min(68vh,520px)] overflow-hidden rounded-[28px] bg-[#1C1C1E] ring-1 ring-white/10"
    >
      {canMountStream && feedPerformer ? (
        <SessionAudioProvider>
          <FeedViewportProvider heightPx={HEADER_HEIGHT_PX}>
            <div
              className={`absolute inset-0 transition-opacity duration-500 ${
                phase === "playing" ? "opacity-100" : "opacity-0"
              }`}
            >
              <LiveEmbed
                embedKey={feedPerformer.feedKey}
                posterUrl={feedPerformer.posterUrl}
                embedPlan={feedPerformer.embedPlan}
                isActive
                isArmed={armed}
                sessionMuted
                viewportHeightPx={HEADER_HEIGHT_PX}
                fastReveal
                iframeLoading="eager"
                streamPriority="high"
                externalPosterControl
                posterFallbackMaxMs={STREAM_TIMEOUT_MS}
                onStreamRevealed={handleStreamRevealed}
                onStreamDisconnected={handleStreamDisconnected}
              />
            </div>
          </FeedViewportProvider>
        </SessionAudioProvider>
      ) : (
        <ProfilePlayerPosterFallback
          posterUrl={posterUrl}
          displayName={model.displayName}
          affiliateUrl={model.affiliateUrl}
          live={catalogLive}
          className="absolute inset-0"
        />
      )}

      {canMountStream && showOverlay ? (
        <div
          className="absolute inset-0 z-10 flex flex-col items-center justify-center transition-opacity duration-500"
          aria-busy={phase === "loading"}
        >
          {posterUrl ? (
            <Image
              src={posterUrl}
              alt=""
              fill
              priority
              unoptimized
              sizes="100vw"
              className="object-cover"
              aria-hidden
            />
          ) : null}
          <div className="absolute inset-0 bg-black/35" />

          {phase === "loading" ? (
            <div
              className="relative z-10 flex flex-col items-center gap-3"
              role="status"
              aria-label="Loading live stream"
            >
              <div
                className="h-9 w-9 animate-spin rounded-full border-2 border-[#39FF14]/25 border-t-[#39FF14]"
              />
              <span className="text-[11px] font-semibold text-zinc-200">
                Connecting live…
              </span>
            </div>
          ) : null}

          {showFallbackCta ? (
            <div className="relative z-10 w-[min(100%,280px)] px-4">
              <AffiliateOutboundLink
                href={model.affiliateUrl}
                className="flex w-full items-center justify-center rounded-full bg-[#39FF14] px-5 py-3.5 text-sm font-extrabold text-black shadow-[0_0_24px_rgba(57,255,20,0.35)]"
              >
                Enter show / Chat
              </AffiliateOutboundLink>
              <p className="mt-2 text-center text-[10px] text-zinc-300">
                Stream unavailable — open the room directly
              </p>
            </div>
          ) : null}
        </div>
      ) : null}

      {catalogLive ? (
        <button
          type="button"
          className="absolute inset-0 z-[12] cursor-pointer bg-transparent"
          aria-label="Open live room in new tab"
          onClick={openAffiliate}
        />
      ) : null}

      <div className="pointer-events-none absolute inset-0 z-[5] bg-gradient-to-b from-black/25 via-transparent to-[#0A0A0A]" />

      {catalogLive ? (
        <span className="pointer-events-none absolute left-4 top-4 z-20 rounded-full bg-[#39FF14] px-3 py-1 text-[11px] font-black tracking-wide text-black shadow-lg shadow-[#39FF14]/30">
          • LIVE
        </span>
      ) : null}
    </div>
  );
}
