"use client";

import { usePathname } from "next/navigation";
import { Suspense, useRef } from "react";
import { HomeVerticalFeed } from "@/components/feed/HomeVerticalFeed";
import { SessionAudioProvider } from "@/components/feed/SessionAudioProvider";

function FeedFallback() {
  return (
    <div className="flex h-[calc(100dvh-4rem)] items-center justify-center bg-black">
      <div className="h-10 w-10 animate-spin rounded-full border-2 border-[#39FF14]/30 border-t-[#39FF14]" />
    </div>
  );
}

/**
 * Keeps the home feed (and its iframes) mounted while browsing other tabs so
 * route changes are not blocked by tearing down multiple live embeds.
 */
export function PersistedHomeFeed() {
  const pathname = usePathname();
  const everHome = useRef(false);

  if (pathname === "/") {
    everHome.current = true;
  }

  if (!everHome.current) {
    return null;
  }

  const visible = pathname === "/";

  return (
    <div
      className={
        visible
          ? "relative z-20 min-h-0 flex-1"
          : "pointer-events-none invisible fixed -left-[9999px] top-0 h-0 w-0 overflow-hidden"
      }
      aria-hidden={!visible}
      {...(!visible ? { inert: true as const } : {})}
    >
      <SessionAudioProvider>
        <Suspense fallback={<FeedFallback />}>
          <HomeVerticalFeed />
        </Suspense>
      </SessionAudioProvider>
    </div>
  );
}
