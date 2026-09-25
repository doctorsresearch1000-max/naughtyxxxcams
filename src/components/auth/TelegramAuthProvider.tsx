"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  normalizeLoginPrompt,
  type TelegramLoginPrompt,
} from "@/components/auth/telegramAuthTypes";
import {
  readSyncToken,
  readTelegramUser,
  writeTelegramUser,
  type TelegramUser,
} from "@/lib/auth/telegramSession";
import { TelegramLoginSheet } from "@/components/auth/TelegramLoginSheet";
import { useTelegramMiniAppBootstrap } from "@/hooks/useTelegramMiniAppBootstrap";
import {
  mergeUserLibraries,
  pullTelegramLibrary,
  syncTelegramLibraryAfterLogin,
} from "@/lib/telegram/telegramLibraryClient";
import { readUserLibrary, writeUserLibrary } from "@/lib/user/userLibrary";

type TelegramAuthContextValue = {
  user: TelegramUser | null;
  isAuthenticated: boolean;
  login: () => void;
  logout: () => void;
  requireAuth: (
    prompt: string | TelegramLoginPrompt,
    onSuccess?: () => void,
  ) => boolean;
  completeLoginVerified: (user: TelegramUser) => void;
};

const TelegramAuthContext = createContext<TelegramAuthContextValue | null>(
  null,
);

export function useTelegramAuth() {
  const ctx = useContext(TelegramAuthContext);
  if (!ctx) {
    throw new Error("useTelegramAuth must be used within TelegramAuthProvider");
  }
  return ctx;
}

export function TelegramAuthProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [user, setUser] = useState<TelegramUser | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [sheetPrompt, setSheetPrompt] = useState<TelegramLoginPrompt>({
    reason: "Sign in to continue",
  });
  const pendingActionRef = useRef<(() => void) | null>(null);

  const sync = useCallback(() => {
    setUser(readTelegramUser());
  }, []);

  useEffect(() => {
    sync();
    const onAuth = () => sync();
    window.addEventListener("nx-telegram-auth", onAuth);
    return () => window.removeEventListener("nx-telegram-auth", onAuth);
  }, [sync]);

  useEffect(() => {
    if (!user || !readSyncToken()) return;
    void pullTelegramLibrary().then((remote) => {
      if (!remote) return;
      writeUserLibrary(mergeUserLibraries(readUserLibrary(), remote));
    });
  }, [user]);

  const login = useCallback(() => {
    setSheetPrompt({
      title: "Continuar con Telegram",
      description:
        "Guarda likes, colecciones y modelos que sigues en todos tus dispositivos.",
      ctaLabel: "Continuar con Telegram",
    });
    pendingActionRef.current = null;
    setSheetOpen(true);
  }, []);

  const logout = useCallback(() => {
    writeTelegramUser(null);
    setUser(null);
  }, []);

  const requireAuth = useCallback(
    (prompt: string | TelegramLoginPrompt, onSuccess?: () => void) => {
      if (user) {
        onSuccess?.();
        return true;
      }
      setSheetPrompt(normalizeLoginPrompt(prompt));
      pendingActionRef.current = onSuccess ?? null;
      setSheetOpen(true);
      return false;
    },
    [user],
  );

  const completeLoginVerified = useCallback((next: TelegramUser) => {
    const pending = pendingActionRef.current;
    pendingActionRef.current = null;
    writeTelegramUser(next);
    setUser(next);
    setSheetOpen(false);
    void syncTelegramLibraryAfterLogin(next).finally(() => {
      pending?.();
    });
  }, []);

  const closeSheet = useCallback(() => {
    setSheetOpen(false);
    pendingActionRef.current = null;
  }, []);

  useTelegramMiniAppBootstrap(completeLoginVerified, !user);

  const value = useMemo(
    () => ({
      user,
      isAuthenticated: Boolean(user),
      login,
      logout,
      requireAuth,
      completeLoginVerified,
    }),
    [user, login, logout, requireAuth, completeLoginVerified],
  );

  return (
    <TelegramAuthContext.Provider value={value}>
      {children}
      <TelegramLoginSheet
        open={sheetOpen}
        prompt={sheetPrompt}
        onClose={closeSheet}
        onAuthenticated={completeLoginVerified}
      />
    </TelegramAuthContext.Provider>
  );
}
