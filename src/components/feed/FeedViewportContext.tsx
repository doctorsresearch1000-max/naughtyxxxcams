"use client";

import { createContext, useContext } from "react";

const FeedViewportContext = createContext<number>(640);

export function FeedViewportProvider({
  heightPx,
  children,
}: {
  heightPx: number;
  children: React.ReactNode;
}) {
  return (
    <FeedViewportContext.Provider value={heightPx}>
      {children}
    </FeedViewportContext.Provider>
  );
}

export function useFeedSlideHeightPx(): number {
  return useContext(FeedViewportContext);
}
