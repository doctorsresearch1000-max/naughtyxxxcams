"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { LiveFeedCard } from "@/components/feed/LiveFeedCard";
import { useSessionAudio } from "@/components/feed/SessionAudioProvider";
import type { FeedPerformer } from "@/lib/feed/filterPerformers";
import { useFeedActiveIndex } from "@/hooks/useFeedActiveIndex";
import { useVideoFeedBuffer } from "@/hooks/useVideoFeedBuffer";

const SHELL_HEIGHT =
  "h-[calc(100dvh-var(--app-header-height)-4rem)] min-h-0";

const FALLBACK_FEED: FeedPerformer[] = [
  {
    feedKey: "fallback-1",
    posterUrl:
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800&q=80&nx_feed=f1",
    name: "ElhaSky",
    nameClean: "ElhaSky",
    live: true,
  },
  {
    feedKey: "fallback-2",
    posterUrl:
      "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=800&q=80&nx_feed=f2",
    name: "LunaRose",
    nameClean: "LunaRose",
    live: true,
  },
  {
    feedKey: "fallback-3",
    posterUrl:
      "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=800&q=80&nx_feed=f3",
    name: "MiaVelvet",
    nameClean: "MiaVelvet",
    live: true,
  },
];

export function HomeVerticalFeed() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [slides, setSlides] = useState<FeedPerformer[]>(FALLBACK_FEED);
  const { registerActiveIframe, setOverlayGate, unlocked } = useSessionAudio();

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/performers", { cache: "no-store" });
        const json = (await res.json()) as { performers?: FeedPerformer[] };
        if (cancelled) return;
        const list = Array.isArray(json.performers) ? json.performers : [];
        if (list.length > 0) setSlides(list);
      } catch {
        /* fallback */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const { activeIndex } = useFeedActiveIndex(scrollRef, slides.length);
  const { isArmed } = useVideoFeedBuffer(activeIndex, slides.length, 2);

  useEffect(() => {
    if (!unlocked) {
      setOverlayGate(true);
    }
  }, [activeIndex, unlocked, setOverlayGate]);

  const handleRegisterIframe = useCallback(
    (win: Window | null) => {
      registerActiveIframe(win);
    },
    [registerActiveIframe],
  );

  return (
    <main
      className={`tele-shell relative mx-auto w-full max-w-md shrink-0 overflow-hidden bg-black text-white ${SHELL_HEIGHT}`}
    >
      <div
        ref={scrollRef}
        className="tele-scroll hide-scrollbar h-full w-full overflow-y-auto overscroll-y-contain snap-y snap-mandatory touch-pan-y [-webkit-overflow-scrolling:touch]"
      >
        {slides.map((performer, index) => (
          <LiveFeedCard
            key={performer.feedKey}
            performer={performer}
            index={index}
            isActive={index === activeIndex}
            isArmed={isArmed(index)}
            onRegisterIframe={handleRegisterIframe}
          />
        ))}
      </div>
    </main>
  );
}
