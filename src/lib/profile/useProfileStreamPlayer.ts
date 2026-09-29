"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { CrackPerformer } from "@/lib/crackrevenue/api";
import {
  camPlayerAudit,
  camPlayerAuditMark,
  camPlayerAuditSince,
} from "@/lib/audit/camPlayerAudit";
import {
  crackPerformerToFeedPerformer,
  type FeedPerformer,
} from "@/lib/feed/filterPerformers";
import type { ModelProfileView } from "@/lib/profile/modelProfile";
import { isStreamSlotLoaded } from "@/lib/feed/feedStreamEngine";
import {
  injectStreamPreconnects,
  warmPerformerStream,
} from "@/lib/feed/streamEmbedWarmup";
import { PROFILE_STREAM_IFRAME_TIMEOUT_MS } from "@/lib/profile/profileStreamTiming";

type LiveStatus = "live" | "offline";

type ProfileStreamPlayerState = {
  catalogLive: boolean;
  feedPerformer: FeedPerformer | null;
  posterUrl: string;
  showStreamLayer: boolean;
  showConversionUi: boolean;
  showLoadingOverlay: boolean;
  needsHardConversion: boolean;
  armed: boolean;
  onFrameDocumentLoad: () => void;
  onStreamDisconnected: (reason: string) => void;
};

export function useProfileStreamPlayer(
  model: ModelProfileView,
  surface: "mobile" | "desktop",
): ProfileStreamPlayerState {
  const [livePerformer, setLivePerformer] = useState<CrackPerformer | undefined>(
    model.performer,
  );
  const [liveStatus, setLiveStatus] = useState<LiveStatus>(model.status);
  const [armed, setArmed] = useState(false);
  const [iframeLoaded, setIframeLoaded] = useState(false);
  const [disconnected, setDisconnected] = useState(false);
  const [loadTimedOut, setLoadTimedOut] = useState(false);

  const auditKey = `profile-${surface}:${model.profileSlug}`;

  useEffect(() => {
    camPlayerAuditMark(auditKey);
    camPlayerAudit("profile.mount", {
      slug: model.profileSlug,
      surface,
      ssrStatus: model.status,
    });
    setArmed(true);
  }, [auditKey, model.profileSlug, model.status, surface]);

  useEffect(() => {
    let cancelled = false;
    const t0 = performance.now();
    void fetch(`/api/profile/${encodeURIComponent(model.profileSlug)}/live`, {
      cache: "no-store",
    })
      .then(async (res) => {
        const ms = Math.round(performance.now() - t0);
        camPlayerAudit("profile.liveApi", {
          slug: model.profileSlug,
          status: res.status,
          ms,
        });
        if (!res.ok) return null;
        return res.json() as Promise<{
          status?: LiveStatus;
          performer?: CrackPerformer | null;
          embedMode?: string | null;
        }>;
      })
      .then((payload) => {
        if (cancelled || !payload) return;
        if (payload.status) setLiveStatus(payload.status);
        if (payload.performer) setLivePerformer(payload.performer);
        camPlayerAudit("profile.liveApi.payload", {
          slug: model.profileSlug,
          status: payload.status,
          embedMode: payload.embedMode,
          hasIframe: Boolean(payload.performer?.iframeFeedURL),
        });
      })
      .catch((err) => {
        camPlayerAudit("profile.liveApi.error", {
          slug: model.profileSlug,
          message: String(err),
        });
      });
    return () => {
      cancelled = true;
    };
  }, [model.profileSlug]);

  const feedPerformer = useMemo(() => {
    if (!livePerformer) return null;
    const row = crackPerformerToFeedPerformer(livePerformer, {
      requirePoster: false,
    });
    if (!row) return null;
    if (row.posterUrl) return row;
    const fallback =
      model.bannerUrl?.trim() || model.avatar?.trim() || "";
    return fallback ? { ...row, posterUrl: fallback } : row;
  }, [livePerformer, model.bannerUrl, model.avatar]);

  const posterUrl =
    feedPerformer?.posterUrl ||
    model.bannerUrl ||
    model.avatar ||
    "";

  const catalogLive = liveStatus === "live";
  const canMountStream = catalogLive && Boolean(feedPerformer);

  useEffect(() => {
    const key = feedPerformer?.feedKey;
    const alreadyLoaded = key ? isStreamSlotLoaded(key) : false;
    setIframeLoaded(alreadyLoaded);
    setDisconnected(false);
    setLoadTimedOut(false);
  }, [feedPerformer?.feedKey, catalogLive]);

  useEffect(() => {
    injectStreamPreconnects();
    if (!feedPerformer) return;
    try {
      const raw = sessionStorage.getItem("nx-last-warm-feed-key");
      if (!raw) return;
      const parsed = JSON.parse(raw) as { feedKey?: string; at?: number };
      if (
        parsed.feedKey === feedPerformer.feedKey &&
        typeof parsed.at === "number" &&
        Date.now() - parsed.at < 120_000
      ) {
        warmPerformerStream(feedPerformer.feedKey, feedPerformer.embedPlan, {
          pin: true,
        });
      }
    } catch {
      /* ignore */
    }
  }, [feedPerformer]);

  useEffect(() => {
    if (!armed || !feedPerformer) return;
    warmPerformerStream(feedPerformer.feedKey, feedPerformer.embedPlan, {
      pin: true,
    });
  }, [armed, feedPerformer]);

  useEffect(() => {
    if (!canMountStream) return;
    const id = window.setTimeout(() => {
      if (!iframeLoaded) {
        setLoadTimedOut(true);
        camPlayerAuditSince(auditKey, "iframe.timeout", {
          feedKey: feedPerformer?.feedKey,
          msBudget: PROFILE_STREAM_IFRAME_TIMEOUT_MS,
        });
      }
    }, PROFILE_STREAM_IFRAME_TIMEOUT_MS);
    return () => window.clearTimeout(id);
  }, [canMountStream, iframeLoaded, feedPerformer?.feedKey, auditKey]);

  const onFrameDocumentLoad = useCallback(() => {
    setIframeLoaded(true);
    setLoadTimedOut(false);
    camPlayerAuditSince(auditKey, "iframe.documentLoad", {
      feedKey: feedPerformer?.feedKey,
    });
  }, [auditKey, feedPerformer?.feedKey]);

  const onStreamDisconnected = useCallback(
    (reason: string) => {
      setDisconnected(true);
      camPlayerAudit("pure.SM_DISCONNECTED", {
        slug: model.profileSlug,
        surface,
        reason,
      });
    },
    [model.profileSlug, surface],
  );

  const needsHardConversion =
    !catalogLive || !feedPerformer || disconnected;

  const showStreamLayer =
    canMountStream && iframeLoaded && !disconnected;

  const showLoadingOverlay =
    canMountStream &&
    !iframeLoaded &&
    !loadTimedOut &&
    !disconnected;

  const showConversionUi =
    needsHardConversion ||
    showLoadingOverlay ||
    (loadTimedOut && !iframeLoaded);

  return {
    catalogLive,
    feedPerformer,
    posterUrl,
    showStreamLayer,
    showConversionUi,
    showLoadingOverlay,
    needsHardConversion,
    armed,
    onFrameDocumentLoad,
    onStreamDisconnected,
  };
}
