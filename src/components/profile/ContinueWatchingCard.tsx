"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  formatLastWatchedLabel,
  readContinueWatching,
  RESUME_FEED_QUERY,
  type ContinueWatchingEntry,
} from "@/lib/feed/continueWatchingStorage";
import { performerDisplayHandle } from "@/lib/profile/performerHandle";

export function ContinueWatchingCard() {
  const router = useRouter();
  const [entry, setEntry] = useState<ContinueWatchingEntry | null>(null);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setEntry(readContinueWatching());
    setHydrated(true);
  }, []);

  const handleResume = () => {
    if (!entry) return;
    const params = new URLSearchParams();
    params.set(RESUME_FEED_QUERY, entry.feedKey);
    router.push(`/?${params.toString()}`);
  };

  if (!hydrated) {
    return (
      <div className="space-y-3" aria-hidden>
        <div className="h-[4.5rem] animate-pulse rounded-2xl bg-[#1C1C1E]" />
        <div className="h-11 animate-pulse rounded-full bg-[#1C1C1E]" />
      </div>
    );
  }

  if (!entry) {
    return (
      <div className="space-y-3">
        <article
          className="rounded-2xl border border-dashed border-white/10 bg-[#141414] px-4 py-5 text-center"
        >
          <p className="text-sm text-zinc-500">
            No recent streams. Watch live on Home and we&apos;ll remember your
            last room here.
          </p>
        </article>
        <Link
          href="/"
          className="flex w-full items-center justify-center rounded-full bg-[#2A2A2E] py-3.5 text-sm font-semibold text-white transition active:scale-[0.99]"
        >
          Go to live feed
        </Link>
      </div>
    );
  }

  const handle = performerDisplayHandle(entry.nameClean || entry.name);
  const handleWithAt = handle.startsWith("@") ? handle : `@${handle.replace(/^@+/, "")}`;

  return (
    <div className="space-y-3">
      <article
        className="flex items-center gap-3 rounded-2xl bg-[#1C1C1E] px-3 py-3"
      >
        <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-full ring-1 ring-white/10">
          <Image
            src={entry.posterUrl}
            alt={handle}
            fill
            sizes="56px"
            className="object-cover"
            unoptimized
          />
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-bold text-white">{handleWithAt}</p>
          <p className="mt-0.5 text-xs text-zinc-500">
            Last watched {formatLastWatchedLabel(entry.watchedAt)}
          </p>
        </div>
      </article>
      <button
        type="button"
        onClick={handleResume}
        className="w-full rounded-full bg-[#2A2A2E] py-3.5 text-sm font-semibold text-white transition active:scale-[0.99]"
      >
        Resume Watching
      </button>
    </div>
  );
}
