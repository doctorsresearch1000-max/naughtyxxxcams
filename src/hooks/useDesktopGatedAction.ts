"use client";

import { useCallback, type MouseEvent } from "react";
import { useRegistrationPaywall } from "@/components/auth/RegistrationPaywallProvider";
import { useTelegramAuth } from "@/components/auth/TelegramAuthProvider";
import { useMediaQuery } from "@/hooks/useMediaQuery";

/**
 * Soft paywall on desktop (lg+): catalog browsing stays free; gated actions call
 * `requireAccount` before running the handler.
 */
export function useDesktopGatedAction() {
  const isDesktop = useMediaQuery("(min-width: 1024px)");
  const { isAuthenticated } = useTelegramAuth();
  const { requireAccount } = useRegistrationPaywall();

  const runGated = useCallback(
    (action: () => void) => {
      if (!isDesktop || isAuthenticated) {
        action();
        return;
      }
      if (requireAccount()) {
        action();
      }
    },
    [isDesktop, isAuthenticated, requireAccount],
  );

  const gateAnchorClick = useCallback(
    (event: MouseEvent<HTMLAnchorElement>, href: string) => {
      if (!isDesktop || isAuthenticated) return;
      event.preventDefault();
      if (requireAccount()) {
        window.open(href, "_blank", "noopener,noreferrer");
      }
    },
    [isDesktop, isAuthenticated, requireAccount],
  );

  return { isDesktop, runGated, gateAnchorClick };
}
