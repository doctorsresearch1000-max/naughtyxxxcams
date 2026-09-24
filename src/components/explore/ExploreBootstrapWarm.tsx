"use client";

import { useEffect } from "react";
import {
  fetchExploreBootstrap,
  readExploreBootstrapCache,
} from "@/lib/explore/exploreClientCache";

/** Prefetch explore data as soon as the app loads so Explore opens instantly. */
export function ExploreBootstrapWarm() {
  useEffect(() => {
    if (readExploreBootstrapCache()?.masterPool.length) return;
    void fetchExploreBootstrap().catch(() => {});
  }, []);

  return null;
}
