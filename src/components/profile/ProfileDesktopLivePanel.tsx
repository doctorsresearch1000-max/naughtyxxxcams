"use client";

import Image from "next/image";
import { useCallback, useEffect, useState } from "react";
import { ProfileStreamConversionOverlay } from "@/components/profile/ProfileStreamConversionOverlay";
import type { FeedPerformer } from "@/lib/feed/filterPerformers";
import type { ModelProfileView } from "@/lib/profile/modelProfile";
import {
  camPlayerAudit,
  camPlayerAuditMark,
  camPlayerAuditSince,
} from "@/lib/audit/camPlayerAudit";
import { LiveEmbed } from "@/components/feed/LiveEmbed";

const STREAM_TIMEOUT_MS = 5_000;

type ProfileDesktopLivePanelProps = {
  model: ModelProfileView;
  feedPerformer: FeedPerformer | null;
  posterUrl: string;
};

export function ProfileDesktopLivePanel({
  model,
  feedPerformer,
  posterUrl,
}: ProfileDesktopLivePanelProps) {
  const catalogLive = model.status === "live";
  const canMountStream = catalogLive && Boolean(feedPerformer);

  const [iframeLoaded, setIframeLoaded] = useState(false);
  const [disconnected, setDisconnected] = useState(false);
  const [loadTimedOut, setLoadTimedOut] = useState(false);
  const [heightPx, setHeightPx] = useState(640);

  const needsConversion =
    !catalogLive || !feedPerformer || disconnected || loadTimedOut;

  const showStreamLayer =
    canMountStream && iframeLoaded && !disconnected && !loadTimedOut;

  const showLoadingOverlay =
    canMountStream && !iframeLoaded && !loadTimedOut && !disconnected;

  const showConversionUi = needsConversion || showLoadingOverlay;

  useEffect(() => {
    camPlayerAuditMark(`profile-desktop:${model.profileSlug}`);
  }, [model.profileSlug]);

  useEffect(() => {
    setIframeLoaded(false);
    setDisconnected(false);
    setLoadTimedOut(false);
  }, [feedPerformer?.feedKey, catalogLive]);

  useEffect(() => {
    if (!canMountStream) return;
    const id = window.setTimeout(() => {
      if (!iframeLoaded) {
        setLoadTimedOut(true);
        camPlayerAuditSince(
          `profile-desktop:${model.profileSlug}`,
          "iframe.timeout",
          { feedKey: feedPerformer?.feedKey },
        );
      }
    }, STREAM_TIMEOUT_MS);
    return () => window.clearTimeout(id);
  }, [canMountStream, iframeLoaded, feedPerformer?.feedKey, model.profileSlug]);

  const handleFrameDocumentLoad = useCallback(() => {
    setIframeLoaded(true);
    camPlayerAuditSince(
      `profile-desktop:${model.profileSlug}`,
      "iframe.documentLoad",
      { feedKey: feedPerformer?.feedKey },
    );
  }, [feedPerformer?.feedKey, model.profileSlug]);

  const handleStreamDisconnected = useCallback(
    (reason: string) => {
      setDisconnected(true);
      camPlayerAudit("pure.SM_DISCONNECTED", {
        slug: model.profileSlug,
        surface: "desktop",
        reason,
      });
    },
    [model.profileSlug],
  );

  useEffect(() => {
    const update = () => {
      setHeightPx(Math.min(Math.max(window.innerHeight * 0.65, 480), 820));
    };
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  if (!canMountStream) {
    return (
      <div className="relative h-full min-h-[480px] w-full overflow-hidden bg-black">
        {posterUrl ? (
          <Image
            src={posterUrl}
            alt={model.displayName}
            fill
            unoptimized
            className="object-cover"
            sizes="(max-width: 1600px) 80vw"
          />
        ) : null}
        <ProfileStreamConversionOverlay
          affiliateUrl={model.affiliateUrl}
          loading={false}
        />
      </div>
    );
  }

  return (
    <div className="relative h-full min-h-[480px] w-full overflow-hidden bg-black">
      {posterUrl ? (
        <Image
          src={posterUrl}
          alt=""
          fill
          unoptimized
          className="object-cover"
          sizes="(max-width: 1600px) 80vw"
          aria-hidden
        />
      ) : null}

      <div
        className={`absolute inset-0 transition-opacity duration-500 ${
          showStreamLayer ? "opacity-100" : "opacity-0"
        }`}
      >
        <LiveEmbed
          embedKey={feedPerformer!.feedKey}
          posterUrl={feedPerformer!.posterUrl}
          embedPlan={feedPerformer!.embedPlan}
          isActive
          isArmed
          sessionMuted
          viewportHeightPx={heightPx}
          fastReveal
          iframeLoading="eager"
          streamPriority="high"
          externalPosterControl
          posterFallbackMaxMs={STREAM_TIMEOUT_MS}
          onFrameDocumentLoad={handleFrameDocumentLoad}
          onStreamDisconnected={handleStreamDisconnected}
        />
      </div>

      {showConversionUi ? (
        <ProfileStreamConversionOverlay
          affiliateUrl={model.affiliateUrl}
          loading={showLoadingOverlay && !needsConversion}
        />
      ) : null}
    </div>
  );
}
