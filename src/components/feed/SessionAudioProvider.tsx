"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
} from "react";
import { flushSync } from "react-dom";
import {
  applyDirectPlayerAudioFromGesture,
  muteAllFeedEmbedIframes,
  resumeBrowserAudioContext,
} from "@/lib/feed/liveIframeAudio";

type SessionAudioContextValue = {
  isAudioUnlocked: boolean;
  muted: boolean;
  toggleMutedFromPointerDown: () => void;
  registerActiveIframe: (win: Window | null) => void;
  /** @deprecated */
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
  const isAudioUnlockedRef = useRef(false);
  const mutedRef = useRef(true);
  const activeIframeWindowRef = useRef<Window | null>(null);

  const registerActiveIframe = useCallback((win: Window | null) => {
    activeIframeWindowRef.current = win;
  }, []);

  const toggleMutedFromPointerDown = useCallback(() => {
    resumeBrowserAudioContext();

    if (!isAudioUnlockedRef.current) {
      isAudioUnlockedRef.current = true;
      mutedRef.current = false;
      muteAllFeedEmbedIframes();
      applyDirectPlayerAudioFromGesture(true);
      flushSync(() => {
        setIsAudioUnlocked(true);
        setMuted(false);
      });
      return;
    }

    if (mutedRef.current) {
      mutedRef.current = false;
      muteAllFeedEmbedIframes();
      applyDirectPlayerAudioFromGesture(true);
      flushSync(() => setMuted(false));
      return;
    }

    mutedRef.current = true;
    muteAllFeedEmbedIframes();
    flushSync(() => setMuted(true));
  }, []);

  const unlockSession = toggleMutedFromPointerDown;
  const toggleMuted = toggleMutedFromPointerDown;

  const value = useMemo(
    () => ({
      isAudioUnlocked,
      muted,
      toggleMutedFromPointerDown,
      registerActiveIframe,
      unlocked: isAudioUnlocked,
      unlockSession,
      toggleMuted,
    }),
    [
      isAudioUnlocked,
      muted,
      toggleMutedFromPointerDown,
      registerActiveIframe,
      unlockSession,
      toggleMuted,
    ],
  );

  return (
    <SessionAudioContext.Provider value={value}>
      {children}
    </SessionAudioContext.Provider>
  );
}
