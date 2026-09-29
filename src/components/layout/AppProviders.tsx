"use client";

import { useEffect } from "react";
import { TelegramAuthProvider } from "@/components/auth/TelegramAuthProvider";
import { SaveToCollectionProvider } from "@/components/collections/SaveToCollectionProvider";
import { FeedBottomChromeProvider } from "@/components/layout/FeedBottomChromeContext";
import { AgeGate } from "@/components/compliance/AgeGate";
import { preloadLiveCommentPools } from "@/lib/engagement/liveCommentEngine";

export function AppProviders({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    preloadLiveCommentPools();
  }, []);

  return (
    <TelegramAuthProvider>
      <SaveToCollectionProvider>
        <FeedBottomChromeProvider>
          {children}
          <AgeGate />
        </FeedBottomChromeProvider>
      </SaveToCollectionProvider>
    </TelegramAuthProvider>
  );
}
