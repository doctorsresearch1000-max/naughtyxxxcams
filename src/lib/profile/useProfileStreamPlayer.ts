"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { CrackPerformer } from "@/lib/crackrevenue/api";
import {
  camPlayerAudit,
  camPlayerAuditMark,
} from "@/lib/audit/camPlayerAudit";
import {
  crackPerformerToFeedPerformer,
  type FeedPerformer,
} from "@/lib/feed/filterPerformers";
import type { ModelProfileView } from "@/lib/profile/modelProfile";
import { injectStreamPreconnects } from "@/lib/feed/streamEmbedWarmup";
import { logProfileStreamEmbedPipeline } from "@/lib/profile/profileStreamDebug";

type LiveStatus = "live" | "offline";

function buildFeedPerformer(
  performer: CrackPerformer | undefined,
  model: ModelProfileView,
): FeedPerformer | null {
  if (!performer) return null;
  const row = crackPerformerToFeedPerformer(performer, {
    requirePoster: false,
  });
  if (!row) return null;
  if (row.posterUrl) return row;
  const fallback = model.bannerUrl?.trim() || model.avatar?.trim() || "";
  return fallback ? { ...row, posterUrl: fallback } : row;
}

type ProfileStreamPlayerState = {
  catalogLive: boolean;
  feedPerformer: FeedPerformer | null;
  posterUrl: string;
  /** Mount iframe at full opacity — do not wait on parent load heuristics. */
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
  const ssrPerformer = model.performer;
  const [livePerformer, setLivePerformer] = useState<CrackPerformer | undefined>(
    ssrPerformer,
  );
  const [disconnected, setDisconnected] = useState(false);

  const auditKey = `profile-${surface}:${model.profileSlug}`;

  const feedPerformer = useMemo(
    () => buildFeedPerformer(livePerformer, model),
    [livePerformer, model],
  );

  useEffect(() => {
    camPlayerAuditMark(auditKey);
    logProfileStreamEmbedPipeline(
      model.profileSlug,
      surface,
      livePerformer,
      "mount",
    );
    camPlayerAudit("profile.mount", {
      slug: model.profileSlug,
      surface,
      ssrStatus: model.status,
      playerSrc: feedPerformer?.embedPlan.playerSrcMuted?.slice(0, 160) ?? null,
      embedMode: feedPerformer?.embedPlan.mode ?? null,
    });
    injectStreamPreconnects();
  }, [
    auditKey,
    model.profileSlug,
    model.status,
    surface,
    livePerformer,
    feedPerformer?.embedPlan.mode,
    feedPerformer?.embedPlan.playerSrcMuted,
  ]);

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
        if (!res.ok) {
          if (process.env.NODE_ENV === "development") {
            console.warn(
              `[profile-stream] live API HTTP ${res.status} slug=${model.profileSlug}`,
            );
          }
          return null;
        }
        return res.json() as Promise<{
          status?: LiveStatus;
          performer?: CrackPerformer | null;
          embedMode?: string | null;
          canMountInteractivePlayer?: boolean;
          hasNativeIframe?: boolean;
        }>;
      })
      .then((payload) => {
        if (cancelled || !payload) return;

        if (payload.performer) {
          setLivePerformer(payload.performer);
          logProfileStreamEmbedPipeline(
            model.profileSlug,
            surface,
            payload.performer,
            "liveApi",
          );
        }
        // Never downgrade to offline when API misses the model — keep SSR performer/URL.

        camPlayerAudit("profile.liveApi.payload", {
          slug: model.profileSlug,
          status: payload.status,
          embedMode: payload.embedMode,
          hasIframe: Boolean(payload.performer?.iframeFeedURL),
          applied: Boolean(payload.performer),
        });
      })
      .catch((err) => {
        camPlayerAudit("profile.liveApi.error", {
          slug: model.profileSlug,
          message: String(err),
        });
        if (process.env.NODE_ENV === "development") {
          console.error("[profile-stream] live API fetch failed", err);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [model.profileSlug, surface]);

  const posterUrl =
    feedPerformer?.posterUrl ||
    model.bannerUrl ||
    model.avatar ||
    "";

  const catalogLive =
    model.status === "live" && livePerformer?.live !== false;

  const canMountStream =
    catalogLive &&
    Boolean(
      feedPerformer?.embedPlan.playerSrcMuted &&
        feedPerformer.embedPlan.canMountInteractivePlayer,
    );

  const onFrameDocumentLoad = useCallback(() => {
    camPlayerAudit("profile.iframe.documentLoad", {
      slug: model.profileSlug,
      surface,
      feedKey: feedPerformer?.feedKey,
    });
  }, [model.profileSlug, surface, feedPerformer?.feedKey]);

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

  const showStreamLayer = canMountStream && !disconnected;

  const showLoadingOverlay = false;

  const showConversionUi = needsHardConversion;

  return {
    catalogLive,
    feedPerformer: canMountStream ? feedPerformer : null,
    posterUrl,
    showStreamLayer,
    showConversionUi,
    showLoadingOverlay,
    needsHardConversion,
    armed: true,
    onFrameDocumentLoad,
    onStreamDisconnected,
  };
}
