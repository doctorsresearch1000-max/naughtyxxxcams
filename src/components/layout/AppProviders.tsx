"use client";

import { TelegramAuthProvider } from "@/components/auth/TelegramAuthProvider";

export function AppProviders({ children }: { children: React.ReactNode }) {
  return <TelegramAuthProvider>{children}</TelegramAuthProvider>;
}
