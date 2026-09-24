"use client";

import type { FeedPerformer } from "@/lib/feed/filterPerformers";
import { useSessionAudio } from "@/components/feed/SessionAudioProvider";
import { FeedPoster } from "@/components/feed/FeedPoster";
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
  streamRevealed: boolean;
  onRevealStream: () => void;
  onRegisterIframe: (win: Window | null) => void;
};

export function LiveFeedCard({
  performer,
  index,
  isActive,
  isArmed,
  streamRevealed,
  onRevealStream,
  onRegisterIframe,
}: LiveFeedCardProps) {
  const { muted, toggleMuted, setOverlayGate } = useSessionAudio();

  const handleReveal = () => {
    onRevealStream();
    setOverlayGate(true);
  };

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
        streamRevealed={streamRevealed}
        onIframeWindow={isActive && streamRevealed ? onRegisterIframe : undefined}
      />

      <div className="pointer-events-none absolute inset-0 z-[30] bg-gradient-to-b from-black/45 via-transparent to-black/75" />

      <div className="pointer-events-none absolute bottom-4 left-4 z-[35] max-w-[70%] flex flex-col gap-1">
        <span className="text-sm font-extrabold text-white drop-shadow-md">
          {performerLabel(performer)}
        </span>
        <span className="text-[10px] font-semibold uppercase tracking-widest text-pink-400">
          {streamRevealed && isActive
            ? "Vista previa · Streamate"
            : "Desliza · siguiente modelo"}
        </span>
      </div>

      <div className="pointer-events-none absolute bottom-0 right-0 top-0 z-[40] w-[5rem]">
        <div className="pointer-events-auto absolute bottom-4 right-3 flex flex-col items-center gap-3">
          <div className="h-12 w-12 overflow-hidden rounded-full border-2 border-pink-500 bg-black p-0.5 shadow-lg shadow-pink-500/30">
            <FeedPoster
              feedKey={`${performer.feedKey}-avatar`}
              posterUrl={performer.posterUrl}
              className="h-full w-full rounded-full object-cover"
            />
          </div>

          {isActive && !streamRevealed && (
            <button
              type="button"
              onClick={handleReveal}
              className="rounded-full bg-gradient-to-r from-pink-600 to-rose-600 px-2.5 py-2 text-[10px] font-black uppercase tracking-wide text-white shadow-lg shadow-pink-600/40"
            >
              Ver LIVE
            </button>
          )}

          {isActive && streamRevealed && (
            <button
              type="button"
              onClick={toggleMuted}
              className="flex h-11 w-11 items-center justify-center rounded-full border border-white/20 bg-black/75 text-lg shadow-lg backdrop-blur-sm"
              aria-label={muted ? "Activar sonido" : "Silenciar"}
            >
              {muted ? "🔇" : "🔊"}
            </button>
          )}
        </div>
      </div>
    </article>
  );
}
