"use client";

import { useEffect } from "react";
import { TelegramAuthProvider } from "@/components/auth/TelegramAuthProvider";
import { FeedBottomChromeProvider } from "@/components/layout/FeedBottomChromeContext";
import { preloadLiveCommentPools } from "@/lib/engagement/liveCommentEngine";

export function AppProviders({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    preloadLiveCommentPools();
  }, []);

  return (
    <TelegramAuthProvider>
      <FeedBottomChromeProvider>{children}</FeedBottomChromeProvider>
    </TelegramAuthProvider>
  );
}
