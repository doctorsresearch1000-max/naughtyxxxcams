import Image from "next/image";
import {
  JERKMATE_EXPLORE_GIF_BANNER_URL,
  JERKMATE_EXPLORE_GIF_TRACKING_URL,
} from "@/lib/crackrevenue/jerkmateTracking";

/** 300×100 Jerkmate GIF — `/explore`, below live story avatars. */
export function JerkmateExploreGifBanner() {
  return (
    <div className="my-3 flex w-full justify-center overflow-hidden lg:my-2">
      <a
        href={JERKMATE_EXPLORE_GIF_TRACKING_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-block overflow-hidden rounded-lg border border-zinc-800 shadow-lg transition-all hover:border-zinc-700"
      >
        <Image
          src={JERKMATE_EXPLORE_GIF_BANNER_URL}
          alt="Jerkmate Cams Offer"
          width={300}
          height={100}
          unoptimized
          className="block h-auto max-w-full object-contain"
        />
      </a>
    </div>
  );
}
