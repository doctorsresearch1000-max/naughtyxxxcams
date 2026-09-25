"use client";

import { createContext, useContext } from "react";
import { useFeedViewportHeight } from "@/hooks/useFeedViewportHeight";

const FeedViewportContext = createContext<number>(640);

export function FeedViewportProvider({ children }: { children: React.ReactNode }) {
  const slideHeightPx = useFeedViewportHeight();
  return (
    <FeedViewportContext.Provider value={slideHeightPx}>
      {children}
    </FeedViewportContext.Provider>
  );
}

export function useFeedSlideHeightPx(): number {
  return useContext(FeedViewportContext);
}
