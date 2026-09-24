"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useTelegramAuth } from "@/components/auth/TelegramAuthProvider";
import {
  isLiked as isLikedInLibrary,
  toggleLike as toggleLibraryLike,
  type SavedModelRef,
} from "@/lib/user/userLibrary";

const STORAGE_PREFIX = "nx_like_";

function seedLikes(feedKey: string): number {
  let hash = 0;
  for (let i = 0; i < feedKey.length; i += 1) {
    hash = (hash << 5) - hash + feedKey.charCodeAt(i);
    hash |= 0;
  }
  const base = 18_400 + Math.abs(hash % 42_000);
  return base;
}

function formatLikes(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 10_000) return `${Math.round(n / 1000)}K`;
  if (n >= 1000) return `${(n / 1000).toFixed(1)}K`;
  return String(n);
}

export function useFeedLikes(feedKey: string, modelRef?: SavedModelRef) {
  const { requireAuth, isAuthenticated } = useTelegramAuth();
  const baseCount = useMemo(() => seedLikes(feedKey), [feedKey]);
  const [liked, setLiked] = useState(false);
  const [count, setCount] = useState(baseCount);
  const [popping, setPopping] = useState(false);
  const popTimerRef = useRef<number | null>(null);

  const syncLiked = useCallback(() => {
    if (isAuthenticated) {
      const libLiked = isLikedInLibrary(feedKey);
      setLiked(libLiked);
      setCount(libLiked ? baseCount + 1 : baseCount);
      return;
    }
    try {
      const raw = localStorage.getItem(`${STORAGE_PREFIX}${feedKey}`);
      if (raw === "1") {
        setLiked(true);
        setCount(baseCount + 1);
      } else {
        setLiked(false);
        setCount(baseCount);
      }
    } catch {
      /* private mode */
    }
  }, [feedKey, baseCount, isAuthenticated]);

  useEffect(() => {
    syncLiked();
    const onLib = () => syncLiked();
    window.addEventListener("nx-library-update", onLib);
    return () => window.removeEventListener("nx-library-update", onLib);
  }, [syncLiked]);

  const toggleLike = useCallback(() => {
    if (modelRef && !requireAuth("Sign in with Telegram to like streams")) {
      return;
    }

    if (modelRef && isAuthenticated) {
      const next = toggleLibraryLike(modelRef);
      setLiked(next);
      setCount(next ? baseCount + 1 : baseCount);
    } else {
      setLiked((prev) => {
        const next = !prev;
        setCount((c) => (next ? c + 1 : Math.max(baseCount, c - 1)));
        try {
          localStorage.setItem(`${STORAGE_PREFIX}${feedKey}`, next ? "1" : "0");
        } catch {
          /* ignore */
        }
        return next;
      });
    }

    setPopping(true);
    if (popTimerRef.current) window.clearTimeout(popTimerRef.current);
    popTimerRef.current = window.setTimeout(() => setPopping(false), 320);
  }, [feedKey, baseCount, modelRef, requireAuth, isAuthenticated]);

  useEffect(() => {
    return () => {
      if (popTimerRef.current) window.clearTimeout(popTimerRef.current);
    };
  }, []);

  return {
    liked,
    count,
    label: formatLikes(count),
    toggleLike,
    popping,
  };
}
