import Link from "next/link";
import { SlushyBrandLogo } from "@/components/brand/SlushyBrandLogo";

export function Footer() {
  return (
    <footer
      className="relative z-0 mt-10 shrink-0 border-t border-white/10 bg-[#0A0A0A] px-4 pb-[calc(5rem+env(safe-area-inset-bottom))] pt-10 text-sm text-neutral-400 md:px-8"
    >
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-10 sm:grid-cols-2 sm:gap-8 lg:grid-cols-5 lg:gap-6">
        <div className="space-y-4 sm:col-span-2 lg:col-span-1">
          <div className="flex flex-wrap items-center gap-3">
            <SlushyBrandLogo variant="compact" href="/" />
            <span className="rounded bg-red-600 px-2 py-0.5 text-xs font-bold text-white">
              18+
            </span>
          </div>
          <p className="max-w-md text-xs leading-relaxed text-neutral-400">
            NaughtyXXXCams is a mobile-first live webcam directory powered by
            verified Streamate performers in HD. Browse trending rooms, save
            favorites, and jump into chat in seconds. All models are verified
            adults 18+.
          </p>
        </div>

        <div className="min-w-0 space-y-3">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-white">
            Live Categories
          </h3>
          <ul className="grid grid-cols-1 gap-2 text-xs sm:gap-2">
            <li>
              <Link href="/explore?cat=latinas" className="hover:text-white">
                Latina Models
              </Link>
            </li>
            <li>
              <Link href="/explore?cat=verified" className="hover:text-white">
                Verified 18+
              </Link>
            </li>
            <li>
              <Link href="/explore?cat=milf" className="hover:text-white">
                MILF & Mature
              </Link>
            </li>
            <li>
              <Link href="/explore?cat=petite" className="hover:text-white">
                Petite & E-girls
              </Link>
            </li>
            <li>
              <Link href="/explore?cat=cosplay" className="hover:text-white">
                Cosplay
              </Link>
            </li>
            <li>
              <Link href="/explore?cat=couples" className="hover:text-white">
                Couples
              </Link>
            </li>
            <li>
              <Link href="/explore?cat=trans" className="hover:text-white">
                Trans Models
              </Link>
            </li>
            <li>
              <Link href="/explore?cat=alt" className="hover:text-white">
                Alt & Goth
              </Link>
            </li>
          </ul>
        </div>

        <div className="min-w-0 space-y-3">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-white">
            Show Types
          </h3>
          <ul className="grid grid-cols-1 gap-2 text-xs">
            <li>
              <Link href="/explore?show=private" className="hover:text-white">
                Private 1-on-1
              </Link>
            </li>
            <li>
              <Link href="/explore?show=lovense" className="hover:text-white">
                Interactive Toys
              </Link>
            </li>
            <li>
              <Link href="/explore?show=vip" className="hover:text-white">
                VIP & Lingerie
              </Link>
            </li>
            <li>
              <Link href="/explore?show=asmr" className="hover:text-white">
                Live ASMR
              </Link>
            </li>
            <li>
              <Link href="/explore?show=gaming" className="hover:text-white">
                Gaming Streams
              </Link>
            </li>
            <li>
              <Link href="/explore?show=debut" className="hover:text-white">
                New Model Debuts
              </Link>
            </li>
          </ul>
        </div>

        <div className="min-w-0 space-y-3">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-white">
            Explore
          </h3>
          <ul className="grid grid-cols-1 gap-2 text-xs">
            <li>
              <Link href="/" className="hover:text-white">
                Home Feed
              </Link>
            </li>
            <li>
              <Link href="/explore" className="hover:text-white">
                Discover Models
              </Link>
            </li>
            <li>
              <Link href="/following" className="hover:text-white">
                Following
              </Link>
            </li>
            <li>
              <Link href="/explore?filter=free" className="hover:text-white">
                Free Cams
              </Link>
            </li>
            <li>
              <Link href="/telegram" className="hover:text-white">
                Telegram Mini App
              </Link>
            </li>
            <li>
              <Link href="/guides" className="hover:text-white">
                Guides & Tips
              </Link>
            </li>
          </ul>
        </div>

        <div className="min-w-0 space-y-3 sm:col-span-2 lg:col-span-1">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-white">
            Legal & Support
          </h3>
          <ul className="grid grid-cols-1 gap-2 text-xs sm:grid-cols-2 sm:gap-x-6 lg:grid-cols-1">
            <li>
              <Link href="/terms" className="hover:text-white">
                Terms of Service
              </Link>
            </li>
            <li>
              <Link href="/privacy" className="hover:text-white">
                Privacy Policy
              </Link>
            </li>
            <li>
              <Link href="/dmca" className="hover:text-white">
                DMCA Notice
              </Link>
            </li>
            <li>
              <Link href="/usc-2257" className="hover:text-white">
                18 U.S.C. 2257
              </Link>
            </li>
            <li>
              <Link href="/report" className="hover:text-white">
                Report Content
              </Link>
            </li>
            <li>
              <Link href="/contact" className="hover:text-white">
                Contact
              </Link>
            </li>
            <li>
              <Link href="/affiliates" className="hover:text-white">
                Affiliate Disclosure
              </Link>
            </li>
          </ul>
        </div>
      </div>

      <div className="mx-auto mt-10 max-w-7xl border-t border-white/10 pt-6 text-xs leading-relaxed text-neutral-500">
        <p>
          © 2026 NaughtyXXXCams. All rights reserved. All models were 18 years
          of age or older at the time of depiction. Trademarks belong to their
          respective owners. This site contains affiliate links (
          <Link href="/affiliates" className="underline hover:text-neutral-300">
            learn more
          </Link>
          ); we may earn a commission at no extra cost to you.
        </p>
      </div>
    </footer>
  );
}
