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
  resumeBrowserAudioContext,
  setActiveFeedIframePointerEvents,
  setFeedCardAudio,
} from "@/lib/feed/liveIframeAudio";
import { SessionAudioOverlay } from "./SessionAudioOverlay";

type SessionAudioContextValue = {
  /** Session latch: first gesture enables audio for the whole visit. */
  isAudioUnlocked: boolean;
  muted: boolean;
  unlockFromPointerDown: () => void;
  toggleMutedFromPointerDown: () => void;
  registerActiveIframe: (win: Window | null) => void;
  setOverlayGate: (visible: boolean) => void;
  /** @deprecated use isAudioUnlocked */
  unlocked: boolean;
  unlockSession: () => void;
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

  const unlockFromPointerDown = useCallback(() => {
    isAudioUnlockedRef.current = true;
    mutedRef.current = false;

    resumeBrowserAudioContext();
    setFeedCardAudio(true, true);
    setActiveFeedIframePointerEvents(true);

    flushSync(() => {
      setIsAudioUnlocked(true);
      setMuted(false);
    });
  }, []);

  const toggleMutedFromPointerDown = useCallback(() => {
    if (!isAudioUnlockedRef.current) {
      unlockFromPointerDown();
      return;
    }

    if (mutedRef.current) {
      mutedRef.current = false;
      setFeedCardAudio(true, true);
      setActiveFeedIframePointerEvents(true);
      flushSync(() => {
        setMuted(false);
      });
      return;
    }

    mutedRef.current = true;
    setFeedCardAudio(false, true);
    setActiveFeedIframePointerEvents(true);
    flushSync(() => {
      setMuted(true);
    });
  }, [unlockFromPointerDown]);

  const unlockSession = unlockFromPointerDown;
  const toggleMuted = toggleMutedFromPointerDown;

  const value = useMemo(
    () => ({
      isAudioUnlocked,
      muted,
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
