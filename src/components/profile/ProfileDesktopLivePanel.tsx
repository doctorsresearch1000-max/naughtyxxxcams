"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { ProfileStreamConversionOverlay } from "@/components/profile/ProfileStreamConversionOverlay";
import type { ModelProfileView } from "@/lib/profile/modelProfile";
import { useProfileStreamPlayer } from "@/lib/profile/useProfileStreamPlayer";
import { PROFILE_STREAM_IFRAME_TIMEOUT_MS } from "@/lib/profile/profileStreamTiming";
import { LiveEmbed } from "@/components/feed/LiveEmbed";

type ProfileDesktopLivePanelProps = {
  model: ModelProfileView;
};

export function ProfileDesktopLivePanel({ model }: ProfileDesktopLivePanelProps) {
  const {
    catalogLive,
    feedPerformer,
    posterUrl,
    showStreamLayer,
    showConversionUi,
    showLoadingOverlay,
    needsHardConversion,
    armed,
    onFrameDocumentLoad,
    onStreamDisconnected,
  } = useProfileStreamPlayer(model, "desktop");

  const canMountStream = catalogLive && Boolean(feedPerformer);
  const [heightPx, setHeightPx] = useState(640);

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
          isArmed={armed}
          sessionMuted
          viewportHeightPx={heightPx}
          fastReveal
          iframeLoading="eager"
          streamPriority="high"
          externalPosterControl
          posterFallbackMaxMs={PROFILE_STREAM_IFRAME_TIMEOUT_MS}
          onFrameDocumentLoad={onFrameDocumentLoad}
          onStreamDisconnected={onStreamDisconnected}
        />
      </div>

      {showConversionUi ? (
        <ProfileStreamConversionOverlay
          affiliateUrl={model.affiliateUrl}
          loading={showLoadingOverlay && !needsHardConversion}
        />
      ) : null}
    </div>
  );
}
