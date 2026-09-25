"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { FeedPoster } from "@/components/feed/FeedPoster";
import type { PerformerEmbedPlan } from "@/lib/feed/performerEmbed";
import { WIDGET_IFRAME_ALLOW } from "@/lib/feed/embedFrame";

type LiveEmbedProps = {
  embedKey: string;
  posterUrl: string;
  embedPlan: PerformerEmbedPlan;
  isActive: boolean;
  isArmed: boolean;
  onIframeWindow?: (win: Window | null) => void;
};

/** Zoom hybrid 16:9 player to fill 9:16 card (TikTok-style crop). */
const PLAYER_FILL_SCALE = 3.15;
const PLAYER_TRANSFORM_ORIGIN = "center 35%";

/**
 * Clean cross-origin player surface — no parent capture handlers, no affiliate overlays.
 * Audio unlock is handled inside the Crak document when the user taps the video.
 */
export function LiveEmbed({
  embedKey,
  posterUrl,
  embedPlan,
  isActive,
  isArmed,
  onIframeWindow,
}: LiveEmbedProps) {
  const iframeRef = useRef<HTMLIFrameElement | null>(null);
  const [frameLoaded, setFrameLoaded] = useState(false);

  const initialSrc = embedPlan.playerSrcMuted ?? embedPlan.outerEmbedSrc;

  useEffect(() => {
    setFrameLoaded(false);
  }, [embedKey, initialSrc]);

  useEffect(() => {
    if (!isActive) {
      onIframeWindow?.(null);
      return;
    }
    if (!frameLoaded) return;
    onIframeWindow?.(iframeRef.current?.contentWindow ?? null);
  }, [isActive, frameLoaded, onIframeWindow]);

  const mountIframe =
    isArmed &&
    embedPlan.canMountInteractivePlayer &&
    Boolean(initialSrc);

  const streamRevealed = isActive && frameLoaded && mountIframe;
  const hidePoster = frameLoaded && mountIframe;

  const bindIframeRef = useCallback((node: HTMLIFrameElement | null) => {
    iframeRef.current = node;
  }, []);

  if (!isArmed || !embedPlan.canMountInteractivePlayer) {
    return (
      <FeedPoster
        feedKey={embedKey}
        posterUrl={posterUrl}
        priority={isActive || isArmed}
        className="absolute inset-0 z-0 h-full w-full object-cover"
      />
    );
  }

  return (
    <div
      className="absolute inset-0 z-[10] h-full w-full overflow-hidden bg-black"
      data-feed-card-root="true"
      data-stream-revealed={streamRevealed ? "1" : "0"}
      data-feed-key={embedKey}
      data-embed-mode={embedPlan.mode}
    >
      <FeedPoster
        feedKey={embedKey}
        posterUrl={posterUrl}
        priority={isActive || isArmed}
        className={`pointer-events-none absolute inset-0 z-[3] h-full w-full object-cover transition-opacity duration-500 ease-out ${
          hidePoster ? "opacity-0" : "opacity-100"
        }`}
      />

      {mountIframe && initialSrc ? (
        <div className="absolute inset-0 z-[2] h-full w-full overflow-hidden">
          <iframe
            key={`${embedKey}-${embedPlan.mode}`}
            ref={bindIframeRef}
            src={initialSrc}
            title={`Live stream ${embedKey}`}
            data-naughty-feed-embed="true"
            data-player-src-muted={embedPlan.playerSrcMuted ?? ""}
            data-player-src-unmuted={embedPlan.playerSrcUnmuted ?? ""}
            className={`absolute inset-0 h-full w-full origin-[center_35%] border-0 bg-black ${
              isActive ? "pointer-events-auto" : "pointer-events-none"
            }`}
            style={{
              transform: `scale(${PLAYER_FILL_SCALE})`,
              transformOrigin: PLAYER_TRANSFORM_ORIGIN,
            }}
            allow={WIDGET_IFRAME_ALLOW}
            referrerPolicy="strict-origin-when-cross-origin"
            onLoad={() => setFrameLoaded(true)}
          />
        </div>
      ) : null}
    </div>
  );
}
