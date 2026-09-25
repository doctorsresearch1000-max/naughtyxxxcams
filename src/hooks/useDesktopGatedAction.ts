"use client";

import { useCallback } from "react";
import { useMediaQuery } from "@/hooks/useMediaQuery";

/**
 * Desktop chat / premium CTAs open affiliate URLs directly (no registration paywall).
 */
export function useDesktopGatedAction() {
  const isDesktop = useMediaQuery("(min-width: 1024px)");

  const runGated = useCallback((action: () => void) => {
    action();
  }, []);

  const gateAnchorClick = useCallback(() => {
    /* Allow default <a target="_blank"> navigation — no modal. */
  }, []);

  return { isDesktop, runGated, gateAnchorClick };
}
