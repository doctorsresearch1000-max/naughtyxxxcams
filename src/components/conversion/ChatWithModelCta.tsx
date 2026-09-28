"use client";

import { AffiliateOutboundLink } from "@/components/conversion/AffiliateOutboundLink";

type ChatWithModelCtaProps = {
  modelName: string;
  affiliateUrl: string;
  visible: boolean;
  /** Optional glow pulse after dwell time (CTA remains visible). */
  attentionPulse?: boolean;
  className?: string;
};

export function ChatWithModelCta({
  modelName,
  affiliateUrl,
  visible,
  attentionPulse = false,
  className = "",
}: ChatWithModelCtaProps) {
  return (
    <AffiliateOutboundLink
      href={affiliateUrl}
      className={`pointer-events-auto inline-flex min-h-[56px] w-[min(100%,19.5rem)] max-w-full items-center justify-center rounded-full bg-[#39FF14] px-8 py-3.5 text-[15px] leading-tight font-extrabold text-black shadow-[0_0_28px_rgba(57,255,20,0.42)] transition-all duration-500 hover:bg-[#00FF7F] active:scale-[0.98] ${
        visible
          ? "translate-y-0 opacity-100"
          : "pointer-events-none translate-y-2 opacity-0"
      } ${
        attentionPulse && visible
          ? "animate-[cta-glow_1.8s_ease-in-out_infinite] ring-2 ring-[#39FF14]/55"
          : ""
      } ${className}`}
    >
      Chat with {modelName}
    </AffiliateOutboundLink>
  );
}
