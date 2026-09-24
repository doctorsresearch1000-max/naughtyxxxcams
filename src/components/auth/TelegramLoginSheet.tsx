"use client";

import { useEffect, useRef } from "react";

type TelegramLoginSheetProps = {
  open: boolean;
  reason: string;
  onClose: () => void;
  onAuthenticated: (user: {
    id: number;
    first_name: string;
    username?: string;
    photo_url?: string;
  }) => void;
};

declare global {
  interface Window {
    onTelegramAuth?: (user: {
      id: number;
      first_name: string;
      last_name?: string;
      username?: string;
      photo_url?: string;
    }) => void;
  }
}

const BOT_USERNAME = process.env.NEXT_PUBLIC_TELEGRAM_BOT_USERNAME?.trim();

export function TelegramLoginSheet({
  open,
  reason,
  onClose,
  onAuthenticated,
}: TelegramLoginSheetProps) {
  const widgetRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;

    window.onTelegramAuth = (user) => {
      onAuthenticated(user);
    };

    if (!BOT_USERNAME || !widgetRef.current) return;

    widgetRef.current.innerHTML = "";
    const script = document.createElement("script");
    script.src = "https://telegram.org/js/telegram-widget.js?22";
    script.async = true;
    script.setAttribute("data-telegram-login", BOT_USERNAME);
    script.setAttribute("data-size", "large");
    script.setAttribute("data-radius", "12");
    script.setAttribute("data-onauth", "onTelegramAuth(user)");
    script.setAttribute("data-request-access", "write");
    widgetRef.current.appendChild(script);

    return () => {
      delete window.onTelegramAuth;
    };
  }, [open, onAuthenticated]);

  if (!open) return null;

  const mockSync = () => {
    const id = Math.floor(10_000_000 + Math.random() * 89_999_999);
    onAuthenticated({
      id,
      first_name: "Telegram",
      username: `user_${id}`,
    });
  };

  return (
    <div className="fixed inset-0 z-[100002] flex items-end justify-center bg-black/70 p-4 sm:items-center">
      <div
        className="w-full max-w-sm rounded-2xl border border-white/10 bg-[#1C1C1E] p-5 shadow-2xl"
        role="dialog"
        aria-modal="true"
      >
        <h2 className="text-lg font-bold text-white">Telegram Login</h2>
        <p className="mt-2 text-sm text-zinc-400">{reason}</p>
        <p className="mt-3 text-xs text-zinc-500">
          Likes, bookmarks, and playlists require Telegram sync so your
          activity follows you across devices.
        </p>

        <div className="mt-5 flex min-h-[48px] flex-col items-center justify-center gap-3">
          {BOT_USERNAME ? (
            <div ref={widgetRef} />
          ) : (
            <button
              type="button"
              onClick={mockSync}
              className="w-full rounded-full bg-[#2AABEE] py-3 text-sm font-bold text-white transition active:scale-[0.98]"
            >
              Sync with Telegram
            </button>
          )}
        </div>

        <button
          type="button"
          onClick={onClose}
          className="mt-4 w-full rounded-full border border-zinc-700 py-2.5 text-sm font-semibold text-zinc-300"
        >
          Not now
        </button>
      </div>
    </div>
  );
}
