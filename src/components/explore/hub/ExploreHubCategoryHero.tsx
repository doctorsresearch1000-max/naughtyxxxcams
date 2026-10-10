import Image from "next/image";
import Link from "next/link";
import type { ExploreCategoryConfig } from "@/lib/explore/categorySlugs";
import {
  NAUGHTY_GREEN,
  themeForCategorySlug,
} from "@/lib/explore/exploreCategoryVisualTheme";
import type { ExploreSeoCopy } from "@/lib/seo/exploreSeoContent";

type ExploreHubCategoryHeroProps = {
  category: ExploreCategoryConfig;
  seo: ExploreSeoCopy;
  liveCount: number;
};

export function ExploreHubCategoryHero({
  category,
  seo,
  liveCount,
}: ExploreHubCategoryHeroProps) {
  const theme = themeForCategorySlug(category.slug);

  return (
    <header className="mb-4 space-y-3">
      <nav
        className="flex items-center gap-1.5 text-[11px] font-semibold text-zinc-500"
        aria-label="Breadcrumb"
      >
        <Link
          href="/explore"
          className="transition hover:text-[#39FF14]"
        >
          Explore
        </Link>
        <span aria-hidden className="text-zinc-700">/</span>
        <span className="text-zinc-300">{category.label}</span>
      </nav>

      <div
        className="relative aspect-[2.05/1] w-full overflow-hidden rounded-2xl ring-1 ring-[#39FF14]/25 shadow-[0_12px_40px_rgba(0,0,0,0.55)]"
      >
        <Image
          src={theme.coverImage}
          alt=""
          aria-hidden
          fill
          priority
          sizes="(max-width: 768px) 100vw, 720px"
          className="object-cover object-center"
        />
        <div
          className="absolute inset-0"
          style={{ background: theme.background }}
          aria-hidden
        />
        <div
          className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-transparent"
          aria-hidden
        />
        <div
          className="absolute left-0 top-0 z-10 h-full w-1 bg-[#39FF14] shadow-[0_0_16px_rgba(57,255,20,0.7)]"
          aria-hidden
        />

        <div className="absolute inset-x-0 bottom-0 z-10 p-4 pb-3.5">
          <p className="text-[9px] font-black uppercase tracking-[0.28em] text-[#39FF14]">
            {theme.kicker}
          </p>
          <h1 className="mt-1 text-2xl font-black uppercase leading-tight tracking-tight text-white sm:text-[1.65rem]">
            {seo.h1}
          </h1>
          {liveCount > 0 ? (
            <p className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-black/50 px-2.5 py-1 text-[10px] font-bold text-white ring-1 ring-[#39FF14]/35">
              <span
                className="inline-block h-1.5 w-1.5 rounded-full bg-[#39FF14]"
                style={{ boxShadow: `0 0 8px ${NAUGHTY_GREEN}` }}
                aria-hidden
              />
              {liveCount} live now
            </p>
          ) : null}
        </div>
      </div>

      <p className="text-sm leading-relaxed text-zinc-400">{seo.bodyBlurb}</p>
    </header>
  );
}
