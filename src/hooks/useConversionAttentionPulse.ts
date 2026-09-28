"use client";

import { useEffect, useState } from "react";

const DEFAULT_PULSE_DELAY_MS = 3_500;

/** After `delayMs` on the active slide, enable a visual attention pulse (CTA stays visible). */
export function useConversionAttentionPulse(
  active: boolean,
  delayMs = DEFAULT_PULSE_DELAY_MS,
): boolean {
  const [pulse, setPulse] = useState(false);

  useEffect(() => {
    if (!active) {
      setPulse(false);
      return;
    }

    setPulse(false);
    const id = window.setTimeout(() => setPulse(true), delayMs);
    return () => window.clearTimeout(id);
  }, [active, delayMs]);

  return pulse;
}
