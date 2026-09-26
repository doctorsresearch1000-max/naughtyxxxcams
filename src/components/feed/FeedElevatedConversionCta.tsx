"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { ChatWithModelCta } from "@/components/conversion/ChatWithModelCta";

export const FEED_CTA_PORTAL_ID = "nx-feed-cta-layer";

type FeedElevatedConversionCtaProps = {
  modelName: string;
  affiliateUrl: string;
  show: boolean;
};

/**
 * Renders the feed conversion CTA above the bottom-nav glass shelf.
 * The mobile feed stage is z-25; bottom nav frosted pill is a sibling at ~99998+.
 * Without portaling, backdrop-blur on the nav paints over the CTA.
 */
export function FeedElevatedConversionCta({
  modelName,
  affiliateUrl,
  show,
}: FeedElevatedConversionCtaProps) {
  const [host, setHost] = useState<HTMLElement | null>(null);

  useEffect(() => {
    if (!show) {
      setHost(null);
      return;
    }
    let node = document.getElementById(FEED_CTA_PORTAL_ID);
    if (!node) {
      node = document.createElement("div");
      node.id = FEED_CTA_PORTAL_ID;
      node.setAttribute("data-feed-cta-portal", "true");
      document.body.appendChild(node);
    }
    setHost(node);
  }, [show]);

  if (!show || !host) {
    return null;
  }

  return createPortal(
    <div
      className="pointer-events-none absolute left-3 max-w-[calc(100%-5.5rem)]"
      style={{
        bottom: "calc(4.5rem + env(safe-area-inset-bottom, 0px))",
      }}
    >
      <ChatWithModelCta
        modelName={modelName}
        affiliateUrl={affiliateUrl}
        visible
      />
    </div>,
    host,
  );
}
