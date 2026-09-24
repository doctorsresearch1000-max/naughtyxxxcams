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
      <div className="h-52 animate-pulse rounded-2xl bg-[#1C1C1E]" aria-hidden />
    );
  }

  if (!entry) {
    return (
      <article
        className="rounded-2xl border border-dashed border-white/15 bg-[#1C1C1E] p-6 text-center"
      >
        <p className="text-sm text-zinc-400">
          No recent live streams yet. Browse the home feed and we&apos;ll save
          your last room here.
        </p>
        <Link
          href="/"
          className="mt-4 inline-flex rounded-full bg-[#39FF14] px-5 py-2.5 text-sm font-extrabold text-black transition active:scale-[0.98]"
        >
          Go to live feed
        </Link>
      </article>
    );
  }

  const handle = performerDisplayHandle(entry.nameClean || entry.name);

  return (
    <article className="overflow-hidden rounded-2xl border border-white/10 bg-[#1C1C1E]">
      <div className="relative h-36 w-full">
        <Image
          src={entry.posterUrl}
          alt={handle}
          fill
          sizes="(max-width: 448px) 100vw, 400px"
          className="object-cover"
          unoptimized
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent" />
        <div className="absolute bottom-3 left-3">
          <p className="font-bold">{handle}</p>
          <p className="text-[11px] text-zinc-300">
            Last watched {formatLastWatchedLabel(entry.watchedAt)}
          </p>
        </div>
      </div>
      <div className="p-3">
        <button
          type="button"
          onClick={handleResume}
          className="w-full rounded-full bg-[#39FF14] py-3 text-sm font-extrabold text-black transition active:scale-[0.98]"
        >
          Resume watching
        </button>
      </div>
    </article>
  );
}
