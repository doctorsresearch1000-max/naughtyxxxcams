"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";
import {
  prefetchHomeFeedPerformers,
  readFeedPerformersCache,
} from "@/lib/feed/feedClientCache";
import { injectStreamPreconnects } from "@/lib/feed/streamEmbedWarmup";

/** Preconnect + bootstrap performers only on `/` (avoids extra Worker hits). */
export function HomeFeedWarm() {
  const pathname = usePathname();

  useEffect(() => {
    injectStreamPreconnects();
  }, []);

  useEffect(() => {
    if (pathname !== "/") return;
    if (!readFeedPerformersCache()?.performers.length) {
      prefetchHomeFeedPerformers();
    }
  }, [pathname]);

  return null;
}
