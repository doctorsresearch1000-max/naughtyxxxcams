"use client";

import { usePathname } from "next/navigation";
import { Suspense, useEffect, useRef } from "react";
import { DesktopHomeCatalog } from "@/components/desktop/DesktopHomeCatalog";
import {
  MobileFeedFullscreenPortal,
  MOBILE_FEED_PORTAL_ID,
} from "@/components/feed/MobileFeedFullscreenPortal";
import { HomeVerticalFeed } from "@/components/feed/HomeVerticalFeed";
import { SessionAudioProvider } from "@/components/feed/SessionAudioProvider";
import type { FeedPerformer } from "@/lib/feed/filterPerformers";
import { tearDownAllStreamSlots } from "@/lib/feed/feedStreamEngine";
import { useMediaQuery } from "@/hooks/useMediaQuery";

function FeedFallback() {
  return (
    <div className="feed-shell feed-shell--in-portal flex h-full w-full items-center justify-center bg-black">
      <div className="h-10 w-10 animate-spin rounded-full border-2 border-[#39FF14]/30 border-t-[#39FF14]" />
    </div>
  );
}

function MobileFeedFallback() {
  return (
    <MobileFeedFullscreenPortal>
      <FeedFallback />
    </MobileFeedFullscreenPortal>
  );
}

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

  const onHome = pathname === "/";
  const mounted = everHome.current;

  useEffect(() => {
    if (typeof document === "undefined") return;
    const root = document.documentElement;
    const lock = onHome && !isDesktop;
    root.classList.toggle("feed-home-active", lock);

    if (!lock) {
      tearDownAllStreamSlots();
      document.getElementById(MOBILE_FEED_PORTAL_ID)?.remove();
    }

    return () => {
      root.classList.remove("feed-home-active");
    };
  }, [onHome, isDesktop]);

  if (!mounted) {
    return null;
  }

  if (!onHome && !isDesktop) {
    return null;
  }

  return (
    <div
      className={
        onHome
          ? isDesktop
            ? "relative z-20 flex h-full min-h-[var(--feed-viewport-height)] flex-1 flex-col"
            : "contents"
          : "pointer-events-none invisible fixed -left-[9999px] top-0 h-0 w-0 overflow-hidden"
      }
      aria-hidden={!onHome}
      {...(!onHome ? { inert: true as const } : {})}
    >
      {isDesktop ? (
        <DesktopHomeCatalog />
      ) : (
        <SessionAudioProvider>
          <Suspense fallback={<MobileFeedFallback />}>
            <MobileFeedFullscreenPortal>
              <HomeVerticalFeed initialPerformers={initialPerformers} />
            </MobileFeedFullscreenPortal>
          </Suspense>
        </SessionAudioProvider>
      )}
    </div>
  );
}
