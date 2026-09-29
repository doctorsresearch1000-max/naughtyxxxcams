"use client";

import { useEffect, useRef, useState } from "react";
import { AffiliateOutboundLink } from "@/components/conversion/AffiliateOutboundLink";
import { trackCtaClickOut } from "@/lib/analytics/track";
import { uiStrings } from "@/lib/i18n/uiStrings";
import { Z_BOTTOM_CHROME } from "@/lib/layout/zIndexLayers";

type ProfileStickyCtaProps = {
  href: string;
  live: boolean;
  modelName: string;
  profileSlug: string;
  primaryCtaRef: React.RefObject<HTMLElement | null>;
};

export function ProfileStickyCta({
  href,
  live,
  modelName,
  profileSlug,
  primaryCtaRef,
}: ProfileStickyCtaProps) {
  const [visible, setVisible] = useState(true);
  const selfRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const target = primaryCtaRef.current;
    if (!target) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        setVisible(!entry.isIntersecting);
      },
      { root: null, threshold: 0.15, rootMargin: "0px 0px -80px 0px" },
    );
    observer.observe(target);
    return () => observer.disconnect();
  }, [primaryCtaRef]);

  if (!visible) return null;

  const label = live
    ? uiStrings.watchLiveCta(modelName)
    : uiStrings.notifyWhenLive;

  return (
    <div
      ref={selfRef}
      className="pointer-events-none fixed inset-x-0 bottom-[calc(3.25rem+env(safe-area-inset-bottom,0px))] z-40 px-3 lg:hidden"
      style={{ zIndex: Z_BOTTOM_CHROME - 1 }}
    >
      <AffiliateOutboundLink
        href={href}
        onClick={() => trackCtaClickOut("sticky", profileSlug)}
        className={`pointer-events-auto flex w-full items-center justify-center rounded-full px-5 py-3.5 text-sm font-extrabold shadow-lg ${
          live
            ? "bg-[var(--nx-action)] text-black"
            : "border border-white/15 bg-[#1C1C1E] text-white"
        }`}
      >
        {label}
      </AffiliateOutboundLink>
    </div>
  );
}
