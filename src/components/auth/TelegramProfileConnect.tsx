"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import { useTelegramAuth } from "@/components/auth/TelegramAuthProvider";
import { mountTelegramLoginWidget } from "@/lib/auth/telegramWidget";
import { verifyTelegramWidgetLogin } from "@/lib/auth/telegramClient";
import type { TelegramWidgetAuthPayload } from "@/lib/auth/verifyTelegram";

const BOT_USERNAME =
  process.env.NEXT_PUBLIC_TELEGRAM_BOT_USERNAME?.trim() || "NaughtyXXXcamsbot";

export function TelegramProfileConnect() {
  const { user, isAuthenticated, login, logout, completeLoginVerified } =
    useTelegramAuth();
  const widgetRef = useRef<HTMLDivElement>(null);
  const [widgetError, setWidgetError] = useState<string | null>(null);
  const [verifying, setVerifying] = useState(false);

  const onWidgetAuth = useCallback(
    async (auth: TelegramWidgetAuthPayload) => {
      setVerifying(true);
      setWidgetError(null);
      const verified = await verifyTelegramWidgetLogin(auth);
      setVerifying(false);
      if (!verified) {
        setWidgetError("Could not verify Telegram login. Try again.");
        return;
      }
      completeLoginVerified(verified);
    },
    [completeLoginVerified],
  );

  useEffect(() => {
    if (isAuthenticated || !widgetRef.current) return;
    if (!BOT_USERNAME) return;

    const teardown = mountTelegramLoginWidget(
      widgetRef.current,
      BOT_USERNAME,
      (auth) => {
        void onWidgetAuth(auth);
      },
    );
    return teardown;
  }, [isAuthenticated, onWidgetAuth]);

  const avatarSrc =
    user?.photo_url ??
    `https://api.dicebear.com/7.x/shapes/svg?seed=${user?.id ?? "guest"}`;

  return (
    <section
      className="mt-4 rounded-2xl border border-white/10 bg-[#1C1C1E] p-4"
      aria-label="Telegram account"
    >
      {isAuthenticated && user ? (
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Image
              src={avatarSrc}
              alt=""
              width={40}
              height={40}
              className="h-10 w-10 rounded-full object-cover ring-2 ring-[#2AABEE]/50"
              unoptimized
            />
            <div>
              <p className="text-sm font-bold text-white">{user.first_name}</p>
              <p className="text-xs text-zinc-400">
                {user.username ? `@${user.username}` : `ID ${user.id}`}
              </p>
              <p className="mt-0.5 text-[10px] font-medium text-[#39FF14]">
                Synced · likes & collections saved on this device
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={logout}
            className="shrink-0 rounded-xl border border-zinc-700 bg-zinc-800 px-3 py-1.5 text-xs font-semibold text-zinc-200 hover:border-[#39FF14]/40"
          >
            Log out
          </button>
        </div>
      ) : (
        <div className="flex flex-col items-stretch gap-3">
          <p className="text-xs leading-relaxed text-zinc-400">
            Sign in with Telegram to save likes, bookmarks, following, and
            playlists. In the{" "}
            <span className="text-zinc-200">Telegram Mini App</span>, you are
            signed in automatically when opened from the bot.
          </p>
          <div
            ref={widgetRef}
            className="flex min-h-[52px] items-center justify-center"
          />
          {!BOT_USERNAME ? (
            <button
              type="button"
              onClick={login}
              className="rounded-full bg-[#2AABEE] py-3 text-sm font-bold text-white"
            >
              Open Telegram login
            </button>
          ) : null}
          {verifying ? (
            <p className="text-center text-xs text-zinc-500">Verifying…</p>
          ) : null}
          {widgetError ? (
            <p className="text-center text-xs text-red-400">{widgetError}</p>
          ) : null}
        </div>
      )}
    </section>
  );
}
