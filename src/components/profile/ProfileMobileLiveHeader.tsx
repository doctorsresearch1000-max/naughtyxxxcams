"use client";

import { useCallback } from "react";
import Image from "next/image";
import { LiveEmbed } from "@/components/feed/LiveEmbed";
import { FeedViewportProvider } from "@/components/feed/FeedViewportContext";
import { SessionAudioProvider } from "@/components/feed/SessionAudioProvider";
import { ProfileStreamConversionOverlay } from "@/components/profile/ProfileStreamConversionOverlay";
import type { ModelProfileView } from "@/lib/profile/modelProfile";
import { useProfileStreamPlayer } from "@/lib/profile/useProfileStreamPlayer";
import { useMediaMinWidth } from "@/hooks/useMediaMinWidth";
import {
  camPlayerAudit,
  camPlayerAuditSince,
} from "@/lib/audit/camPlayerAudit";

const HEADER_HEIGHT_PX = 420;

type ProfileMobileLiveHeaderProps = {
  model: ModelProfileView;
};

export function ProfileMobileLiveHeader({ model }: ProfileMobileLiveHeaderProps) {
  const isDesktopViewport = useMediaMinWidth(1024);
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
            <div className="absolute inset-0 opacity-100">
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

      <div className="pointer-events-none absolute inset-0 z-[5] bg-gradient-to-b from-black/25 via-transparent to-[#0A0A0A]" />

      {catalogLive && !showConversionUi ? (
        <span className="pointer-events-none absolute left-4 top-4 z-20 rounded-full bg-[#39FF14] px-3 py-1 text-[11px] font-black tracking-wide text-black shadow-lg shadow-[#39FF14]/30">
          • LIVE
        </span>
      ) : null}
    </div>
  );
}
