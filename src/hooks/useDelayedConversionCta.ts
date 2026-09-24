"use client";

import { useEffect, useState } from "react";

const DEFAULT_DELAY_MS = 15_000;

export function useDelayedConversionCta(
  active: boolean,
  delayMs = DEFAULT_DELAY_MS,
) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!active) {
      setReady(false);
      return;
    }

    setReady(false);
    const id = window.setTimeout(() => setReady(true), delayMs);
    return () => window.clearTimeout(id);
  }, [active, delayMs]);

  return ready;
}
