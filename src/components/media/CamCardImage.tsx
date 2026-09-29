"use client";

import Image from "next/image";
import { useCallback, useMemo, useState } from "react";
import {
  buildResponsiveCardImage,
  DESKTOP_CARD_WIDTHS,
  MOBILE_CARD_SIZES_ATTR,
  MOBILE_CARD_WIDTHS,
} from "@/lib/media/cdnImage";

type CamCardImageProps = {
  src: string;
  alt: string;
  priority?: boolean;
  fetchPriority?: "high" | "low" | "auto";
  sizes?: string;
  className?: string;
  hoverSrc?: string | null;
  showHoverLayer?: boolean;
  /** Use wider srcset for desktop catalog grids. */
  desktopWidths?: boolean;
};

export function CamCardImage({
  src,
  alt,
  priority = false,
  fetchPriority = "auto",
  sizes = MOBILE_CARD_SIZES_ATTR,
  className = "object-cover",
  hoverSrc,
  showHoverLayer = false,
  desktopWidths = false,
}: CamCardImageProps) {
  const [loaded, setLoaded] = useState(false);
  const [useJpegFallback, setUseJpegFallback] = useState(false);

  const responsive = useMemo(
    () =>
      buildResponsiveCardImage(src, {
        sizes,
        widths: desktopWidths ? DESKTOP_CARD_WIDTHS : MOBILE_CARD_WIDTHS,
        format: useJpegFallback ? "jpeg" : "webp",
      }),
    [src, sizes, useJpegFallback, desktopWidths],
  );

  const hoverResponsive = useMemo(
    () =>
      hoverSrc
        ? buildResponsiveCardImage(hoverSrc, { sizes, format: "webp" })
        : null,
    [hoverSrc, sizes],
  );

  const onPrimaryError = useCallback(() => {
    if (!useJpegFallback) setUseJpegFallback(true);
  }, [useJpegFallback]);

  const useNativeImg = Boolean(responsive?.srcSet);

  const fadeClass = loaded ? "opacity-100" : "opacity-0";

  return (
    <>
      {useNativeImg ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={responsive!.src}
          srcSet={responsive!.srcSet}
          sizes={responsive!.sizes}
          alt={alt}
          width={320}
          height={240}
          decoding="async"
          loading={priority ? "eager" : "lazy"}
          fetchPriority={priority ? "high" : fetchPriority}
          onLoad={() => setLoaded(true)}
          onError={onPrimaryError}
          className={`absolute inset-0 h-full w-full transition-opacity duration-300 motion-reduce:transition-none ${
            showHoverLayer ? "opacity-0" : fadeClass
          } ${className}`}
        />
      ) : (
        <Image
          src={src}
          alt={alt}
          fill
          sizes={sizes}
          className={`transition-opacity duration-300 motion-reduce:transition-none ${
            showHoverLayer ? "opacity-0" : fadeClass
          } ${className}`}
          loading={priority ? "eager" : "lazy"}
          fetchPriority={priority ? "high" : fetchPriority}
          decoding="async"
          unoptimized
          onLoad={() => setLoaded(true)}
          onError={onPrimaryError}
        />
      )}

      {!loaded && !showHoverLayer ? (
        <div
          className="pointer-events-none absolute inset-0 animate-pulse bg-zinc-800/90"
          aria-hidden
        />
      ) : null}

      {hoverSrc && hoverResponsive ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={hoverResponsive.src}
          srcSet={hoverResponsive.srcSet}
          sizes={hoverResponsive.sizes}
          alt=""
          aria-hidden
          decoding="async"
          loading="lazy"
          className={`pointer-events-none absolute inset-0 h-full w-full transition-opacity duration-200 motion-reduce:transition-none ${
            showHoverLayer ? "opacity-100" : "opacity-0"
          } ${className}`}
        />
      ) : null}
    </>
  );
}
