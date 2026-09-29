"use client";

import Image from "next/image";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  buildMobileCardImageSrc,
  buildResponsiveCardImage,
  DESKTOP_CARD_WIDTHS,
  MOBILE_CARD_SIZES_ATTR,
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

type FallbackStage = "webp" | "jpeg" | "original";

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
  const [fallbackStage, setFallbackStage] = useState<FallbackStage>("webp");

  useEffect(() => {
    setLoaded(false);
    setFallbackStage("webp");
  }, [src]);

  const primarySrc = useMemo(() => {
    if (fallbackStage === "original") {
      return src;
    }
    if (desktopWidths) {
      const responsive = buildResponsiveCardImage(src, {
        sizes,
        widths: DESKTOP_CARD_WIDTHS,
        format: fallbackStage === "jpeg" ? "jpeg" : "webp",
      });
      return responsive?.src ?? src;
    }
    return buildMobileCardImageSrc(
      src,
      fallbackStage === "jpeg" ? "jpeg" : "webp",
    );
  }, [src, sizes, fallbackStage, desktopWidths]);

  const desktopResponsive = useMemo(
    () =>
      desktopWidths
        ? buildResponsiveCardImage(src, {
            sizes,
            widths: DESKTOP_CARD_WIDTHS,
            format: fallbackStage === "jpeg" ? "jpeg" : "webp",
          })
        : null,
    [src, sizes, fallbackStage, desktopWidths],
  );

  const hoverResponsive = useMemo(
    () =>
      hoverSrc
        ? buildResponsiveCardImage(hoverSrc, {
            sizes,
            mobileSingle: !desktopWidths,
            format: "webp",
          })
        : null,
    [hoverSrc, sizes, desktopWidths],
  );

  const onPrimaryError = useCallback(() => {
    if (fallbackStage === "webp") {
      setFallbackStage("jpeg");
      return;
    }
    if (fallbackStage === "jpeg") {
      setFallbackStage("original");
    }
  }, [fallbackStage]);

  const onPrimaryLoad = useCallback(() => {
    setLoaded(true);
  }, []);

  const loadingAttr = priority ? "eager" : "lazy";
  const fetchPri = priority ? "high" : fetchPriority;

  const useDesktopSrcSet =
    desktopWidths &&
    Boolean(desktopResponsive?.srcSet) &&
    fallbackStage !== "original";

  const showSkeleton = !loaded && !showHoverLayer;

  return (
    <>
      {showSkeleton ? (
        <div
          className="pointer-events-none absolute inset-0 -z-10 animate-pulse bg-zinc-800/90"
          aria-hidden
        />
      ) : null}

      {useDesktopSrcSet ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={desktopResponsive!.src}
          srcSet={desktopResponsive!.srcSet!}
          sizes={desktopResponsive!.sizes}
          alt={alt}
          width={320}
          height={240}
          decoding="async"
          loading={loadingAttr}
          fetchPriority={fetchPri}
          onLoad={onPrimaryLoad}
          onError={onPrimaryError}
          className={`absolute inset-0 z-0 h-full w-full ${
            showHoverLayer ? "opacity-0" : "opacity-100"
          } ${className}`}
        />
      ) : primarySrc ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={primarySrc}
          alt={alt}
          width={320}
          height={240}
          decoding="async"
          loading={loadingAttr}
          fetchPriority={fetchPri}
          onLoad={onPrimaryLoad}
          onError={onPrimaryError}
          className={`absolute inset-0 z-0 h-full w-full ${
            showHoverLayer ? "opacity-0" : "opacity-100"
          } ${className}`}
        />
      ) : (
        <Image
          src={src}
          alt={alt}
          fill
          sizes={sizes}
          className={`z-0 ${showHoverLayer ? "opacity-0" : "opacity-100"} ${className}`}
          loading={loadingAttr}
          fetchPriority={fetchPri}
          decoding="async"
          unoptimized
          onLoad={onPrimaryLoad}
          onError={onPrimaryError}
        />
      )}

      {hoverSrc && hoverResponsive?.src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={hoverResponsive.src}
          srcSet={hoverResponsive.srcSet ?? undefined}
          sizes={hoverResponsive.sizes}
          alt=""
          aria-hidden
          decoding="async"
          loading="lazy"
          className={`pointer-events-none absolute inset-0 z-0 h-full w-full transition-opacity duration-200 motion-reduce:transition-none ${
            showHoverLayer ? "opacity-100" : "opacity-0"
          } ${className}`}
        />
      ) : null}
    </>
  );
}
