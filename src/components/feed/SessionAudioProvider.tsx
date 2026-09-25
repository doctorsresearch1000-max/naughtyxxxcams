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
import type { PerformerEmbedPlan } from "@/lib/feed/performerEmbed";
import {
  applyDirectPlayerAudioFromGesture,
  muteAllFeedEmbedIframes,
  muteInactiveFeedEmbedIframes,
  resumeBrowserAudioContext,
} from "@/lib/feed/liveIframeAudio";

type EmbedPlanAudio = Pick<
  PerformerEmbedPlan,
  "playerSrcMuted" | "playerSrcUnmuted"
>;

type SessionAudioContextValue = {
  isAudioUnlocked: boolean;
  muted: boolean;
  toggleMutedFromUserGesture: (embedPlan?: EmbedPlanAudio | null) => void;
  /** @deprecated use toggleMutedFromUserGesture */
  toggleMutedFromPointerDown: (embedPlan?: EmbedPlanAudio | null) => void;
  registerActiveIframe: (win: Window | null) => void;
  unlocked: boolean;
  unlockSession: (embedPlan?: EmbedPlanAudio | null) => void;
  toggleMuted: (embedPlan?: EmbedPlanAudio | null) => void;
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

  const toggleMutedFromUserGesture = useCallback(
    (embedPlan?: EmbedPlanAudio | null) => {
      resumeBrowserAudioContext();

      if (!isAudioUnlockedRef.current) {
        isAudioUnlockedRef.current = true;
        mutedRef.current = false;
        muteInactiveFeedEmbedIframes();
        applyDirectPlayerAudioFromGesture(true, embedPlan);
        flushSync(() => {
          setIsAudioUnlocked(true);
          setMuted(false);
        });
        return;
      }

      if (mutedRef.current) {
        mutedRef.current = false;
        muteInactiveFeedEmbedIframes();
        applyDirectPlayerAudioFromGesture(true, embedPlan);
        flushSync(() => setMuted(false));
        return;
      }

      mutedRef.current = true;
      applyDirectPlayerAudioFromGesture(false, embedPlan);
      flushSync(() => setMuted(true));
    },
    [],
  );

  const unlockSession = toggleMutedFromUserGesture;
  const toggleMuted = toggleMutedFromUserGesture;

  const value = useMemo(
    () => ({
      isAudioUnlocked,
      muted,
      toggleMutedFromUserGesture,
      toggleMutedFromPointerDown: toggleMutedFromUserGesture,
      registerActiveIframe,
      unlocked: isAudioUnlocked,
      unlockSession,
      toggleMuted,
    }),
    [
      isAudioUnlocked,
      muted,
      toggleMutedFromUserGesture,
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

/** Call on slide change — keeps prefetch muted without touching React mute state. */
export function muteFeedOnSlideChange(): void {
  muteAllFeedEmbedIframes();
}
