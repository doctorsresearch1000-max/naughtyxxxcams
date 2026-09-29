import Image from "next/image";
import Link from "next/link";

const BANNER_ASPECT = 300 / 100;

type JerkmateNaturalBannerProps = {
  href: string;
  imageSrc: string;
  alt: string;
  className?: string;
};

/** Full-width 300×100 GIF — natural aspect, no grid crop. */
export function JerkmateNaturalBanner({
  href,
  imageSrc,
  alt,
  className = "",
}: JerkmateNaturalBannerProps) {
  return (
    <div className={`w-full ${className}`} aria-label="Sponsored offer">
      <p className="mb-1.5 text-[10px] font-bold uppercase tracking-wide text-zinc-500">
        Ad
      </p>
      <Link
        href={href}
        target="_blank"
        rel="nofollow noopener sponsored"
        className="block w-full overflow-hidden rounded-[var(--nx-radius-card)] bg-zinc-950 ring-1 ring-zinc-800 transition hover:ring-zinc-700"
      >
        <div
          className="relative mx-auto w-full max-w-[970px]"
          style={{ aspectRatio: `${BANNER_ASPECT}` }}
        >
          <Image
            src={imageSrc}
            alt={alt}
            fill
            sizes="(max-width: 768px) 100vw, 970px"
            className="object-contain object-center"
            unoptimized
          />
        </div>
      </Link>
    </div>
  );
}
