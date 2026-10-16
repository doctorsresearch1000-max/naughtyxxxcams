"use client";

import type { MouseEvent, ReactNode } from "react";
import type { JerkmatePromoKey } from "@/lib/go/jerkmatePromoKeys";
import { openSecureAffiliateGo } from "@/lib/go/openSecureAffiliateGo";
import { modelPermalinkPath } from "@/lib/profile/performerHandle";

type SecureAffiliateLinkProps = {
  profileSlug?: string;
  promo?: JerkmatePromoKey;
  className?: string;
  children: ReactNode;
  onClick?: () => void;
};

export function SecureAffiliateLink({
  profileSlug,
  promo,
  className = "",
  children,
  onClick,
}: SecureAffiliateLinkProps) {
  const safeHref =
    profileSlug?.trim()
      ? modelPermalinkPath(profileSlug.trim())
      : promo
        ? "/explore"
        : "/";

  const handleClick = async (event: MouseEvent<HTMLAnchorElement>) => {
    event.stopPropagation();
    event.preventDefault();
    onClick?.();

    if (profileSlug?.trim()) {
      await openSecureAffiliateGo({ profileSlug: profileSlug.trim() });
      return;
    }
    if (promo) {
      await openSecureAffiliateGo({ promo });
    }
  };

  return (
    <a
      href={safeHref}
      onClick={handleClick}
      rel="nofollow noopener sponsored"
      className={className}
    >
      {children}
    </a>
  );
}
