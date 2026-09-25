"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  readTelegramUser,
  writeTelegramUser,
  type TelegramUser,
} from "@/lib/auth/telegramSession";
import { TelegramLoginSheet } from "@/components/auth/TelegramLoginSheet";
import { useTelegramMiniAppBootstrap } from "@/hooks/useTelegramMiniAppBootstrap";

type TelegramAuthContextValue = {
  user: TelegramUser | null;
  isAuthenticated: boolean;
  login: () => void;
  logout: () => void;
  requireAuth: (reason: string) => boolean;
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
  const [sheetReason, setSheetReason] = useState("Sign in to continue");

  const sync = useCallback(() => {
    setUser(readTelegramUser());
  }, []);

  useEffect(() => {
    sync();
    const onAuth = () => sync();
    window.addEventListener("nx-telegram-auth", onAuth);
    return () => window.removeEventListener("nx-telegram-auth", onAuth);
  }, [sync]);

  const login = useCallback(() => {
    setSheetReason("Connect Telegram to sync likes & playlists");
    setSheetOpen(true);
  }, []);

  const logout = useCallback(() => {
    writeTelegramUser(null);
    setUser(null);
  }, []);

  const requireAuth = useCallback(
    (reason: string) => {
      if (user) return true;
      setSheetReason(reason);
      setSheetOpen(true);
      return false;
    },
    [user],
  );

  const completeLoginVerified = useCallback((next: TelegramUser) => {
    writeTelegramUser(next);
    setUser(next);
    setSheetOpen(false);
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
        reason={sheetReason}
        onClose={() => setSheetOpen(false)}
        onAuthenticated={completeLoginVerified}
      />
    </TelegramAuthContext.Provider>
  );
}
