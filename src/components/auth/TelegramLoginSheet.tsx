"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { verifyTelegramWidgetLogin } from "@/lib/auth/telegramClient";
import { mountTelegramLoginWidget } from "@/lib/auth/telegramWidget";
import type { TelegramWidgetAuthPayload } from "@/lib/auth/verifyTelegram";
import type { TelegramUser } from "@/lib/auth/telegramSession";

type TelegramLoginSheetProps = {
  open: boolean;
  reason: string;
  onClose: () => void;
  onAuthenticated: (user: TelegramUser) => void;
};

const BOT_USERNAME =
  process.env.NEXT_PUBLIC_TELEGRAM_BOT_USERNAME?.trim() || "NaughtyXXXcamsbot";

export function TelegramLoginSheet({
  open,
  reason,
  onClose,
  onAuthenticated,
}: TelegramLoginSheetProps) {
  const widgetRef = useRef<HTMLDivElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const handleAuth = useCallback(
    async (auth: TelegramWidgetAuthPayload) => {
      setBusy(true);
      setError(null);
      const user = await verifyTelegramWidgetLogin(auth);
      setBusy(false);
      if (!user) {
        setError("Telegram verification failed. Try again.");
        return;
      }
      onAuthenticated(user);
    },
    [onAuthenticated],
  );

  useEffect(() => {
    if (!open || !widgetRef.current || !BOT_USERNAME) return;
    setError(null);
    const teardown = mountTelegramLoginWidget(
      widgetRef.current,
      BOT_USERNAME,
      (auth) => {
        void handleAuth(auth);
      },
    );
    return teardown;
  }, [open, handleAuth]);

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
              Sync with Telegram (dev)
            </button>
          )}
          {busy ? (
            <p className="text-xs text-zinc-500">Verifying with Telegram…</p>
          ) : null}
          {error ? <p className="text-xs text-red-400">{error}</p> : null}
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
