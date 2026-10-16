"use client";

import type { ReactNode } from "react";
import type { JerkmatePromoKey } from "@/lib/go/jerkmatePromoKeys";
import { SecureAffiliateLink } from "@/components/conversion/SecureAffiliateLink";

type AffiliateOutboundLinkProps = {
  profileSlug?: string;
  promo?: JerkmatePromoKey;
  className?: string;
  children: ReactNode;
  onClick?: () => void;
};

/** @deprecated name kept for call sites — always routes through signed go-token flow. */
export function AffiliateOutboundLink({
  profileSlug,
  promo,
  className = "",
  children,
  onClick,
}: AffiliateOutboundLinkProps) {
  return (
    <SecureAffiliateLink
      profileSlug={profileSlug}
      promo={promo}
      className={className}
      onClick={onClick}
    >
      {children}
    </SecureAffiliateLink>
  );
}
