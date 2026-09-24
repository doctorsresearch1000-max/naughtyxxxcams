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
import { isActiveEmbedUnmuted } from "@/lib/feed/feedAudioRegistry";
import { syncReloadFeedIframesForAudio } from "@/lib/feed/audioGestureUnlock";
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
  const unlockedRef = useRef(false);
  const mutedRef = useRef(true);
  const activeIframeWindowRef = useRef<Window | null>(null);

  const applyUnmuteFromGesture = useCallback(() => {
    unlockedRef.current = true;
    mutedRef.current = false;
    syncReloadFeedIframesForAudio(true);
    flushSync(() => {
      setUnlocked(true);
      setMuted(false);
    });
  }, []);

  const applyMuteFromGesture = useCallback(() => {
    mutedRef.current = true;
    syncReloadFeedIframesForAudio(false);
    flushSync(() => {
      setMuted(true);
    });
  }, []);

  const postToIframe = useCallback(
    (action: "session-audio-unlock" | "session-audio-mute") => {
      if (action === "session-audio-mute" && isActiveEmbedUnmuted()) {
        return;
      }
      const payload = { source: "naughty-feed", action };
      const target = activeIframeWindowRef.current;
      if (target) {
        target.postMessage(payload, "*");
      }
    },
    [],
  );

  const registerActiveIframe = useCallback((win: Window | null) => {
    activeIframeWindowRef.current = win;
  }, []);

  const unlockSession = useCallback(() => {
    applyUnmuteFromGesture();
    postToIframe("session-audio-unlock");
  }, [applyUnmuteFromGesture, postToIframe]);

  const toggleMuted = useCallback(() => {
    if (mutedRef.current) {
      applyUnmuteFromGesture();
      postToIframe("session-audio-unlock");
    } else {
      applyMuteFromGesture();
      postToIframe("session-audio-mute");
    }
  }, [applyUnmuteFromGesture, applyMuteFromGesture, postToIframe]);

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
