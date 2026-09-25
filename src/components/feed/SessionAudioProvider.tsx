"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
} from "react";
import { usePathname } from "next/navigation";
import { flushSync } from "react-dom";
import {
  applyDirectPlayerAudioFromGesture,
  resumeBrowserAudioContext,
} from "@/lib/feed/liveIframeAudio";
import { SessionAudioOverlay } from "./SessionAudioOverlay";

type SessionAudioContextValue = {
  isAudioUnlocked: boolean;
  muted: boolean;
  /** UI session only — never reload iframe or open affiliate URLs. */
  acknowledgePlayerSurfaceTap: () => void;
  /** Rail volume control — gesture-initiated player src swap (optional fallback). */
  toggleMutedFromPointerDown: () => void;
  registerActiveIframe: (win: Window | null) => void;
  setOverlayGate: (visible: boolean) => void;
  unlocked: boolean;
  unlockSession: () => void;
  unlockFromPointerDown: () => void;
  toggleMuted: () => void;
};

const SessionAudioContext = createContext<SessionAudioContextValue | null>(
  null,
);

export function useSessionAudio() {
  const ctx = useContext(SessionAudioContext);
  if (!ctx) {
    throw new Error("useSessionAudio must be used within SessionAudioProvider");
  }
  return ctx;
}

export function SessionAudioProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isAudioUnlocked, setIsAudioUnlocked] = useState(false);
  const [muted, setMuted] = useState(true);
  const [overlayGate, setOverlayGate] = useState(false);
  const isAudioUnlockedRef = useRef(false);
  const mutedRef = useRef(true);
  const activeIframeWindowRef = useRef<Window | null>(null);

  const registerActiveIframe = useCallback((win: Window | null) => {
    activeIframeWindowRef.current = win;
  }, []);

  const acknowledgePlayerSurfaceTap = useCallback(() => {
    isAudioUnlockedRef.current = true;
    mutedRef.current = false;
    flushSync(() => {
      setIsAudioUnlocked(true);
      setMuted(false);
      setOverlayGate(false);
    });
  }, []);

  const unlockFromPointerDown = acknowledgePlayerSurfaceTap;

  const toggleMutedFromPointerDown = useCallback(() => {
    resumeBrowserAudioContext();

    if (!isAudioUnlockedRef.current) {
      isAudioUnlockedRef.current = true;
      mutedRef.current = false;
      applyDirectPlayerAudioFromGesture(true);
      flushSync(() => {
        setIsAudioUnlocked(true);
        setMuted(false);
        setOverlayGate(false);
      });
      return;
    }

    if (mutedRef.current) {
      mutedRef.current = false;
      applyDirectPlayerAudioFromGesture(true);
      flushSync(() => setMuted(false));
      return;
    }

    mutedRef.current = true;
    applyDirectPlayerAudioFromGesture(false);
    flushSync(() => setMuted(true));
  }, []);

  const unlockSession = unlockFromPointerDown;
  const toggleMuted = toggleMutedFromPointerDown;

  const value = useMemo(
    () => ({
      isAudioUnlocked,
      muted,
      acknowledgePlayerSurfaceTap,
      unlockFromPointerDown,
      toggleMutedFromPointerDown,
      registerActiveIframe,
      setOverlayGate,
      unlocked: isAudioUnlocked,
      unlockSession,
      toggleMuted,
    }),
    [
      isAudioUnlocked,
      muted,
      acknowledgePlayerSurfaceTap,
      unlockFromPointerDown,
      toggleMutedFromPointerDown,
      registerActiveIframe,
      unlockSession,
      toggleMuted,
    ],
  );

  const pathname = usePathname();
  const showOverlay = overlayGate && !isAudioUnlocked && pathname === "/";

  return (
    <SessionAudioContext.Provider value={value}>
      {children}
      <SessionAudioOverlay visible={showOverlay} />
    </SessionAudioContext.Provider>
  );
}
