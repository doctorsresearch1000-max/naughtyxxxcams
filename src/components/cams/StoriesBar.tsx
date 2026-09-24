"use client";

import { CrackWidget } from "./CrackWidget";

/** Fila horizontal tipo historias con modelos en vivo (CrakRevenue). */
export function StoriesBar({ className = "" }: { className?: string }) {
  return (
    <section
      className={`overflow-hidden ${className}`}
      aria-label="Live stories"
    >
      <CrackWidget cols={10} rows={1} number={10} className="min-h-[6.5rem]" />
    </section>
  );
}
