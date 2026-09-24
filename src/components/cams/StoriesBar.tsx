"use client";

import CrackWidget from "./CrackWidget";

/** Fila horizontal tipo historias con modelos en vivo (CrakRevenue). */
export function StoriesBar({ className = "" }: { className?: string }) {
  return (
    <section
      className={`overflow-hidden ${className}`}
      aria-label="Live stories"
    >
      <CrackWidget
        cols={10}
        rows={1}
        number={10}
        ratio={1}
        useFeed={0}
        animateFeed={0}
        height="h-24"
      />
    </section>
  );
}
