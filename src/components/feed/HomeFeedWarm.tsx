"use client";

import { useEffect } from "react";
import { prefetchHomeFeedPerformers } from "@/lib/feed/feedClientCache";
import { injectStreamPreconnects } from "@/lib/feed/streamEmbedWarmup";

/** Preconnect + kick off bootstrap performers before the home route paints. */
export function HomeFeedWarm() {
  useEffect(() => {
    injectStreamPreconnects();
    prefetchHomeFeedPerformers();
  }, []);

  return null;
}
