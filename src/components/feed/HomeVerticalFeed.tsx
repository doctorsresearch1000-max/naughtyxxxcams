"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import CrackWidget from "@/components/cams/CrackWidget";
import { SoundUnlockPortal } from "@/components/feed/SoundUnlockPortal";
import type { CrackPerformer } from "@/lib/crackrevenue/api";
import { getPerformerKey, pickCoverUrl } from "@/lib/crackrevenue/api";

const FEED_HEIGHT = "calc(100dvh - 4rem)";

function performerLabel(p: CrackPerformer): string {
  const name = p.nameClean || p.name;
  return name ? `@${name.replace(/\s+/g, "")}` : "@modelo";
}

export function HomeVerticalFeed() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [performers, setPerformers] = useState<CrackPerformer[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [liveIndex, setLiveIndex] = useState<number | null>(null);
  const [showSoundCta, setShowSoundCta] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/performers", { cache: "no-store" });
        const json = (await res.json()) as { performers?: CrackPerformer[] };
        if (cancelled) return;
        const list = Array.isArray(json.performers) ? json.performers : [];
        setPerformers(list.length > 0 ? list : []);
      } catch {
        if (!cancelled) setPerformers([]);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const slideCount = Math.max(performers.length, 1);

  const updateActiveIndex = useCallback(() => {
    const root = scrollRef.current;
    if (!root) return;
    const h = root.clientHeight;
    if (h <= 0) return;
    const idx = Math.round(root.scrollTop / h);
    setActiveIndex(Math.min(Math.max(idx, 0), slideCount - 1));
  }, [slideCount]);

  useEffect(() => {
    const root = scrollRef.current;
    if (!root) return;
    const onScroll = () => {
      updateActiveIndex();
      if (liveIndex !== null) {
        const h = root.clientHeight;
        const idx = Math.round(root.scrollTop / h);
        if (idx !== liveIndex) {
          setLiveIndex(null);
          setShowSoundCta(false);
        }
      }
    };
    root.addEventListener("scroll", onScroll, { passive: true });
    return () => root.removeEventListener("scroll", onScroll);
  }, [liveIndex, updateActiveIndex]);

  const startLive = useCallback(() => {
    setLiveIndex(activeIndex);
    setShowSoundCta(true);
  }, [activeIndex]);

  const dismissSoundCta = useCallback(() => {
    setShowSoundCta(false);
  }, []);

  const slides: CrackPerformer[] =
    performers.length > 0
      ? performers
      : [
          {
            name: "ElhaSky",
            nameClean: "ElhaSky",
            itemId: "placeholder-1",
          },
          {
            name: "LunaRose",
            nameClean: "LunaRose",
            itemId: "placeholder-2",
          },
          {
            name: "MiaVelvet",
            nameClean: "MiaVelvet",
            itemId: "placeholder-3",
          },
        ];

  return (
    <>
      <main
        className="relative mx-auto w-full max-w-md overflow-hidden bg-black text-white"
        style={{ height: FEED_HEIGHT }}
      >
        <header className="pointer-events-none absolute left-0 right-0 top-0 z-40 flex items-center justify-between px-4 pb-2 pt-4">
          <div className="pointer-events-auto flex items-center gap-1 text-lg font-black tracking-wider text-pink-500 drop-shadow-[0_0_12px_rgba(236,72,153,0.5)]">
            <span>Naughty</span>
            <span className="rounded-md bg-pink-600 px-1.5 py-0.5 text-xs tracking-normal text-white">
              XXX
            </span>
          </div>
          <div className="pointer-events-auto flex items-center gap-2 rounded-full border border-pink-500/30 bg-black/70 px-3 py-1 text-xs font-bold shadow-lg backdrop-blur-md">
            <span className="h-2 w-2 animate-pulse rounded-full bg-pink-500" />
            <span className="text-[10px] uppercase tracking-wider text-pink-400">
              LIVE
            </span>
            <span className="text-zinc-600">|</span>
            <span className="text-zinc-200">{slides.length}</span>
          </div>
        </header>

        <div
          ref={scrollRef}
          className="hide-scrollbar h-full w-full overflow-y-auto snap-y snap-mandatory touch-pan-y overscroll-y-contain [-webkit-overflow-scrolling:touch]"
        >
          {slides.map((performer, index) => {
            const cover = pickCoverUrl(performer);
            const isLive = liveIndex === index;
            const key = getPerformerKey(performer);

            return (
              <section
                key={key}
                className="relative w-full shrink-0 snap-start overflow-hidden"
                style={{ height: FEED_HEIGHT }}
              >
                {cover ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={cover}
                    alt=""
                    className="absolute inset-0 h-full w-full object-cover"
                    loading={index < 2 ? "eager" : "lazy"}
                  />
                ) : (
                  <div className="absolute inset-0 bg-gradient-to-b from-zinc-900 via-black to-zinc-950" />
                )}

                <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/70" />

                {isLive && (
                  <div className="absolute inset-0 z-10">
                    <CrackWidget
                      cols={1}
                      rows={1}
                      number={12}
                      ratio={0.5625}
                      useFeed={1}
                      animateFeed={1}
                      smoothAnimation={1}
                      height="h-full"
                      internalVerticalFeed
                      interactive={!showSoundCta}
                      soundEnabled={false}
                      providers="streamate"
                    />
                  </div>
                )}

                <div className="pointer-events-none absolute bottom-4 left-4 z-20 flex flex-col gap-1">
                  <span className="text-sm font-extrabold text-white drop-shadow-md">
                    {performerLabel(performer)}
                  </span>
                  <span className="text-[10px] font-semibold uppercase tracking-widest text-pink-400">
                    {isLive ? "Transmisión activa" : "Desliza · siguiente modelo"}
                  </span>
                </div>

                <div className="pointer-events-none absolute bottom-0 right-0 top-0 z-30 w-[4.5rem]">
                  <div className="pointer-events-auto absolute bottom-4 right-3 flex flex-col items-center gap-4">
                    <div className="relative mb-2">
                      <div className="h-12 w-12 overflow-hidden rounded-full border-2 border-pink-500 bg-black p-0.5 shadow-lg shadow-pink-500/30">
                        {cover ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={cover}
                            alt=""
                            className="h-full w-full rounded-full object-cover"
                          />
                        ) : (
                          <Image
                            src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100"
                            alt="Avatar"
                            width={48}
                            height={48}
                            className="h-full w-full rounded-full object-cover"
                          />
                        )}
                      </div>
                    </div>

                    {!isLive && index === activeIndex && (
                      <button
                        type="button"
                        onClick={startLive}
                        className="rounded-full bg-gradient-to-r from-pink-600 to-rose-600 px-2 py-2 text-[10px] font-black uppercase tracking-wide text-white shadow-lg shadow-pink-600/40"
                      >
                        Ver LIVE
                      </button>
                    )}

                    {isLive && (
                      <button
                        type="button"
                        onClick={() => {
                          setLiveIndex(null);
                          setShowSoundCta(false);
                        }}
                        className="rounded-full border border-white/20 bg-black/70 px-2 py-1.5 text-[10px] font-bold text-zinc-200"
                      >
                        Salir
                      </button>
                    )}
                  </div>
                </div>
              </section>
            );
          })}
        </div>
      </main>

      <SoundUnlockPortal visible={showSoundCta} onUnlock={dismissSoundCta} />
    </>
  );
}
