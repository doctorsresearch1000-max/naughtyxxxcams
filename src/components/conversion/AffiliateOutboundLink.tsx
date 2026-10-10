"use client";

import type { MouseEvent, ReactNode } from "react";
import { ensureAffiliateSubid } from "@/lib/crackrevenue/crak-subid";
import { openAffiliateOutbound } from "@/lib/crackrevenue/jerkmateAffiliate";

type AffiliateOutboundLinkProps = {
  href: string;
  className?: string;
  children: ReactNode;
  onClick?: () => void;
};

export function AffiliateOutboundLink({
  href,
  className = "",
  children,
  onClick,
}: AffiliateOutboundLinkProps) {
  const outboundHref = ensureAffiliateSubid(href);

  const handleClick = (event: MouseEvent<HTMLAnchorElement>) => {
    event.stopPropagation();
    event.preventDefault();
    onClick?.();
    openAffiliateOutbound(outboundHref);
  };

  return (
    <a
      href={outboundHref}
      onClick={handleClick}
      target="_blank"
      rel="nofollow noopener sponsored"
      className={className}
    >
      {children}
    </a>
  );
}
