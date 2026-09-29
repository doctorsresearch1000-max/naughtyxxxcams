"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { LiveEmbed } from "@/components/feed/LiveEmbed";
import { FeedViewportProvider } from "@/components/feed/FeedViewportContext";
import { SessionAudioProvider } from "@/components/feed/SessionAudioProvider";
import { ProfileConversionBadges } from "@/components/profile/ProfileConversionBadges";
import { ProfileStreamConversionOverlay } from "@/components/profile/ProfileStreamConversionOverlay";
import type { ModelProfileView } from "@/lib/profile/modelProfile";
import { useProfileStreamPlayer } from "@/lib/profile/useProfileStreamPlayer";
import { useMediaMinWidth } from "@/hooks/useMediaMinWidth";
import {
  camPlayerAudit,
  camPlayerAuditSince,
} from "@/lib/audit/camPlayerAudit";

/** Fallback until ResizeObserver reports the compact 16:9 box. */
const PROFILE_MOBILE_STAGE_FALLBACK_PX = 300;

type ProfileMobileLiveHeaderProps = {
  model: ModelProfileView;
};

export function ProfileMobileLiveHeader({ model }: ProfileMobileLiveHeaderProps) {
  const isDesktopViewport = useMediaMinWidth(1024);
  const stageRef = useRef<HTMLDivElement>(null);
  const [stageHeightPx, setStageHeightPx] = useState(
    PROFILE_MOBILE_STAGE_FALLBACK_PX,
  );

  const {
    catalogLive,
    feedPerformer,
    posterUrl,
    showConversionUi,
    armed,
    onFrameDocumentLoad,
    onStreamDisconnected,
  } = useProfileStreamPlayer(model, "mobile");

  const canMountStream =
    !isDesktopViewport && catalogLive && Boolean(feedPerformer);

  useEffect(() => {
    const el = stageRef.current;
    if (!el || isDesktopViewport) return;

    const measure = () => {
      const h = Math.round(el.getBoundingClientRect().height);
      if (h > 0) setStageHeightPx(h);
    };

    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    window.addEventListener("resize", measure);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, [isDesktopViewport]);

  const onPosterError = useCallback(() => {
    camPlayerAudit("poster.error", {
      slug: model.profileSlug,
      posterUrl,
    });
  }, [model.profileSlug, posterUrl]);

  const onPosterLoad = useCallback(() => {
    camPlayerAuditSince(`profile-mobile:${model.profileSlug}`, "poster.loaded", {
      posterUrl,
    });
  }, [model.profileSlug, posterUrl]);

  return (
    <div
      ref={stageRef}
      className="relative mx-3 mt-2 w-[calc(100%-1.5rem)] max-h-[min(44vh,352px)] aspect-video overflow-hidden rounded-[24px] bg-[#0A0A0A] ring-1 ring-white/10"
    >
      {posterUrl ? (
        <Image
          src={posterUrl}
          alt={model.displayName}
          fill
          priority
          unoptimized
          sizes="100vw"
          className="object-cover object-center"
          onLoad={onPosterLoad}
          onError={onPosterError}
        />
      ) : null}

      {canMountStream && feedPerformer ? (
        <SessionAudioProvider>
          <FeedViewportProvider heightPx={stageHeightPx}>
            <div className="absolute inset-0">
              <LiveEmbed
                embedKey={feedPerformer.feedKey}
                posterUrl={feedPerformer.posterUrl}
                embedPlan={feedPerformer.embedPlan}
                isActive
                isArmed={armed}
                sessionMuted
                viewportHeightPx={stageHeightPx}
                fastReveal
                iframeLoading="eager"
                streamPriority="high"
                onFrameDocumentLoad={onFrameDocumentLoad}
                onStreamDisconnected={onStreamDisconnected}
              />
            </div>
          </FeedViewportProvider>
        </SessionAudioProvider>
      ) : null}

      {showConversionUi ? (
        <ProfileStreamConversionOverlay
          affiliateUrl={model.affiliateUrl}
          loading={false}
        />
      ) : null}

      <ProfileConversionBadges
        affiliateUrl={model.affiliateUrl}
        className="pointer-events-auto absolute right-2.5 top-2.5 z-30 max-w-[min(100%-5rem,200px)]"
      />

      <div className="pointer-events-none absolute inset-0 z-[5] bg-gradient-to-b from-black/20 via-transparent to-black/50" />

      {catalogLive && !showConversionUi ? (
        <span className="pointer-events-none absolute left-2.5 top-2.5 z-20 rounded-full bg-[#39FF14] px-2.5 py-0.5 text-[10px] font-black tracking-wide text-black shadow-lg shadow-[#39FF14]/30">
          • LIVE
        </span>
      ) : null}
    </div>
  );
}
