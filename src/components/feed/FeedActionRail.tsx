"use client";

import { FeedPoster } from "@/components/feed/FeedPoster";

type FeedActionRailProps = {
  feedKey: string;
  posterUrl: string;
  isActive: boolean;
  muted: boolean;
  onToggleMute: () => void;
};

export function FeedActionRail({
  feedKey,
  posterUrl,
  isActive,
  muted,
  onToggleMute,
}: FeedActionRailProps) {
  if (!isActive) return null;

  return (
    <div className="pointer-events-none absolute bottom-0 right-0 top-0 z-[45] w-[4.75rem]">
      <div className="pointer-events-auto absolute bottom-4 right-3 flex flex-col items-center gap-4">
        <button
          type="button"
          onClick={onToggleMute}
          className="flex h-10 w-10 items-center justify-center rounded-full border border-white/15 bg-black/70 text-base shadow-lg backdrop-blur-sm"
          aria-label={muted ? "Activar sonido" : "Silenciar"}
        >
          {muted ? "🔇" : "🔊"}
        </button>

        <div className="relative mb-1">
          <div className="h-12 w-12 overflow-hidden rounded-full border-2 border-pink-500 bg-black p-0.5 shadow-lg shadow-pink-500/30">
            <FeedPoster
              feedKey={`${feedKey}-avatar`}
              posterUrl={posterUrl}
              className="h-full w-full rounded-full object-cover"
            />
          </div>
          <button
            type="button"
            className="absolute -bottom-1 left-1/2 flex h-5 w-5 -translate-x-1/2 items-center justify-center rounded-full bg-gradient-to-r from-pink-500 to-rose-600 text-xs font-black text-white shadow-md"
            aria-label="Seguir"
          >
            +
          </button>
        </div>

        <ActionButton icon="💖" label="24.5k" />
        <ActionButton icon="💬" label="Chat" />
        <ActionButton icon="⭐" label="Guardar" />
        <ActionButton
          icon="🚀"
          label="Enviar"
          variant="circle"
        />
      </div>
    </div>
  );
}

function ActionButton({
  icon,
  label,
  variant = "default",
}: {
  icon: string;
  label: string;
  variant?: "default" | "circle";
}) {
  return (
    <button
      type="button"
      className="flex flex-col items-center gap-0.5 text-[10px] font-medium text-white transition-transform active:scale-90"
    >
      {variant === "circle" ? (
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-tr from-pink-600 to-purple-600 text-base text-white shadow-lg shadow-pink-600/30">
          {icon}
        </div>
      ) : (
        <span className="text-2xl">{icon}</span>
      )}
      <span className="font-bold text-zinc-300">{label}</span>
    </button>
  );
}
