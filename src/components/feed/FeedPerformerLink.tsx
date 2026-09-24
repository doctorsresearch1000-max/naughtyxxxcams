"use client";

import Link from "next/link";
import type { MouseEvent, PointerEvent } from "react";

type FeedPerformerLinkProps = {
  href: string;
  children: React.ReactNode;
  className?: string;
  ariaLabel?: string;
};

function stopFeedBubble(
  e: MouseEvent<HTMLAnchorElement> | PointerEvent<HTMLAnchorElement>,
) {
  e.stopPropagation();
}

export function FeedPerformerLink({
  href,
  children,
  className = "",
  ariaLabel,
}: FeedPerformerLinkProps) {
  return (
    <Link
      href={href}
      aria-label={ariaLabel}
      className={className}
      onClick={stopFeedBubble}
      onPointerDown={stopFeedBubble}
    >
      {children}
    </Link>
  );
}
