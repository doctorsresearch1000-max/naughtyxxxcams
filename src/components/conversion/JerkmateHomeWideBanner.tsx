import Image from "next/image";
import {
  JERKMATE_MOBILE_GIF_BANNER_URL,
  JERKMATE_MOBILE_GIF_TRACKING_URL,
} from "@/lib/crackrevenue/jerkmateTracking";

/** Full-width responsive leaderboard (728×90 / 970×90 style) — home catalog. */
export function JerkmateHomeWideBanner() {
  return (
    <div className="mb-2 flex w-full justify-center overflow-hidden px-2 pt-0">
      <a
        href={JERKMATE_MOBILE_GIF_TRACKING_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="block w-full max-w-[970px] overflow-hidden rounded-lg border border-zinc-800 shadow-lg transition-all hover:border-zinc-700"
      >
        <Image
          src={JERKMATE_MOBILE_GIF_BANNER_URL}
          alt="Jerkmate Live Cams"
          width={970}
          height={90}
          unoptimized
          className="block h-auto w-full max-w-full object-contain"
          sizes="(max-width: 768px) 100vw, 970px"
        />
      </a>
    </div>
  );
}
