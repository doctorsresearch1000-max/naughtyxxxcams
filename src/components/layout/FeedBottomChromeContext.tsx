"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

export type FeedBottomCtaPayload = {
  modelName: string;
  affiliateUrl: string;
};

type FeedBottomChromeContextValue = {
  cta: FeedBottomCtaPayload | null;
  setCta: (next: FeedBottomCtaPayload | null) => void;
};

const FeedBottomChromeContext =
  createContext<FeedBottomChromeContextValue | null>(null);

export function FeedBottomChromeProvider({ children }: { children: ReactNode }) {
  const [cta, setCtaState] = useState<FeedBottomCtaPayload | null>(null);
  const setCta = useCallback((next: FeedBottomCtaPayload | null) => {
    setCtaState(next);
  }, []);

  const value = useMemo(() => ({ cta, setCta }), [cta, setCta]);

  return (
    <FeedBottomChromeContext.Provider value={value}>
      {children}
    </FeedBottomChromeContext.Provider>
  );
}

export function useFeedBottomChrome() {
  const ctx = useContext(FeedBottomChromeContext);
  if (!ctx) {
    throw new Error(
      "useFeedBottomChrome must be used within FeedBottomChromeProvider",
    );
  }
  return ctx;
}

/** Active slide registers the conversion CTA into the unified bottom chrome. */
export function useRegisterFeedBottomCta(
  visible: boolean,
  modelName: string,
  affiliateUrl: string,
) {
  const { setCta } = useFeedBottomChrome();

  useEffect(() => {
    if (!visible) {
      setCta(null);
      return;
    }
    setCta({ modelName, affiliateUrl });
    return () => setCta(null);
  }, [visible, modelName, affiliateUrl, setCta]);
}
