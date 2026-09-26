"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { getPublicTelegramBotUsername } from "@/lib/auth/telegramBotUsername";
import { verifyTelegramWidgetLogin } from "@/lib/auth/telegramClient";
import { rememberTelegramLoginReturnPath } from "@/lib/auth/telegramLoginReturn";
import { mountTelegramLoginWidget } from "@/lib/auth/telegramWidget";
import type { TelegramWidgetAuthPayload } from "@/lib/auth/verifyTelegram";
import type { TelegramUser } from "@/lib/auth/telegramSession";
import type { TelegramLoginPrompt } from "@/components/auth/telegramAuthTypes";
import { BodyPortal } from "@/components/layout/BodyPortal";
import { Z_MODAL_PANEL, Z_MODAL_SCRIM } from "@/lib/layout/zIndexLayers";

type TelegramLoginSheetProps = {
  open: boolean;
  prompt: TelegramLoginPrompt;
  onClose: () => void;
  onAuthenticated: (user: TelegramUser) => void;
};

export function TelegramLoginSheet({
  open,
  prompt,
  onClose,
  onAuthenticated,
}: TelegramLoginSheetProps) {
  const widgetRef = useRef<HTMLDivElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const botUsername = getPublicTelegramBotUsername();

  const title = prompt.title ?? "Continue with Telegram";
  const description =
    prompt.description ??
    prompt.reason ??
    "Sign in to save your activity and sync it across devices.";
  const ctaLabel = prompt.ctaLabel ?? "Continue with Telegram";
  const edgeAttached = prompt.edgeAttached ?? false;

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
    if (!open || !widgetRef.current || !botUsername) return;
    rememberTelegramLoginReturnPath();
    setError(null);
    const teardown = mountTelegramLoginWidget(
      widgetRef.current,
      botUsername,
      (auth) => {
        void handleAuth(auth);
      },
      { useRedirectAuth: true },
    );
    return teardown;
  }, [open, handleAuth, botUsername]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <BodyPortal>
      <button
        type="button"
        aria-label="Close"
        className="fixed inset-0 bg-black/30 transition-opacity duration-300 opacity-100"
        style={{ zIndex: Z_MODAL_SCRIM }}
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="telegram-login-sheet-title"
        className={`fixed bottom-0 left-0 right-0 mx-auto w-full max-w-md transform transition-transform duration-300 ease-out translate-y-0 ${
          edgeAttached ? "" : "px-3 pb-3"
        }`}
        style={{
          zIndex: Z_MODAL_PANEL,
          paddingBottom: edgeAttached
            ? "env(safe-area-inset-bottom, 0px)"
            : "max(1rem, env(safe-area-inset-bottom))",
        }}
      >
        <div
          className={
            edgeAttached
              ? "border-t border-white/10 bg-[#1C1C1E]/98 px-5 pb-5 pt-3 shadow-[0_-12px_48px_rgba(0,0,0,0.65)] backdrop-blur-xl rounded-t-2xl"
              : "rounded-3xl border border-white/10 bg-[#1C1C1E]/98 p-5 shadow-[0_-8px_40px_rgba(0,0,0,0.55)] backdrop-blur-xl"
          }
        >
          <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-zinc-600" />
          <h2
            id="telegram-login-sheet-title"
            className="text-center text-base font-black text-white"
          >
            {title}
          </h2>
          <p className="mt-2 text-center text-sm leading-relaxed text-zinc-400">
            {description}
          </p>

          <div className="mt-5 flex min-h-[52px] flex-col items-center justify-center gap-3">
            <p className="text-center text-xs font-bold uppercase tracking-wide text-[#2AABEE]">
              {ctaLabel}
            </p>
            {botUsername ? (
              <div ref={widgetRef} className="flex w-full justify-center" />
            ) : (
              <p className="text-center text-xs text-red-400">
                Telegram Login is not configured (missing bot username).
              </p>
            )}
            {busy ? (
              <p className="text-xs text-zinc-500">Verifying with Telegram…</p>
            ) : null}
            {error ? <p className="text-xs text-red-400">{error}</p> : null}
          </div>

          <button
            type="button"
            onClick={onClose}
            className="mt-4 w-full rounded-full py-2 text-xs font-semibold text-zinc-500 transition hover:text-zinc-300"
          >
            Not now
          </button>
        </div>
      </div>
    </BodyPortal>
  );
}
