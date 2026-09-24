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
  unlockSession: () => void;
  registerActiveIframe: (win: Window | null) => void;
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
  const unlockedRef = useRef(unlocked);
  const activeIframeWindowRef = useRef<Window | null>(null);

  useEffect(() => {
    unlockedRef.current = unlocked;
  }, [unlocked]);

  const postUnlock = useCallback((target: Window | null) => {
    if (!target) return;
    target.postMessage(
      { source: "naughty-feed", action: "session-audio-unlock" },
      "*",
    );
  }, []);

  const registerActiveIframe = useCallback(
    (win: Window | null) => {
      activeIframeWindowRef.current = win;
      if (win && unlockedRef.current) {
        postUnlock(win);
      }
    },
    [postUnlock],
  );

  const unlockSession = useCallback(() => {
    setUnlocked(true);
    postUnlock(activeIframeWindowRef.current);
  }, [postUnlock]);

  const value = useMemo(
    () => ({
      unlocked,
      unlockSession,
      registerActiveIframe,
    }),
    [unlocked, unlockSession, registerActiveIframe],
  );

  return (
    <SessionAudioContext.Provider value={value}>
      {children}
      <SessionAudioOverlay visible={!unlocked} onUnlock={unlockSession} />
    </SessionAudioContext.Provider>
  );
}
