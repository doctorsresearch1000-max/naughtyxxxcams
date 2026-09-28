"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";
import type { FeedPerformer } from "@/lib/feed/filterPerformers";
import { formatExploreViews } from "@/lib/explore/exploreGrid";
import {
  estimateViewerCount,
  formatViewerCount,
} from "@/lib/feed/viewerCount";
import { performerDisplayTags } from "@/lib/desktop/performerCatalogMeta";
import { useDebouncedHover } from "@/hooks/useDebouncedHover";
import { useInView } from "@/hooks/useInView";
import { performerDisplayHandle } from "@/lib/profile/performerHandle";

type ExploreDesktopGridCardProps = {
  performer: FeedPerformer;
  onSelect: () => void;
};

export function ExploreDesktopGridCard({
  performer,
  onSelect,
}: ExploreDesktopGridCardProps) {
  const [rootRef, inView] = useInView<HTMLDivElement>({
    rootMargin: "320px 0px",
  });
  const { active: hoverPreview, onPointerEnter, onPointerLeave } =
    useDebouncedHover(150);
  const iframeRef = useRef<HTMLIFrameElement | null>(null);

  const handle = performerDisplayHandle(
    performer.nameClean || performer.name,
  );
  const views = formatExploreViews(performer);
  const viewers = formatViewerCount(
    estimateViewerCount(performer, performer.feedKey),
  );
  const tags = performerDisplayTags(performer).slice(0, 3);
  const previewSrc =
    performer.embedPlan.playerSrcMuted ??
    performer.embedPlan.outerEmbedSrc ??
    null;
  const isLive = performer.live !== false;

  useEffect(() => {
    if (!hoverPreview || !inView) return;
    const iframe = iframeRef.current;
    if (!iframe || !previewSrc) return;
    if (iframe.src !== previewSrc) {
      iframe.src = previewSrc;
    }
  }, [hoverPreview, inView, previewSrc]);

  useEffect(() => {
    if (hoverPreview && inView) return;
    const iframe = iframeRef.current;
    if (!iframe) return;
    try {
      iframe.src = "about:blank";
    } catch {
      /* ignore */
    }
  }, [hoverPreview, inView]);

  if (!inView) {
    return (
      <div
        ref={rootRef}
        className="aspect-[9/16] w-full rounded-xl bg-zinc-900/70 ring-1 ring-white/[0.04]"
        aria-hidden
      />
    );
  }

  return (
    <div ref={rootRef} className="w-full">
      <button
        type="button"
        onClick={onSelect}
        onMouseEnter={onPointerEnter}
        onMouseLeave={onPointerLeave}
        onFocus={onPointerEnter}
        onBlur={onPointerLeave}
        className="group relative flex w-full flex-col overflow-hidden rounded-xl bg-[#1C1C1E] text-left ring-1 ring-white/[0.06] transition hover:ring-[#39FF14]/45 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#39FF14]"
      >
        <div className="relative aspect-[9/16] w-full overflow-hidden bg-zinc-900">
          <Image
            src={performer.posterUrl}
            alt={handle}
            fill
            sizes="(min-width:1536px) 20vw, (min-width:1024px) 25vw, 50vw"
            className={`object-cover transition duration-300 ${
              hoverPreview && previewSrc ? "opacity-0" : "opacity-100"
            }`}
            unoptimized
          />

          {previewSrc ? (
            <iframe
              ref={iframeRef}
              title={`${handle} preview`}
              className={`pointer-events-none absolute inset-0 h-full w-full border-0 bg-black transition-opacity duration-300 ${
                hoverPreview ? "opacity-100" : "opacity-0"
              }`}
              allow="autoplay; encrypted-media"
              loading="lazy"
              referrerPolicy="strict-origin-when-cross-origin"
            />
          ) : null}

          {isLive ? (
            <span className="absolute left-2 top-2 animate-pulse rounded-md bg-[#39FF14] px-2 py-0.5 text-[10px] font-black uppercase tracking-wide text-black shadow-[0_0_12px_rgba(57,255,20,0.5)]">
              Live
            </span>
          ) : null}

          <div className="absolute right-2 top-2 rounded-md bg-black/60 px-2 py-0.5 text-[10px] font-bold text-white">
            {viewers}
          </div>

          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 via-black/45 to-transparent px-2.5 pb-2.5 pt-10">
            <p className="truncate text-sm font-extrabold text-white">{handle}</p>
            <p className="mt-0.5 text-[10px] font-semibold text-zinc-300">
              {views} views
            </p>
            {tags.length > 0 ? (
              <div className="mt-1.5 flex flex-wrap gap-1">
                {tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded bg-zinc-950/70 px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wide text-[#39FF14]"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            ) : null}
          </div>
        </div>
      </button>
    </div>
  );
}
