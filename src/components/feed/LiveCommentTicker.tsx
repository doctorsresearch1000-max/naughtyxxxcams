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

const MAX_VISIBLE = 3;

export function LiveCommentTicker({
  performer,
  isActive,
}: LiveCommentTickerProps) {
  const [items, setItems] = useState<LiveCommentItem[]>([]);
  const schedulerRef = useRef<LiveCommentScheduler | null>(null);
  const timerRef = useRef<number | null>(null);
  const commentLocale = useMemo(
    () => detectStreamCommentLocale(performer),
    [performer],
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

    const startScheduler = (
      pools: ReturnType<typeof getLiveCommentPoolsSync>,
    ) => {
      if (cancelled) return;
      schedulerRef.current = new LiveCommentScheduler(pools, commentLocale);

      const pushNext = () => {
        const sched = schedulerRef.current;
        if (!sched) return;
        const next = sched.next();
        setItems((prev) => [...prev, next].slice(-MAX_VISIBLE));
      };

      pushNext();
      pushNext();
      const schedule = () => {
        const wait = 2200 + Math.random() * 2600;
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
      className="mb-2 flex w-full max-w-[min(100%,17.5rem)] flex-col gap-1"
      aria-live="polite"
      aria-label="Live chat"
      data-live-comment-ticker="true"
    >
      {items.map((item) => (
        <div
          key={item.id}
          className="flex items-start gap-2 text-left leading-snug drop-shadow-[0_1px_2px_rgba(0,0,0,0.85)]"
          data-comment-kind={item.kind}
        >
          <span
            className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[9px] font-black text-black"
            style={{ backgroundColor: item.badgeColor }}
            aria-hidden
          >
            {item.badgeLabel}
          </span>
          <p className="min-w-0 text-[12px]">
            <span className="font-bold text-white">{item.username}</span>
            <span
              className={
                item.kind === "chat"
                  ? " font-medium text-white/95"
                  : " font-semibold text-[#39FF14]"
              }
            >
              {" "}
              {item.message}
            </span>
          </p>
        </div>
      ))}
    </div>
  );
}
