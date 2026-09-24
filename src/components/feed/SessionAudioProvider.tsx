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
import { SessionAudioOverlay } from "./SessionAudioOverlay";

type SessionAudioContextValue = {
  unlocked: boolean;
  muted: boolean;
  unlockSession: () => void;
  toggleMuted: () => void;
  registerActiveIframe: (win: Window | null) => void;
  setOverlayGate: (visible: boolean) => void;
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
  const [unlocked, setUnlocked] = useState(false);
  const [muted, setMuted] = useState(true);
  const [overlayGate, setOverlayGate] = useState(false);
  const unlockedRef = useRef(unlocked);
  const mutedRef = useRef(muted);
  const activeIframeWindowRef = useRef<Window | null>(null);

  useEffect(() => {
    unlockedRef.current = unlocked;
  }, [unlocked]);

  useEffect(() => {
    mutedRef.current = muted;
  }, [muted]);

  const postToIframe = useCallback(
    (action: "session-audio-unlock" | "session-audio-mute") => {
      const target = activeIframeWindowRef.current;
      if (!target) return;
      target.postMessage({ source: "naughty-feed", action }, "*");
    },
    [],
  );

  const registerActiveIframe = useCallback(
    (win: Window | null) => {
      activeIframeWindowRef.current = win;
      if (!win) return;
      if (unlockedRef.current && !mutedRef.current) {
        postToIframe("session-audio-unlock");
      }
      if (mutedRef.current) {
        postToIframe("session-audio-mute");
      }
    },
    [postToIframe],
  );

  const unlockSession = useCallback(() => {
    setUnlocked(true);
    setMuted(false);
    postToIframe("session-audio-unlock");
  }, [postToIframe]);

  const toggleMuted = useCallback(() => {
    setMuted((prev) => {
      const next = !prev;
      if (!next) {
        setUnlocked(true);
        postToIframe("session-audio-unlock");
      } else {
        postToIframe("session-audio-mute");
      }
      return next;
    });
  }, [postToIframe]);

  const value = useMemo(
    () => ({
      unlocked,
      muted,
      unlockSession,
      toggleMuted,
      registerActiveIframe,
      setOverlayGate,
    }),
    [unlocked, muted, unlockSession, toggleMuted, registerActiveIframe],
  );

  const showOverlay = overlayGate && !unlocked;

  return (
    <SessionAudioContext.Provider value={value}>
      {children}
      <SessionAudioOverlay visible={showOverlay} onUnlock={unlockSession} />
    </SessionAudioContext.Provider>
  );
}
