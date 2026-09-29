"use client";

import { useSyncExternalStore } from "react";

function subscribe(query: string, onChange: () => void) {
  const mql = window.matchMedia(query);
  mql.addEventListener("change", onChange);
  return () => mql.removeEventListener("change", onChange);
}

/**
 * SSR-safe media query. `serverFallback` avoids a blank home on mobile before hydration
 * (when both mobile/desktop flags were false and tablet markup stayed `display:none`).
 */
export function useMediaQuery(
  query: string,
  serverFallback = false,
): boolean {
  return useSyncExternalStore(
    (onChange) => subscribe(query, onChange),
    () => window.matchMedia(query).matches,
    () => serverFallback,
  );
}
