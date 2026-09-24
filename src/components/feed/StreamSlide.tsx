"use client";

import Image from "next/image";
import {
  Bookmark,
  Heart,
  MessageCircle,
  Plus,
  Share2,
} from "lucide-react";
import type { StreamItem } from "@/data/mock";
import { formatViewers } from "@/data/mock";
import { SlushyBrandLogo } from "@/components/brand/SlushyBrandLogo";
import { useFeedLikes } from "@/hooks/useFeedLikes";

type StreamSlideProps = {
  stream: StreamItem;
  priority?: boolean;
};

export function StreamSlide({ stream, priority = false }: StreamSlideProps) {
  const doubledComments = [...stream.comments, ...stream.comments];
  const { liked, label, toggleLike } = useFeedLikes(stream.id);

  return (
    <article
      className="relative h-[100dvh] w-full shrink-0 snap-slide overflow-hidden bg-night"
      aria-label={`Live stream by ${stream.username}`}
    >
      <Image
        src={stream.image}
        alt=""
        fill
        priority={priority}
        sizes="100vw"
        className="object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-b from-black/55 via-black/10 to-black/80" />

      <header className="absolute left-0 right-0 top-0 z-20 flex items-start justify-between gap-3 p-4 pt-[max(1rem,env(safe-area-inset-top))]">
        <SlushyBrandLogo variant="compact" href="/" />
        <div
          className="rounded-full border border-white/10 bg-black/45 px-3 py-1.5 text-xs font-semibold backdrop-blur-sm"
          aria-label={`${stream.viewers} viewers`}
        >
          <span className="text-[#39FF14]">👁</span> {formatViewers(stream.viewers)}{" "}
          watching
        </div>
      </header>

      <button
        type="button"
        className="absolute left-1/2 top-1/2 z-20 -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/15 bg-black/55 px-5 py-2.5 text-sm font-medium text-white/90 backdrop-blur-md transition hover:bg-black/70"
        aria-label="Unmute stream"
      >
        🔇 Tap screen for sound
      </button>

      <aside
        className="absolute bottom-28 right-3 z-20 flex flex-col items-center gap-5"
        aria-label="Stream actions"
      >
        <div className="relative">
          <div className="h-12 w-12 overflow-hidden rounded-full border-2 border-white/80">
            <Image
              src={stream.avatar}
              alt={stream.displayName}
              width={48}
              height={48}
              className="h-full w-full object-cover"
            />
          </div>
          <button
            type="button"
            className="absolute -bottom-2 left-1/2 flex h-6 w-6 -translate-x-1/2 items-center justify-center rounded-full bg-[#39FF14] text-black shadow-[0_0_12px_#39FF14]"
            aria-label="Follow model"
          >
            <Plus className="h-4 w-4" strokeWidth={3} />
          </button>
        </div>
        <ActionIcon
          icon={Heart}
          label={label}
          active={liked}
          onClick={toggleLike}
        />
        <ActionIcon icon={MessageCircle} label="Chat" />
        <ActionIcon icon={Bookmark} label="Save" />
        <ActionIcon icon={Share2} label="Share" />
      </aside>

      <footer className="absolute bottom-[4.75rem] left-0 right-14 z-20 px-4">
        <p className="text-base font-extrabold tracking-tight">@{stream.username}</p>
        <p className="mt-0.5 text-sm text-white/75">
          {stream.displayName} · LIVE on Streamate
        </p>
        <div className="relative mt-3 h-16 overflow-hidden">
          <ul className="animate-marquee-up space-y-2 text-sm text-white/85">
            {doubledComments.map((text, i) => (
              <li key={`${stream.id}-c-${i}`} className="truncate">
                <span className="font-semibold text-[#39FF14]/90">fan_{i + 1}</span>{" "}
                {text}
              </li>
            ))}
          </ul>
        </div>
      </footer>
    </article>
  );
}

function ActionIcon({
  icon: Icon,
  label,
  active = false,
  onClick,
}: {
  icon: typeof Heart;
  label: string;
  active?: boolean;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex flex-col items-center gap-1 ${active ? "text-[#39FF14]" : "text-white/90"}`}
      aria-label={label}
      aria-pressed={active}
    >
      <span className="flex h-11 w-11 items-center justify-center rounded-full bg-black/35 backdrop-blur-sm">
        <Icon className={`h-6 w-6 ${active ? "fill-[#39FF14] text-[#39FF14]" : ""}`} />
      </span>
      <span className="text-[10px] font-medium">{label}</span>
    </button>
  );
}
