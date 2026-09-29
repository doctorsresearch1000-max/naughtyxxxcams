import Image from "next/image";
import Link from "next/link";
import {
  JERKMATE_EXPLORE_GIF_BANNER_URL,
  JERKMATE_EXPLORE_GIF_TRACKING_URL,
} from "@/lib/crackrevenue/jerkmateTracking";

const BANNER_ASPECT = 300 / 100;

type ProfileSponsorAdCardProps = {
  className?: string;
};

/**
 * Responsive 300×100 GIF sponsor unit — preserves aspect ratio without cropping.
 */
export function ProfileSponsorAdCard({ className = "" }: ProfileSponsorAdCardProps) {
  return (
    <section
      className={className}
      aria-label="Sponsored offer"
    >
      <p className="mb-2 text-[10px] font-bold uppercase tracking-wide text-zinc-500">
        Ad
      </p>
      <Link
        href={JERKMATE_EXPLORE_GIF_TRACKING_URL}
        target="_blank"
        rel="nofollow noopener sponsored"
        className="block overflow-hidden rounded-[var(--nx-radius-card)] bg-zinc-950 ring-1 ring-zinc-800 transition hover:ring-zinc-700"
      >
        <div
          className="relative w-full max-w-full"
          style={{ aspectRatio: `${BANNER_ASPECT}` }}
        >
          <Image
            src={JERKMATE_EXPLORE_GIF_BANNER_URL}
            alt="Sponsored live cam offer"
            fill
            sizes="(max-width: 448px) 100vw, 400px"
            className="object-contain object-center"
            unoptimized
          />
        </div>
      </Link>
    </section>
  );
}
