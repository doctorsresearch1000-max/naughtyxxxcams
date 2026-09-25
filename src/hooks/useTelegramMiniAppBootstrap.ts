"use client";

import { useEffect, useRef } from "react";
import { verifyTelegramMiniAppInitData } from "@/lib/auth/telegramClient";

type TelegramWebApp = {
  initData?: string;
  ready?: () => void;
  expand?: () => void;
};

declare global {
  interface Window {
    Telegram?: { WebApp?: TelegramWebApp };
  }
}

/**
 * Optional auto-login when the site is opened inside Telegram as a Mini App.
 * Does not load Bot API scripts — only reads WebApp initData if already present.
 */
export function useTelegramMiniAppBootstrap(
  onUser: (user: import("@/lib/auth/telegramSession").TelegramUser) => void,
  enabled: boolean,
) {
  const handledRef = useRef(false);

  useEffect(() => {
    if (!enabled) {
      handledRef.current = false;
      return;
    }
    if (handledRef.current) return;

    const tg = window.Telegram?.WebApp;
    if (!tg?.initData?.trim()) return;

    const run = async () => {
      tg.ready?.();
      tg.expand?.();
      const user = await verifyTelegramMiniAppInitData(tg.initData!);
      if (!user) return;
      handledRef.current = true;
      onUser(user);
    };

    void run();
  }, [enabled, onUser]);
}
