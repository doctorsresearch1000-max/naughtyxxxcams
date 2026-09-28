"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { LiveEmbed } from "@/components/feed/LiveEmbed";
import { FeedViewportProvider } from "@/components/feed/FeedViewportContext";
import { SessionAudioProvider } from "@/components/feed/SessionAudioProvider";
import { filterFeedPerformers } from "@/lib/feed/filterPerformers";
import type { ModelProfileView } from "@/lib/profile/modelProfile";
import { injectStreamPreconnects } from "@/lib/feed/streamEmbedWarmup";
import { warmPerformerStream } from "@/lib/feed/streamEmbedWarmup";

const HEADER_HEIGHT_PX = 420;

type ProfileMobileLiveHeaderProps = {
  model: ModelProfileView;
};

export function ProfileMobileLiveHeader({ model }: ProfileMobileLiveHeaderProps) {
  const feedPerformer = useMemo(() => {
    if (!model.performer) return null;
    const list = filterFeedPerformers([model.performer]);
    return list[0] ?? null;
  }, [model.performer]);

  const [armed, setArmed] = useState(false);

  useEffect(() => {
    injectStreamPreconnects();
    setArmed(true);
  }, []);

  useEffect(() => {
    if (!armed || !feedPerformer) return;
    warmPerformerStream(feedPerformer.feedKey, feedPerformer.embedPlan);
  }, [armed, feedPerformer]);

  const isLive = model.status === "live" && Boolean(feedPerformer);

  return (
    <div className="relative mx-3 mt-2 h-[min(68vh,520px)] overflow-hidden rounded-[28px] bg-[#1C1C1E] ring-1 ring-white/10">
      {isLive && feedPerformer ? (
        <SessionAudioProvider>
          <FeedViewportProvider heightPx={HEADER_HEIGHT_PX}>
            <div className="absolute inset-0">
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
              />
            </div>
          </FeedViewportProvider>
        </SessionAudioProvider>
      ) : model.bannerUrl?.trim() ? (
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

      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/25 via-transparent to-[#0A0A0A]" />

      {isLive ? (
        <span className="absolute left-4 top-4 z-10 rounded-full bg-[#39FF14] px-3 py-1 text-[11px] font-black tracking-wide text-black shadow-lg shadow-[#39FF14]/30">
          • LIVE
        </span>
      ) : null}
    </div>
  );
}
