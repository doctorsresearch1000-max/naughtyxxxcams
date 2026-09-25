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

    const run = async () => {
      const tg = window.Telegram?.WebApp;
      if (!tg?.initData?.trim()) return;

      tg.ready?.();
      tg.expand?.();

      const user = await verifyTelegramMiniAppInitData(tg.initData);
      if (!user) return;
      handledRef.current = true;
      onUser(user);
    };

    if (window.Telegram?.WebApp) {
      void run();
      return;
    }

    const existing = document.querySelector(
      'script[src*="telegram-web-app.js"]',
    );
    if (existing) {
      existing.addEventListener("load", () => void run(), { once: true });
      return;
    }

    const script = document.createElement("script");
    script.src = "https://telegram.org/js/telegram-web-app.js";
    script.async = true;
    script.addEventListener("load", () => void run(), { once: true });
    document.head.appendChild(script);
  }, [enabled, onUser]);
}
