"use client";

import { usePathname } from "next/navigation";
import { useRef } from "react";
import { HomeVerticalFeed } from "@/components/feed/HomeVerticalFeed";
import { SessionAudioProvider } from "@/components/feed/SessionAudioProvider";

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
      className={visible ? "relative z-20 min-h-0 flex-1" : "hidden"}
      aria-hidden={!visible}
    >
      <SessionAudioProvider>
        <HomeVerticalFeed />
      </SessionAudioProvider>
    </div>
  );
}
