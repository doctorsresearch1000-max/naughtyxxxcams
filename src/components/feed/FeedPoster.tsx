"use client";

type FeedPosterProps = {
  feedKey: string;
  posterUrl: string;
  priority?: boolean;
  className?: string;
};

/** Póster por tarjeta — key + src únicos para evitar caché cruzada en WebKit. */
export function FeedPoster({
  feedKey,
  posterUrl,
  priority = false,
  className = "",
}: FeedPosterProps) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      key={`poster-${feedKey}`}
      src={posterUrl}
      alt=""
      decoding="async"
      loading={priority ? "eager" : "lazy"}
      fetchPriority={priority ? "high" : "auto"}
      className={className}
      data-feed-key={feedKey}
    />
  );
}
