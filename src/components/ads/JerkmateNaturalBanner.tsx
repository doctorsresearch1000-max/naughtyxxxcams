import Image from "next/image";
import Link from "next/link";
import {
  SponsoredAdOverlays,
  SponsoredFreePromoLine,
} from "@/components/ads/SponsoredAdOverlays";

const BANNER_ASPECT = 300 / 100;

type JerkmateNaturalBannerProps = {
  href: string;
  imageSrc: string;
  alt: string;
  className?: string;
};

/** Full-width 300×100 style banner — natural aspect, sponsored labels. */
export function JerkmateNaturalBanner({
  href,
  imageSrc,
  alt,
  className = "",
}: JerkmateNaturalBannerProps) {
  return (
    <div className={`w-full ${className}`} aria-label="Sponsored offer">
      <Link
        href={href}
        target="_blank"
        rel="nofollow noopener sponsored"
        className="group block w-full overflow-hidden rounded-[var(--nx-radius-card)] bg-zinc-950 ring-1 ring-pink-500/40 transition hover:ring-pink-400/55"
      >
        <div
          className="relative mx-auto w-full max-w-[970px] overflow-hidden"
          style={{ aspectRatio: `${BANNER_ASPECT}` }}
        >
          <Image
            src={imageSrc}
            alt={alt}
            fill
            sizes="(max-width: 768px) 100vw, 970px"
            width={970}
            height={323}
            className="object-cover object-center"
            loading="lazy"
            decoding="async"
            unoptimized
          />
          <SponsoredAdOverlays badge="SPONSORED" />
        </div>
        <div className="px-2 py-2">
          <p className="truncate text-sm font-extrabold text-white">
            Jerkmate Live
          </p>
          <SponsoredFreePromoLine className="mt-0.5" />
        </div>
      </Link>
    </div>
  );
}
