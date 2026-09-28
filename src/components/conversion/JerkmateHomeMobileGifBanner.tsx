import Image from "next/image";
import {
  JERKMATE_MOBILE_GIF_BANNER_URL,
  JERKMATE_MOBILE_GIF_TRACKING_URL,
} from "@/lib/crackrevenue/jerkmateTracking";

/** Full-bleed mobile banner (after first 4 cards on home). */
export function JerkmateHomeMobileGifBanner() {
  return (
    <div className="my-4 w-full overflow-hidden md:hidden">
      <a
        href={JERKMATE_MOBILE_GIF_TRACKING_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="block w-full overflow-hidden rounded-xl border border-zinc-800/90 bg-zinc-950 shadow-md"
      >
        <Image
          src={JERKMATE_MOBILE_GIF_BANNER_URL}
          alt="Jerkmate Live Cams"
          width={970}
          height={120}
          unoptimized
          className="block h-auto max-h-[88px] w-full object-cover object-center"
          sizes="100vw"
        />
      </a>
    </div>
  );
}
