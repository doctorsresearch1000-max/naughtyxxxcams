"use client";

import { useEffect, useLayoutEffect, useState } from "react";
import { createPortal } from "react-dom";

const PORTAL_ID = "nx-mobile-feed-stage";
const CTA_PORTAL_ID = "nx-feed-cta-layer";

type MobileFeedFullscreenPortalProps = {
  /** Keep the stage mounted (e.g. when user left home but feed stays warm). */
  active: boolean;
  /** Show the stage on screen (home tab). */
  visible: boolean;
  children: React.ReactNode;
};

function syncHostVisibility(host: HTMLElement, visible: boolean) {
  if (visible) {
    host.style.visibility = "visible";
    host.style.pointerEvents = "none";
    host.style.inset = "0";
    host.style.left = "";
    host.style.top = "";
  } else {
    host.style.visibility = "hidden";
    host.style.pointerEvents = "none";
    host.style.left = "-9999px";
    host.style.top = "0";
  }
}

/**
 * Renders the mobile home feed on document.body so no layout wrapper (flex, pb-16,
 * max-w-md column) can offset or shrink the TikTok stage.
 */
export function MobileFeedFullscreenPortal({
  active,
  visible,
  children,
}: MobileFeedFullscreenPortalProps) {
  const [host, setHost] = useState<HTMLElement | null>(null);

  useLayoutEffect(() => {
    if (!active) {
      setHost(null);
      return;
    }

    let node = document.getElementById(PORTAL_ID);
    if (!node) {
      node = document.createElement("div");
      node.id = PORTAL_ID;
      node.setAttribute("data-feed-stage-root", "portal");
      document.body.appendChild(node);
    }
    syncHostVisibility(node, visible);
    setHost(node);

    return () => {
      node.remove();
      document.getElementById(CTA_PORTAL_ID)?.remove();
    };
  }, [active]);

  useEffect(() => {
    if (!host || !active) return;
    syncHostVisibility(host, visible);
  }, [host, active, visible]);

  if (!active || !host) {
    return null;
  }

  return createPortal(
    <div className="pointer-events-auto h-full w-full">{children}</div>,
    host,
  );
}
