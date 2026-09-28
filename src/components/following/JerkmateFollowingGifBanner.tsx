import Image from "next/image";
import {
  JERKMATE_FOLLOWING_GIF_BANNER_URL,
  JERKMATE_FOLLOWING_GIF_TRACKING_URL,
} from "@/lib/crackrevenue/jerkmateTracking";

/** 300×100 Jerkmate GIF on `/following`. */
export function JerkmateFollowingGifBanner() {
  return (
    <div className="my-4 flex w-full justify-center overflow-hidden">
      <a
        href={JERKMATE_FOLLOWING_GIF_TRACKING_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-block overflow-hidden rounded-lg border border-zinc-800 shadow-lg transition-all hover:border-zinc-700"
      >
        <Image
          src={JERKMATE_FOLLOWING_GIF_BANNER_URL}
          alt="Jerkmate Live Cams"
          width={300}
          height={100}
          unoptimized
          className="block h-auto max-w-full object-contain"
        />
      </a>
    </div>
  );
}
