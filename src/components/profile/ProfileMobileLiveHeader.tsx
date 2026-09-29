"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { LiveEmbed } from "@/components/feed/LiveEmbed";
import { FeedViewportProvider } from "@/components/feed/FeedViewportContext";
import { SessionAudioProvider } from "@/components/feed/SessionAudioProvider";
import { ProfileStreamConversionOverlay } from "@/components/profile/ProfileStreamConversionOverlay";
import { crackPerformerToFeedPerformer } from "@/lib/feed/filterPerformers";
import type { ModelProfileView } from "@/lib/profile/modelProfile";
import {
  camPlayerAudit,
  camPlayerAuditMark,
  camPlayerAuditSince,
} from "@/lib/audit/camPlayerAudit";
import {
  injectStreamPreconnects,
  warmPerformerStream,
} from "@/lib/feed/streamEmbedWarmup";

const HEADER_HEIGHT_PX = 420;
const STREAM_TIMEOUT_MS = 5_000;

type ProfileMobileLiveHeaderProps = {
  model: ModelProfileView;
};

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
  const [iframeLoaded, setIframeLoaded] = useState(false);
  const [disconnected, setDisconnected] = useState(false);
  const [loadTimedOut, setLoadTimedOut] = useState(false);

  const posterUrl =
    feedPerformer?.posterUrl ||
    model.bannerUrl ||
    model.avatar ||
    "";

  const catalogLive = model.status === "live";
  const canMountStream = catalogLive && Boolean(feedPerformer);

  const needsConversion =
    !catalogLive ||
    !feedPerformer ||
    disconnected ||
    loadTimedOut;

  const showStreamLayer =
    canMountStream && iframeLoaded && !disconnected && !loadTimedOut;

  const showLoadingOverlay =
    canMountStream && !iframeLoaded && !loadTimedOut && !disconnected;

  const showConversionUi = needsConversion || showLoadingOverlay;

  useEffect(() => {
    camPlayerAuditMark(`profile:${model.profileSlug}`);
    camPlayerAudit("profile.mount", {
      slug: model.profileSlug,
      catalogLive,
      canMountStream,
      embedMode: feedPerformer?.embedPlan.mode,
    });
  }, [model.profileSlug, catalogLive, canMountStream, feedPerformer?.embedPlan.mode]);

  useEffect(() => {
    injectStreamPreconnects();
    setArmed(true);
    setIframeLoaded(false);
    setDisconnected(false);
    setLoadTimedOut(false);
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
    if (!canMountStream) return;
    const id = window.setTimeout(() => {
      if (!iframeLoaded) {
        setLoadTimedOut(true);
        camPlayerAuditSince(`profile:${model.profileSlug}`, "iframe.timeout", {
          feedKey: feedPerformer?.feedKey,
          msBudget: STREAM_TIMEOUT_MS,
        });
      }
    }, STREAM_TIMEOUT_MS);
    return () => window.clearTimeout(id);
  }, [
    canMountStream,
    iframeLoaded,
    feedPerformer?.feedKey,
    model.profileSlug,
  ]);

  const handleFrameDocumentLoad = useCallback(() => {
    setIframeLoaded(true);
    camPlayerAuditSince(`profile:${model.profileSlug}`, "iframe.documentLoad", {
      feedKey: feedPerformer?.feedKey,
    });
  }, [feedPerformer?.feedKey, model.profileSlug]);

  const handleStreamDisconnected = useCallback(
    (reason: string) => {
      setDisconnected(true);
      camPlayerAudit("pure.SM_DISCONNECTED", {
        slug: model.profileSlug,
        feedKey: feedPerformer?.feedKey,
        reason,
      });
    },
    [feedPerformer?.feedKey, model.profileSlug],
  );

  const onPosterError = useCallback(() => {
    camPlayerAudit("poster.error", {
      slug: model.profileSlug,
      posterUrl,
    });
  }, [model.profileSlug, posterUrl]);

  const onPosterLoad = useCallback(() => {
    camPlayerAuditSince(`profile:${model.profileSlug}`, "poster.loaded", {
      posterUrl,
    });
  }, [model.profileSlug, posterUrl]);

  return (
    <div
      className="relative mx-3 mt-2 h-[min(68vh,520px)] overflow-hidden rounded-[28px] bg-[#1C1C1E] ring-1 ring-white/10"
    >
      {posterUrl ? (
        <Image
          src={posterUrl}
          alt={model.displayName}
          fill
          priority
          unoptimized
          sizes="100vw"
          className="object-cover"
          onLoad={onPosterLoad}
          onError={onPosterError}
        />
      ) : null}

      {canMountStream && feedPerformer ? (
        <SessionAudioProvider>
          <FeedViewportProvider heightPx={HEADER_HEIGHT_PX}>
            <div
              className={`absolute inset-0 transition-opacity duration-500 ${
                showStreamLayer ? "opacity-100" : "opacity-0"
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
                onFrameDocumentLoad={handleFrameDocumentLoad}
                onStreamDisconnected={handleStreamDisconnected}
              />
            </div>
          </FeedViewportProvider>
        </SessionAudioProvider>
      ) : null}

      {showConversionUi ? (
        <ProfileStreamConversionOverlay
          affiliateUrl={model.affiliateUrl}
          loading={showLoadingOverlay && !needsConversion}
        />
      ) : null}

      <div className="pointer-events-none absolute inset-0 z-[5] bg-gradient-to-b from-black/25 via-transparent to-[#0A0A0A]" />

      {catalogLive && !showConversionUi ? (
        <span className="pointer-events-none absolute left-4 top-4 z-20 rounded-full bg-[#39FF14] px-3 py-1 text-[11px] font-black tracking-wide text-black shadow-lg shadow-[#39FF14]/30">
          • LIVE
        </span>
      ) : null}
    </div>
  );
}
