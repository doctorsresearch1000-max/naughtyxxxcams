"use client";

import { useEffect, useRef, useState } from "react";
import type { FeedPerformer } from "@/lib/feed/filterPerformers";
import { detectStreamCommentLocale } from "@/lib/engagement/streamCommentLocale";
import {
  LiveCommentScheduler,
  loadLiveCommentPools,
  type LiveCommentItem,
} from "@/lib/engagement/liveCommentEngine";

type LiveCommentTickerProps = {
  performer: FeedPerformer;
  isActive: boolean;
};

const MAX_VISIBLE = 4;

export function LiveCommentTicker({
  performer,
  isActive,
}: LiveCommentTickerProps) {
  const [items, setItems] = useState<LiveCommentItem[]>([]);
  const schedulerRef = useRef<LiveCommentScheduler | null>(null);
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    if (!isActive) {
      setItems([]);
      schedulerRef.current = null;
      if (timerRef.current) window.clearInterval(timerRef.current);
      timerRef.current = null;
      return;
    }

    let cancelled = false;

    void loadLiveCommentPools().then((pools) => {
      if (cancelled) return;
      const locale = detectStreamCommentLocale(performer);
      schedulerRef.current = new LiveCommentScheduler(pools, locale);

      const pushNext = () => {
        const sched = schedulerRef.current;
        if (!sched) return;
        const next = sched.next();
        setItems((prev) => [next, ...prev].slice(0, MAX_VISIBLE));
      };

      pushNext();
      const delay = () => 1800 + Math.random() * 2200;
      const schedule = () => {
        timerRef.current = window.setTimeout(() => {
          pushNext();
          schedule();
        }, delay());
      };
      schedule();
    });

    return () => {
      cancelled = true;
      if (timerRef.current) window.clearTimeout(timerRef.current);
      timerRef.current = null;
    };
  }, [isActive, performer.feedKey, performer]);

  if (!isActive || items.length === 0) return null;

  return (
    <div
      className="pointer-events-none absolute left-3 right-[5.5rem] top-[4.25rem] z-[42] flex flex-col gap-1.5"
      aria-live="polite"
      aria-label="Live chat"
    >
      {items.map((item) => (
        <div
          key={item.id}
          className={`max-w-full truncate rounded-lg px-2.5 py-1.5 text-[11px] font-semibold leading-tight shadow-lg backdrop-blur-sm transition-all duration-300 ${
            item.kind === "chat"
              ? "bg-black/55 text-white/95"
              : "border border-[#39FF14]/50 bg-black/75 text-[#39FF14] shadow-[#39FF14]/20"
          }`}
        >
          {item.text}
        </div>
      ))}
    </div>
  );
}
