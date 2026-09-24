"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { FeedPerformer } from "@/lib/feed/filterPerformers";
import { detectStreamCommentLocale } from "@/lib/engagement/streamCommentLocale";
import {
  getLiveCommentPoolsSync,
  LiveCommentScheduler,
  loadLiveCommentPools,
  type LiveCommentItem,
} from "@/lib/engagement/liveCommentEngine";

type LiveCommentTickerProps = {
  performer: FeedPerformer;
  isActive: boolean;
};

const MAX_VISIBLE = 5;

export function LiveCommentTicker({
  performer,
  isActive,
}: LiveCommentTickerProps) {
  const [items, setItems] = useState<LiveCommentItem[]>([]);
  const schedulerRef = useRef<LiveCommentScheduler | null>(null);
  const timerRef = useRef<number | null>(null);
  const commentLocale = useMemo(
    () => detectStreamCommentLocale(performer),
    [performer.feedKey, performer.characteristic?.languages],
  );

  useEffect(() => {
    if (!isActive) {
      setItems([]);
      schedulerRef.current = null;
      if (timerRef.current) window.clearTimeout(timerRef.current);
      timerRef.current = null;
      return;
    }

    let cancelled = false;

    const startScheduler = (pools: ReturnType<typeof getLiveCommentPoolsSync>) => {
      if (cancelled) return;
      schedulerRef.current = new LiveCommentScheduler(pools, commentLocale);

      const pushNext = () => {
        const sched = schedulerRef.current;
        if (!sched) return;
        const next = sched.next();
        setItems((prev) => [next, ...prev].slice(0, MAX_VISIBLE));
      };

      pushNext();
      const schedule = () => {
        const wait = 1400 + Math.random() * 1800;
        timerRef.current = window.setTimeout(() => {
          pushNext();
          schedule();
        }, wait);
      };
      schedule();
    };

    startScheduler(getLiveCommentPoolsSync());
    void loadLiveCommentPools()
      .then((pools) => {
        if (cancelled) return;
        schedulerRef.current = new LiveCommentScheduler(pools, commentLocale);
      })
      .catch(() => {
        /* bundled pools already running */
      });

    return () => {
      cancelled = true;
      if (timerRef.current) window.clearTimeout(timerRef.current);
      timerRef.current = null;
    };
  }, [isActive, performer.feedKey, commentLocale]);

  if (!isActive) return null;

  return (
    <div
      className="pointer-events-none absolute inset-x-3 top-[calc(var(--app-header-height,3.5rem)+2.75rem)] z-[55] flex max-h-[38%] flex-col gap-1.5 overflow-hidden sm:right-[5.5rem]"
      aria-live="polite"
      aria-label="Live chat"
      data-live-comment-ticker="true"
    >
      {items.length === 0 ? (
        <div
          className="max-w-[min(100%,18rem)] truncate rounded-lg bg-black/50 px-2.5 py-1.5 text-[11px] font-semibold text-white/80 backdrop-blur-sm"
          aria-hidden
        >
          Live chat…
        </div>
      ) : null}
      {items.map((item) => (
        <div
          key={item.id}
          className={`max-w-[min(100%,20rem)] truncate rounded-lg px-2.5 py-1.5 text-[11px] font-semibold leading-tight shadow-lg backdrop-blur-md ${
            item.kind === "chat"
              ? "bg-black/60 text-white/95"
              : "border border-[#39FF14]/60 bg-black/80 text-[#39FF14] shadow-[0_0_12px_rgba(57,255,20,0.25)]"
          }`}
          data-comment-kind={item.kind}
        >
          {item.text}
        </div>
      ))}
    </div>
  );
}
