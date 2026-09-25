"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";
import { RegistrationPaywallModal } from "@/components/auth/RegistrationPaywallModal";
import { useTelegramAuth } from "@/components/auth/TelegramAuthProvider";

type RegistrationPaywallContextValue = {
  openPaywall: () => void;
  closePaywall: () => void;
  /** Returns true when the user is already signed in. */
  requireAccount: () => boolean;
};

const RegistrationPaywallContext =
  createContext<RegistrationPaywallContextValue | null>(null);

export function useRegistrationPaywall() {
  const ctx = useContext(RegistrationPaywallContext);
  if (!ctx) {
    throw new Error(
      "useRegistrationPaywall must be used within RegistrationPaywallProvider",
    );
  }
  return ctx;
}

export function RegistrationPaywallProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isAuthenticated, login } = useTelegramAuth();
  const [open, setOpen] = useState(false);

  const openPaywall = useCallback(() => setOpen(true), []);
  const closePaywall = useCallback(() => setOpen(false), []);

  const requireAccount = useCallback(() => {
    if (isAuthenticated) return true;
    setOpen(true);
    return false;
  }, [isAuthenticated]);

  const handleAuthAction = useCallback(() => {
    setOpen(false);
    login();
  }, [login]);

  const value = useMemo(
    () => ({
      openPaywall,
      closePaywall,
      requireAccount,
    }),
    [openPaywall, closePaywall, requireAccount],
  );

  return (
    <RegistrationPaywallContext.Provider value={value}>
      {children}
      <RegistrationPaywallModal
        open={open}
        onClose={closePaywall}
        onRegister={handleAuthAction}
        onLogin={handleAuthAction}
      />
    </RegistrationPaywallContext.Provider>
  );
}
