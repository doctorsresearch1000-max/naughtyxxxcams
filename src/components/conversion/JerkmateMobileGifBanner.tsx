import Image from "next/image";
import {
  JERKMATE_MOBILE_GIF_BANNER_URL,
  JERKMATE_MOBILE_GIF_TRACKING_URL,
} from "@/lib/crackrevenue/jerkmateTracking";

/** 300×100 Jerkmate GIF — home mobile only (`md:hidden`). */
export function JerkmateMobileGifBanner() {
  return (
    <div className="my-3 flex w-full justify-center overflow-hidden md:hidden">
      <a
        href={JERKMATE_MOBILE_GIF_TRACKING_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-block overflow-hidden rounded-lg border border-zinc-800 shadow-lg"
      >
        <Image
          src={JERKMATE_MOBILE_GIF_BANNER_URL}
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
