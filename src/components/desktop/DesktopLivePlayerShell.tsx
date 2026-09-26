"use client";

import { useEffect, useRef, useState } from "react";
import { LiveEmbed } from "@/components/feed/LiveEmbed";
import type { FeedPerformer } from "@/lib/feed/filterPerformers";
import { warmPerformerStream } from "@/lib/feed/streamEmbedWarmup";

type DesktopLivePlayerShellProps = {
  performer: FeedPerformer;
  className?: string;
  sessionMuted?: boolean;
  /** Size to the parent flex/grid cell (room dialog, profile layout). */
  fillParent?: boolean;
};

export function DesktopLivePlayerShell({
  performer,
  className = "",
  sessionMuted = true,
  fillParent = false,
}: DesktopLivePlayerShellProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [heightPx, setHeightPx] = useState(640);
  const [playerReady, setPlayerReady] = useState(false);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setPlayerReady(true);
        }
      },
      { rootMargin: "120px 0px" },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!playerReady) return;
    warmPerformerStream(performer.feedKey, performer.embedPlan);
  }, [playerReady, performer.feedKey, performer.embedPlan]);

  useEffect(() => {
    if (fillParent) {
      const el = containerRef.current;
      if (!el) return;
      const measure = () => {
        const h = el.clientHeight;
        if (h > 0) setHeightPx(h);
      };
      measure();
      const ro = new ResizeObserver(measure);
      ro.observe(el);
      return () => ro.disconnect();
    }

    const update = () => {
      setHeightPx(Math.min(Math.max(window.innerHeight * 0.65, 480), 820));
    };
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, [fillParent]);

  return (
    <div
      ref={containerRef}
      className={`relative w-full overflow-hidden bg-black ${
        fillParent ? "h-full min-h-0" : ""
      } ${className}`}
      style={fillParent ? undefined : { height: heightPx, minHeight: 480 }}
    >
      {playerReady ? (
        <LiveEmbed
          embedKey={performer.feedKey}
          posterUrl={performer.posterUrl}
          embedPlan={performer.embedPlan}
          isActive={true}
          isArmed={true}
          sessionMuted={sessionMuted}
          viewportHeightPx={heightPx}
          fastReveal
          iframeLoading="lazy"
          streamPriority="low"
        />
      ) : null}
    </div>
  );
}
