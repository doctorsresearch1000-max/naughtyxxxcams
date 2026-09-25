import type { GeneratedProfileSEO } from "@/lib/profile/seoContent";

type ProfileSeoContentBlockProps = {
  seo: Pick<
    GeneratedProfileSEO,
    "visibleHeading" | "visibleParagraphs" | "highlightKeywords"
  >;
  className?: string;
};

export function ProfileSeoContentBlock({
  seo,
  className = "",
}: ProfileSeoContentBlockProps) {
  return (
    <section
      className={`rounded-2xl border border-zinc-800/80 bg-zinc-950/40 p-4 ring-1 ring-zinc-900 ${className}`}
      aria-label="Profile discovery summary"
    >
      <h2 className="text-sm font-black leading-snug text-zinc-100">
        {seo.visibleHeading}
      </h2>
      <div className="mt-3 flex flex-wrap gap-1.5">
        {seo.highlightKeywords.map((kw) => (
          <span
            key={kw}
            className="rounded-md bg-zinc-900 px-2 py-0.5 text-[10px] font-semibold lowercase text-[#39FF14] ring-1 ring-[#39FF14]/25"
          >
            {kw}
          </span>
        ))}
      </div>
      <div className="mt-3 space-y-2 text-xs leading-relaxed text-zinc-400">
        {seo.visibleParagraphs.map((paragraph) => (
          <p key={paragraph.slice(0, 48)}>{paragraph}</p>
        ))}
      </div>
    </section>
  );
}
