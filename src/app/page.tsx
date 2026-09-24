"use client";

import Image from "next/image";
import { useCallback, useRef, useState } from "react";
import CrackWidget from "@/components/cams/CrackWidget";
import { SoundUnlockPortal } from "@/components/feed/SoundUnlockPortal";

const FEED_HEIGHT = "calc(100dvh - 4rem)";

/** Slides del feed vertical (el widget Streamate ocupa el primero). */
const FEED_SLIDE_COUNT = 3;

export default function HomePage() {
  const scrollRef = useRef<HTMLDivElement>(null);
  /** CTA de sonido visible hasta que el usuario pulse Continuar. */
  const [showSoundCta, setShowSoundCta] = useState(true);
  /** Tras Continuar: un tap en el vídeo expone el iframe al gesto del usuario. */
  const [soundGateOpen, setSoundGateOpen] = useState(false);

  const dismissSoundCta = useCallback(() => {
    setShowSoundCta(false);
    setSoundGateOpen(true);
  }, []);

  return (
    <>
      <main
        className="pointer-events-auto relative mx-auto w-full max-w-md overflow-hidden bg-black text-white"
        style={{ height: FEED_HEIGHT }}
      >
        <header className="pointer-events-none absolute left-0 right-0 top-0 z-30 flex items-center justify-between px-4 pb-2 pt-4">
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
            <span className="text-zinc-200">113</span>
          </div>
        </header>

        <div
          ref={scrollRef}
          className="snap-feed hide-scrollbar h-full w-full overflow-y-auto overscroll-y-contain [-webkit-overflow-scrolling:touch]"
          style={{ touchAction: "pan-y" }}
        >
          {Array.from({ length: FEED_SLIDE_COUNT }, (_, index) => (
            <section
              key={index}
              className="pointer-events-none relative h-full w-full shrink-0 snap-slide overflow-hidden"
            >
              {index === 0 ? (
                <CrackWidget
                  cols={1}
                  rows={1}
                  number={15}
                  ratio={0.5625}
                  useFeed={1}
                  animateFeed={1}
                  smoothAnimation={1}
                  height="h-full"
                  captureScrollGestures
                  scrollRootRef={scrollRef}
                  soundGateOpen={soundGateOpen}
                  soundEnabled={false}
                  providers="streamate"
                />
              ) : (
                <div className="flex h-full w-full flex-col items-center justify-center bg-gradient-to-b from-zinc-900 to-black px-6 text-center">
                  <p className="text-sm font-bold text-pink-400">Siguiente en el feed</p>
                  <p className="mt-2 text-xs text-zinc-500">
                    Desliza hacia arriba — el scroll no lo captura el iframe
                  </p>
                </div>
              )}

              {index === 0 && (
                <>
                  <div className="pointer-events-none absolute inset-0 z-20">
                    <div className="absolute bottom-4 left-4 flex flex-col gap-1">
                      <div className="flex max-w-[200px] items-center gap-2 rounded-full border border-white/10 bg-black/60 px-3 py-1 text-xs text-zinc-200 backdrop-blur-md">
                        <span className="h-2 w-2 rounded-full bg-emerald-400" />
                        <span className="truncate">
                          deep_tipper: Estás hecha una diosa
                        </span>
                      </div>
                      <span className="text-sm font-extrabold text-white drop-shadow-md">
                        @ElhaSky
                      </span>
                    </div>
                  </div>

                  <div className="pointer-events-none absolute bottom-0 right-0 top-0 z-30 w-[4.5rem]">
                    <div className="pointer-events-auto absolute bottom-4 right-3 flex flex-col items-center gap-4">
                      <div className="relative mb-2">
                        <div className="h-12 w-12 overflow-hidden rounded-full border-2 border-pink-500 bg-black p-0.5 shadow-lg shadow-pink-500/30">
                          <Image
                            src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100"
                            alt="Avatar"
                            width={48}
                            height={48}
                            className="h-full w-full rounded-full object-cover"
                          />
                        </div>
                        <button
                          type="button"
                          className="absolute -bottom-1 left-1/2 flex h-5 w-5 -translate-x-1/2 items-center justify-center rounded-full bg-gradient-to-r from-pink-500 to-rose-600 text-xs font-black text-white shadow-md"
                        >
                          +
                        </button>
                      </div>

                      <button
                        type="button"
                        className="flex flex-col items-center gap-0.5 text-[10px] font-medium text-white transition-transform active:scale-90"
                      >
                        <span className="text-2xl">💖</span>
                        <span className="font-bold text-zinc-300">24.5k</span>
                      </button>
                      <button
                        type="button"
                        className="flex flex-col items-center gap-0.5 text-[10px] font-medium text-white transition-transform active:scale-90"
                      >
                        <span className="text-2xl">💬</span>
                        <span className="font-bold text-zinc-300">Chat</span>
                      </button>
                      <button
                        type="button"
                        className="flex flex-col items-center gap-0.5 text-[10px] font-medium text-white transition-transform active:scale-90"
                      >
                        <span className="text-2xl">⭐</span>
                        <span className="font-bold text-zinc-300">Guardar</span>
                      </button>
                      <button
                        type="button"
                        className="flex flex-col items-center gap-0.5 text-[10px] font-medium text-white transition-transform active:scale-90"
                      >
                        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-tr from-pink-600 to-purple-600 text-base text-white shadow-lg shadow-pink-600/30">
                          🚀
                        </div>
                        <span className="font-bold text-zinc-300">Enviar</span>
                      </button>
                    </div>
                  </div>
                </>
              )}
            </section>
          ))}
        </div>
      </main>

      <SoundUnlockPortal visible={showSoundCta} onUnlock={dismissSoundCta} />
    </>
  );
}
