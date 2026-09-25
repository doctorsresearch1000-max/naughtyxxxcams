"use client";

import type { MouseEvent, ReactNode } from "react";
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
  const handleClick = (event: MouseEvent<HTMLAnchorElement>) => {
    event.stopPropagation();
    event.preventDefault();
    onClick?.();
    openAffiliateOutbound(href);
  };

  return (
    <a
      href={href}
      onClick={handleClick}
      target="_blank"
      rel="nofollow noopener sponsored"
      className={className}
    >
      {children}
    </a>
  );
}
