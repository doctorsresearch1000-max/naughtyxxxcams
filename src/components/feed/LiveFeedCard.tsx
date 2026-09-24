"use client";

import type { FeedPerformer } from "@/lib/feed/filterPerformers";
import { useSessionAudio } from "@/components/feed/SessionAudioProvider";
import { FeedActionRail } from "@/components/feed/FeedActionRail";
import { LiveEmbed } from "./LiveEmbed";

const CARD_HEIGHT = "h-[calc(100dvh-4rem)]";

function performerLabel(p: FeedPerformer): string {
  const name = p.nameClean || p.name;
  return name ? `@${name.replace(/\s+/g, "")}` : "@modelo";
}

type LiveFeedCardProps = {
  performer: FeedPerformer;
  index: number;
  isActive: boolean;
  isArmed: boolean;
  isPlaying: boolean;
  onRegisterIframe: (win: Window | null) => void;
};

export function LiveFeedCard({
  performer,
  index,
  isActive,
  isArmed,
  isPlaying,
  onRegisterIframe,
}: LiveFeedCardProps) {
  const { muted, toggleMuted } = useSessionAudio();

  return (
    <article
      className={`tele-card relative w-full shrink-0 snap-start overflow-hidden bg-black ${CARD_HEIGHT}`}
      data-index={index}
      data-feed-key={performer.feedKey}
      aria-label={performerLabel(performer)}
    >
      <LiveEmbed
        embedKey={performer.feedKey}
        posterUrl={performer.posterUrl}
        isActive={isActive}
        isArmed={isArmed}
        isPlaying={isPlaying}
        onIframeWindow={isPlaying ? onRegisterIframe : undefined}
      />

      <div className="pointer-events-none absolute inset-0 z-[30] bg-gradient-to-b from-black/45 via-transparent to-black/75" />

      <div className="pointer-events-none absolute bottom-4 left-4 z-[35] max-w-[72%] flex flex-col gap-1">
        {isActive && (
          <div className="mb-1 flex max-w-[220px] items-center gap-2 rounded-full border border-white/10 bg-black/60 px-3 py-1 text-xs text-zinc-200 backdrop-blur-md">
            <span className="h-2 w-2 rounded-full bg-emerald-400" />
            <span className="truncate">deep_tipper: Estás hecha una diosa</span>
          </div>
        )}
        <span className="text-sm font-extrabold text-white drop-shadow-md">
          {performerLabel(performer)}
        </span>
        <span className="text-[10px] font-semibold uppercase tracking-widest text-pink-400">
          {isPlaying ? "En vivo · Streamate" : "Desliza · siguiente modelo"}
        </span>
      </div>

      <FeedActionRail
        feedKey={performer.feedKey}
        posterUrl={performer.posterUrl}
        isActive={isActive}
        muted={muted}
        onToggleMute={toggleMuted}
      />
    </article>
  );
}
