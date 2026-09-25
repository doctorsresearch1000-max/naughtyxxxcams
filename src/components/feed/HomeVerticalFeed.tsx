"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { RESUME_FEED_QUERY } from "@/lib/feed/continueWatchingStorage";
import {
  fetchFeedBootstrapPerformers,
  fetchFeedFullPerformers,
  readFeedPerformersCache,
  seedFeedPerformersCache,
} from "@/lib/feed/feedClientCache";
import { LiveFeedCard } from "@/components/feed/LiveFeedCard";
import { FeedViewportProvider } from "@/components/feed/FeedViewportContext";
import { useFeedViewportHeight } from "@/hooks/useFeedViewportHeight";
import { useSessionAudio } from "@/components/feed/SessionAudioProvider";
import { muteFeedOnSlideChange } from "@/components/feed/SessionAudioProvider";
import type { FeedPerformer } from "@/lib/feed/filterPerformers";
import { useFeedActiveIndex } from "@/hooks/useFeedActiveIndex";
import { useVideoFeedBuffer } from "@/hooks/useVideoFeedBuffer";
import { syncFeedStreamNeighbors } from "@/lib/feed/feedStreamEngine";

function mergeFeedPerformers(
  current: FeedPerformer[],
  incoming: FeedPerformer[],
): FeedPerformer[] {
  if (incoming.length === 0) return current;
  const seen = new Set(current.map((p) => p.feedKey));
  const out = [...current];
  for (const performer of incoming) {
    if (seen.has(performer.feedKey)) continue;
    seen.add(performer.feedKey);
    out.push(performer);
  }
  return out;
}

function FeedLoadingShell() {
  return (
    <div className="feed-slide flex items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-[#39FF14]/30 border-t-[#39FF14]" />
        <p className="text-xs font-medium text-neutral-400">Loading live models…</p>
      </div>
    </div>
  );
}

type HomeVerticalFeedInnerProps = {
  initialPerformers: FeedPerformer[];
};

function HomeVerticalFeedInner({
  initialPerformers,
}: HomeVerticalFeedInnerProps) {
  const slideHeightPx = useFeedViewportHeight();
  const scrollRef = useRef<HTMLDivElement>(null);
  const serverBootstrapped = initialPerformers.length > 0;
  const [slides, setSlides] = useState<FeedPerformer[]>(() => {
    if (serverBootstrapped) return initialPerformers;
    return readFeedPerformersCache()?.performers ?? [];
  });
  const [loadState, setLoadState] = useState<"loading" | "ready" | "empty">(
    () => {
      if (serverBootstrapped) return "ready";
      return readFeedPerformersCache()?.performers.length ? "ready" : "loading";
    },
  );
  const searchParams = useSearchParams();
  const router = useRouter();
  const resumeFeedKey = searchParams.get(RESUME_FEED_QUERY);
  const { registerActiveIframe, resetAudioOnSlideChange } = useSessionAudio();

  useLayoutEffect(() => {
    if (serverBootstrapped) {
      seedFeedPerformersCache(initialPerformers, { complete: false });
    }
  }, [initialPerformers, serverBootstrapped]);

  useEffect(() => {
    let cancelled = false;

    void (async () => {
      try {
        let bootCount = serverBootstrapped ? initialPerformers.length : 0;

        if (!serverBootstrapped) {
          const boot = await fetchFeedBootstrapPerformers();
          if (cancelled) return;
          bootCount = boot.performers.length;
          if (boot.performers.length > 0) {
            setSlides(boot.performers);
            setLoadState("ready");
          } else if (slides.length === 0) {
            setLoadState("empty");
          }
        }

        const full = await fetchFeedFullPerformers();
        if (cancelled) return;
        if (full.performers.length > 0) {
          setSlides((prev) => mergeFeedPerformers(prev, full.performers));
          setLoadState("ready");
        } else if (bootCount === 0 && slides.length === 0) {
          setLoadState("empty");
        }
      } catch {
        if (!cancelled && slides.length === 0) {
          setLoadState("empty");
        }
      }
    })();

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- hydrate once; full catalog in background
  }, [serverBootstrapped]);

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
  const { isArmed } = useVideoFeedBuffer(
    activeIndex,
    slideCount,
    1,
  );

  const prevActiveIndexRef = useRef(activeIndex);

  useLayoutEffect(() => {
    if (prevActiveIndexRef.current !== activeIndex) {
      muteFeedOnSlideChange();
      resetAudioOnSlideChange();
      prevActiveIndexRef.current = activeIndex;
    }
  }, [activeIndex, resetAudioOnSlideChange]);

  useLayoutEffect(() => {
    if (slides.length === 0) return;
    syncFeedStreamNeighbors(slides, activeIndex);
  }, [slides, activeIndex]);

  const handleRegisterIframe = useCallback(
    (win: Window | null) => {
      registerActiveIframe(win);
    },
    [registerActiveIframe],
  );

  return (
    <main
      className="tele-shell feed-shell relative mx-auto flex w-full max-w-md shrink-0 flex-col overflow-hidden bg-black text-white"
      style={{ height: slideHeightPx, minHeight: slideHeightPx, maxHeight: slideHeightPx }}
    >
      <div
        ref={scrollRef}
        className="tele-scroll feed-scroll hide-scrollbar w-full overflow-y-auto overscroll-y-contain snap-y snap-mandatory touch-pan-y [-webkit-overflow-scrolling:touch]"
      >
        {loadState === "loading" && slides.length === 0 ? (
          <FeedLoadingShell />
        ) : null}
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
            streamPriority={index === activeIndex ? "high" : index === activeIndex + 1 ? "low" : "auto"}
            deferSecondaryChrome={index === activeIndex}
            onRegisterIframe={handleRegisterIframe}
          />
        ))}
      </div>
    </main>
  );
}

type HomeVerticalFeedProps = {
  initialPerformers?: FeedPerformer[];
};

export function HomeVerticalFeed({
  initialPerformers = [],
}: HomeVerticalFeedProps) {
  return (
    <FeedViewportProvider>
      <HomeVerticalFeedInner initialPerformers={initialPerformers} />
    </FeedViewportProvider>
  );
}
