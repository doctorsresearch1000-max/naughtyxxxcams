"use client";

import type { CSSProperties } from "react";

type FeedPosterProps = {
  feedKey: string;
  posterUrl: string;
  priority?: boolean;
  className?: string;
  style?: CSSProperties;
};

/** Póster por tarjeta — key + src únicos para evitar caché cruzada en WebKit. */
export function FeedPoster({
  feedKey,
  posterUrl,
  priority = false,
  className = "",
  style,
}: FeedPosterProps) {
  if (!posterUrl?.trim()) {
    return (
      <div
        className={`bg-zinc-900 ${className}`}
        style={style}
        data-feed-key={feedKey}
        aria-hidden
      />
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      key={`poster-${feedKey}`}
      src={posterUrl}
      alt=""
      decoding={priority ? "sync" : "async"}
      loading={priority ? "eager" : "lazy"}
      fetchPriority={priority ? "high" : "auto"}
      className={className}
      style={style}
      data-feed-key={feedKey}
    />
  );
}
