import type { JerkmatePromoKey } from "@/lib/go/jerkmatePromoKeys";
import { SecureAffiliateLink } from "@/components/conversion/SecureAffiliateLink";

type ExploreJerkmatePromoBannerProps = {
  promo: JerkmatePromoKey;
  className?: string;
};

export function ExploreJerkmatePromoBanner({
  promo,
  className = "",
}: ExploreJerkmatePromoBannerProps) {
  return (
    <div
      className={`relative overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900 ring-1 ring-[#39FF14]/15 ${className}`}
    >
      <SecureAffiliateLink
        promo={promo}
        className="flex min-h-[88px] w-full flex-col items-start justify-center gap-1 px-4 py-3 text-left transition hover:bg-zinc-800/60"
      >
        <span className="text-xs font-black tracking-widest text-[#39FF14]">
          SPONSORED
        </span>
        <span className="text-sm font-extrabold text-white">
          Jerkmate — claim your free pass
        </span>
        <span className="text-[11px] font-medium text-zinc-400">
          Top live models · HD streams
        </span>
      </SecureAffiliateLink>
    </div>
  );
}
