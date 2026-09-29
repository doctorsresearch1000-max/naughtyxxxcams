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
      className={`rounded-2xl border border-zinc-800/80 bg-zinc-950/40 ring-1 ring-zinc-900 ${className}`}
      aria-label="Profile discovery summary"
    >
      <details className="group p-4" open={false}>
        <summary className="cursor-pointer text-sm font-black leading-snug text-zinc-100 list-none [&::-webkit-details-marker]:hidden">
          {seo.visibleHeading}
          <span className="float-right text-zinc-500 group-open:rotate-180">▾</span>
        </summary>
        <div className="mt-3 flex flex-wrap gap-1.5">
          {seo.highlightKeywords.map((kw) => (
            <span
              key={kw}
              className="rounded-md bg-zinc-900 px-2 py-0.5 text-[10px] font-semibold lowercase text-[var(--nx-action)] ring-1 ring-[var(--nx-action)]/25"
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
      </details>
    </section>
  );
}
