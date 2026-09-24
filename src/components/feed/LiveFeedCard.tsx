"use client";

import type { FeedPerformer } from "@/lib/feed/filterPerformers";
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
  audioUnlocked: boolean;
  isScrolling: boolean;
  onRegisterIframe: (win: Window | null) => void;
};

export function LiveFeedCard({
  performer,
  index,
  isActive,
  isArmed,
  audioUnlocked,
  isScrolling,
  onRegisterIframe,
}: LiveFeedCardProps) {
  return (
    <article
      className={`tele-card relative w-full shrink-0 snap-start overflow-hidden bg-black ${CARD_HEIGHT}`}
      data-index={index}
      aria-label={performerLabel(performer)}
    >
      <LiveEmbed
        embedKey={performer.feedKey}
        posterUrl={performer.posterUrl}
        isActive={isActive}
        isArmed={isArmed}
        audioUnlocked={audioUnlocked}
        isScrolling={isScrolling}
        onIframeWindow={isActive ? onRegisterIframe : undefined}
      />

      <div className="pointer-events-none absolute inset-0 z-[30] bg-gradient-to-b from-black/45 via-transparent to-black/75" />

      <div className="pointer-events-none absolute bottom-4 left-4 z-[35] flex flex-col gap-1">
        <span className="text-sm font-extrabold text-white drop-shadow-md">
          {performerLabel(performer)}
        </span>
        <span className="text-[10px] font-semibold uppercase tracking-widest text-pink-400">
          {isActive ? "En vivo · Streamate" : "Desliza"}
        </span>
      </div>
    </article>
  );
}
