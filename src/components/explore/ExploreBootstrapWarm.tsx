"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";
import {
  fetchExploreBootstrap,
  readExploreBootstrapCache,
} from "@/lib/explore/exploreClientCache";

/** Prefetch explore data only when user opens Explore (saves Worker CPU on home). */
export function ExploreBootstrapWarm() {
  const pathname = usePathname();

  useEffect(() => {
    const onExplore =
      pathname === "/explore" || pathname.startsWith("/explore/");
    if (!onExplore) return;
    if (readExploreBootstrapCache()?.masterPool.length) return;
    void fetchExploreBootstrap().catch(() => {});
  }, [pathname]);

  return null;
}
