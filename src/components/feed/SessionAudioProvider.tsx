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
import { silenceAllStreamSlots } from "@/lib/feed/feedStreamEngine";
import {
  applyDirectPlayerAudioFromGesture,
  resumeBrowserAudioContext,
  silenceAllFeedEmbedIframes,
  silenceInactiveFeedEmbedIframes,
} from "@/lib/feed/liveIframeAudio";

type EmbedPlanAudio = Pick<
  PerformerEmbedPlan,
  "playerSrcMuted" | "playerSrcUnmuted"
>;

type SessionAudioContextValue = {
  isAudioUnlocked: boolean;
  muted: boolean;
  toggleMutedFromUserGesture: (embedPlan?: EmbedPlanAudio | null) => void;
  toggleMutedFromPointerDown: (embedPlan?: EmbedPlanAudio | null) => void;
  registerActiveIframe: (win: Window | null) => void;
  resetAudioOnSlideChange: () => void;
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

  const resetAudioOnSlideChange = useCallback(() => {
    mutedRef.current = true;
    setMuted(true);
  }, []);

  const toggleMutedFromUserGesture = useCallback(
    (embedPlan?: EmbedPlanAudio | null) => {
      resumeBrowserAudioContext();

      if (!isAudioUnlockedRef.current) {
        isAudioUnlockedRef.current = true;
        mutedRef.current = false;
        silenceInactiveFeedEmbedIframes();
        applyDirectPlayerAudioFromGesture(true, embedPlan);
        flushSync(() => {
          setIsAudioUnlocked(true);
          setMuted(false);
        });
        return;
      }

      if (mutedRef.current) {
        mutedRef.current = false;
        silenceInactiveFeedEmbedIframes();
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
      resetAudioOnSlideChange,
      unlocked: isAudioUnlocked,
      unlockSession,
      toggleMuted,
    }),
    [
      isAudioUnlocked,
      muted,
      toggleMutedFromUserGesture,
      registerActiveIframe,
      resetAudioOnSlideChange,
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

/** Silence every player when the active slide changes (no iframe src reload). */
export function muteFeedOnSlideChange(): void {
  silenceAllStreamSlots();
  silenceAllFeedEmbedIframes();
}
