"use client";

import { useLayoutEffect, useState } from "react";
import { createPortal } from "react-dom";

export const MOBILE_FEED_PORTAL_ID = "nx-mobile-feed-stage";

type MobileFeedFullscreenPortalProps = {
  children: React.ReactNode;
};

/**
 * Home-only fullscreen stage on document.body (see PersistedHomeFeed — unmounts off `/`).
 */
export function MobileFeedFullscreenPortal({
  children,
}: MobileFeedFullscreenPortalProps) {
  const [host, setHost] = useState<HTMLElement | null>(null);

  useLayoutEffect(() => {
    let node = document.getElementById(MOBILE_FEED_PORTAL_ID);
    if (!node) {
      node = document.createElement("div");
      node.id = MOBILE_FEED_PORTAL_ID;
      node.setAttribute("data-feed-stage-root", "portal");
      document.body.appendChild(node);
    }
    setHost(node);

    return () => {
      node.remove();
      setHost(null);
    };
  }, []);

  if (!host) {
    return null;
  }

  return createPortal(
    <div className="pointer-events-auto h-full w-full">{children}</div>,
    host,
  );
}
