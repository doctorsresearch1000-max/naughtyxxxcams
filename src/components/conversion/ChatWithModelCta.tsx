"use client";

type ChatWithModelCtaProps = {
  modelName: string;
  affiliateUrl: string;
  visible: boolean;
  className?: string;
};

export function ChatWithModelCta({
  modelName,
  affiliateUrl,
  visible,
  className = "",
}: ChatWithModelCtaProps) {
  return (
    <a
      href={affiliateUrl}
      target="_blank"
      rel="nofollow noopener sponsored"
      className={`pointer-events-auto inline-flex max-w-full items-center justify-center rounded-full bg-[#39FF14] px-4 py-2.5 text-xs font-extrabold text-black shadow-[0_0_20px_rgba(57,255,20,0.35)] transition-all duration-500 hover:bg-[#00FF7F] active:scale-[0.98] ${
        visible
          ? "translate-y-0 opacity-100"
          : "pointer-events-none translate-y-2 opacity-0"
      } ${className}`}
      aria-hidden={!visible}
      tabIndex={visible ? 0 : -1}
    >
      Chat with {modelName}
    </a>
  );
}
