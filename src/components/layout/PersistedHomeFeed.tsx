"use client";

import { usePathname } from "next/navigation";
import { useRef } from "react";
import { DesktopHomeCatalog } from "@/components/desktop/DesktopHomeCatalog";
import { HomeTabletTubeCatalog } from "@/components/home/HomeTabletTubeCatalog";
import { MobileHomeDenseGrid } from "@/components/home/MobileHomeDenseGrid";
import { useHomePerformers } from "@/hooks/useHomePerformers";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import type { FeedPerformer } from "@/lib/feed/filterPerformers";

type PersistedHomeFeedProps = {
  initialPerformers: FeedPerformer[];
};

export function PersistedHomeFeed({
  initialPerformers,
}: PersistedHomeFeedProps) {
  const pathname = usePathname();
  const everHome = useRef(false);
  const isMobileDense = useMediaQuery("(max-width: 767px)", true);
  const isDesktop = useMediaQuery("(min-width: 1024px)", false);
  const { performers, ready } = useHomePerformers(initialPerformers);

  if (pathname === "/") {
    everHome.current = true;
  }

  const onHome = pathname === "/";
  const mounted = everHome.current;

  if (!mounted) {
    return null;
  }

  return (
    <div
      className={
        onHome
          ? "relative z-20 flex w-full flex-col"
          : "pointer-events-none invisible fixed -left-[9999px] top-0 h-0 w-0 overflow-hidden"
      }
      aria-hidden={!onHome}
      {...(!onHome ? { inert: true as const } : {})}
    >
      {isDesktop ? (
        <DesktopHomeCatalog />
      ) : isMobileDense ? (
        <MobileHomeDenseGrid performers={performers} ready={ready} />
      ) : (
        <HomeTabletTubeCatalog performers={performers} ready={ready} />
      )}
    </div>
  );
}
