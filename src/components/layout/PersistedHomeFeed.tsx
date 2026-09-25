"use client";

import { usePathname } from "next/navigation";
import { Suspense, useEffect, useRef } from "react";
import { DesktopHomeCatalog } from "@/components/desktop/DesktopHomeCatalog";
import { MobileFeedFullscreenPortal } from "@/components/feed/MobileFeedFullscreenPortal";
import { HomeVerticalFeed } from "@/components/feed/HomeVerticalFeed";
import { SessionAudioProvider } from "@/components/feed/SessionAudioProvider";
import type { FeedPerformer } from "@/lib/feed/filterPerformers";
import { useMediaQuery } from "@/hooks/useMediaQuery";

function FeedFallback() {
  return (
    <div className="feed-shell feed-shell--mobile-stage flex items-center justify-center bg-black">
      <div className="h-10 w-10 animate-spin rounded-full border-2 border-[#39FF14]/30 border-t-[#39FF14]" />
    </div>
  );
}

function MobileFeedFallback() {
  return (
    <MobileFeedFullscreenPortal active visible>
      <FeedFallback />
    </MobileFeedFullscreenPortal>
  );
}

/**
 * Keeps the home feed (and its iframes) mounted while browsing other tabs so
 * route changes are not blocked by tearing down multiple live embeds.
 */
type PersistedHomeFeedProps = {
  initialPerformers: FeedPerformer[];
};

export function PersistedHomeFeed({
  initialPerformers,
}: PersistedHomeFeedProps) {
  const pathname = usePathname();
  const isDesktop = useMediaQuery("(min-width: 1024px)");
  const everHome = useRef(false);

  if (pathname === "/") {
    everHome.current = true;
  }

  const visible = pathname === "/";
  const mounted = everHome.current;

  useEffect(() => {
    if (typeof document === "undefined") return;
    const root = document.documentElement;
    const lock = mounted && visible && !isDesktop;
    root.classList.toggle("feed-home-active", lock);
    return () => {
      root.classList.remove("feed-home-active");
    };
  }, [mounted, visible, isDesktop]);

  if (!mounted) {
    return null;
  }

  return (
    <div
      className={
        visible
          ? isDesktop
            ? "relative z-20 flex h-full min-h-[var(--feed-viewport-height)] flex-1 flex-col"
            : "contents"
          : "pointer-events-none invisible fixed -left-[9999px] top-0 h-0 w-0 overflow-hidden"
      }
      aria-hidden={!visible}
      {...(!visible ? { inert: true as const } : {})}
    >
      {isDesktop ? (
        <DesktopHomeCatalog />
      ) : (
        <SessionAudioProvider>
          <Suspense
            fallback={
              !isDesktop ? (
                <MobileFeedFallback />
              ) : (
                <div className="feed-shell flex items-center justify-center bg-black">
                  <div className="h-10 w-10 animate-spin rounded-full border-2 border-[#39FF14]/30 border-t-[#39FF14]" />
                </div>
              )
            }
          >
            <HomeVerticalFeed
              initialPerformers={initialPerformers}
              fullscreenActive={!isDesktop}
              fullscreenVisible={visible}
            />
          </Suspense>
        </SessionAudioProvider>
      )}
    </div>
  );
}
