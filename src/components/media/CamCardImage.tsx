"use client";

import Image from "next/image";
import { useMemo } from "react";
import { buildResponsiveCardImage } from "@/lib/media/cdnImage";

type CamCardImageProps = {
  src: string;
  alt: string;
  priority?: boolean;
  fetchPriority?: "high" | "low" | "auto";
  sizes?: string;
  className?: string;
  /** Second layer for desktop hover preview */
  hoverSrc?: string | null;
  showHoverLayer?: boolean;
};

export function CamCardImage({
  src,
  alt,
  priority = false,
  fetchPriority = "auto",
  sizes,
  className = "object-cover",
  hoverSrc,
  showHoverLayer = false,
}: CamCardImageProps) {
  const responsive = useMemo(
    () => buildResponsiveCardImage(src, { sizes }),
    [src, sizes],
  );

  const hoverResponsive = useMemo(
    () => (hoverSrc ? buildResponsiveCardImage(hoverSrc, { sizes }) : null),
    [hoverSrc, sizes],
  );

  const useNativeImg = Boolean(responsive?.srcSet);

  return (
    <>
      {useNativeImg ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={responsive!.src}
          srcSet={responsive!.srcSet}
          sizes={responsive!.sizes}
          alt={alt}
          decoding="async"
          loading={priority ? "eager" : "lazy"}
          fetchPriority={fetchPriority}
          className={`absolute inset-0 h-full w-full transition-opacity duration-200 motion-reduce:transition-none ${
            showHoverLayer ? "opacity-0" : "opacity-100"
          } ${className}`}
        />
      ) : (
        <Image
          src={src}
          alt={alt}
          fill
          sizes={sizes ?? "(max-width: 640px) 50vw, 16vw"}
          className={`transition-opacity duration-200 motion-reduce:transition-none ${
            showHoverLayer ? "opacity-0" : "opacity-100"
          } ${className}`}
          loading={priority ? "eager" : "lazy"}
          fetchPriority={fetchPriority}
          decoding="async"
          unoptimized
        />
      )}

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
