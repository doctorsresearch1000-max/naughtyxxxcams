"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { RESUME_FEED_QUERY } from "@/lib/feed/continueWatchingStorage";
import { LiveFeedCard } from "@/components/feed/LiveFeedCard";
import { useSessionAudio } from "@/components/feed/SessionAudioProvider";
import type { FeedPerformer } from "@/lib/feed/filterPerformers";
import { useFeedActiveIndex } from "@/hooks/useFeedActiveIndex";
import { useVideoFeedBuffer } from "@/hooks/useVideoFeedBuffer";

const SHELL_HEIGHT = "h-[calc(100dvh-4rem)] min-h-0";

function FeedLoadingShell() {
  return (
    <div className="flex h-full w-full snap-start snap-always items-center justify-center bg-black">
      <div className="flex flex-col items-center gap-3">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-[#39FF14]/30 border-t-[#39FF14]" />
        <p className="text-xs font-medium text-neutral-400">Loading live models…</p>
      </div>
    </div>
  );
}

export function HomeVerticalFeed() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [slides, setSlides] = useState<FeedPerformer[]>([]);
  const [loadState, setLoadState] = useState<"loading" | "ready" | "empty">(
    "loading",
  );
  const pathname = usePathname();
  const onHome = pathname === "/";
  const searchParams = useSearchParams();
  const router = useRouter();
  const resumeFeedKey = searchParams.get(RESUME_FEED_QUERY);
  const { registerActiveIframe, setOverlayGate, isAudioUnlocked } =
    useSessionAudio();

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/performers", { cache: "no-store" });
        const json = (await res.json()) as { performers?: FeedPerformer[] };
        if (cancelled) return;
        const list = Array.isArray(json.performers) ? json.performers : [];
        if (list.length > 0) {
          setSlides(list);
          setLoadState("ready");
        } else {
          setLoadState("empty");
        }
      } catch {
        setLoadState("empty");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const resumeHandledRef = useRef(false);

  useEffect(() => {
    if (
      resumeHandledRef.current ||
      !resumeFeedKey ||
      loadState !== "ready" ||
      slides.length === 0
    ) {
      return;
    }

    resumeHandledRef.current = true;
    const key = resumeFeedKey;
    const index = slides.findIndex((s) => s.feedKey === key);

    const timer = window.setTimeout(() => {
      if (index >= 0) {
        const card = scrollRef.current?.querySelector<HTMLElement>(
          `[data-feed-key="${CSS.escape(key)}"]`,
        );
        card?.scrollIntoView({ block: "start", behavior: "auto" });
      }
      router.replace("/", { scroll: false });
    }, 120);

    return () => window.clearTimeout(timer);
  }, [resumeFeedKey, loadState, slides, router]);

  const slideCount = slides.length > 0 ? slides.length : 1;
  const { activeIndex } = useFeedActiveIndex(scrollRef, slideCount);
  const { isArmed } = useVideoFeedBuffer(activeIndex, slideCount, 1);

  useEffect(() => {
    if (!onHome) {
      setOverlayGate(false);
      return;
    }
    if (!isAudioUnlocked) {
      setOverlayGate(true);
    }
  }, [activeIndex, isAudioUnlocked, setOverlayGate, onHome]);

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
        {loadState === "loading" ? <FeedLoadingShell /> : null}
        {loadState === "empty" ? (
          <div className="flex h-full snap-start items-center justify-center px-6 text-center">
            <p className="text-sm text-neutral-400">
              Live performers are temporarily unavailable. Try again in a moment
              or open Discover.
            </p>
          </div>
        ) : null}
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
