import Link from "next/link";
import {
  EXPLORE_HUB_CATEGORY_SLUGS,
  type ExploreHubCategorySlug,
} from "@/lib/explore/exploreCategoryHubSlugs";
import { EXPLORE_CATEGORY_MAP } from "@/lib/explore/categorySlugs";
import { explorePathForCategorySlug } from "@/lib/explore/paths";
import { themeForCategorySlug } from "@/lib/explore/exploreCategoryVisualTheme";

type ExploreHubRelatedCategoriesProps = {
  currentSlug: ExploreHubCategorySlug;
};

export function ExploreHubRelatedCategories({
  currentSlug,
}: ExploreHubRelatedCategoriesProps) {
  const others = EXPLORE_HUB_CATEGORY_SLUGS.filter((s) => s !== currentSlug);

  return (
    <section className="mb-5" aria-labelledby="related-niches-heading">
      <h2
        id="related-niches-heading"
        className="mb-2.5 text-[11px] font-black uppercase tracking-wider text-zinc-500"
      >
        More popular niches
      </h2>
      <ul className="flex flex-wrap gap-2">
        {others.map((slug) => {
          const config = EXPLORE_CATEGORY_MAP[slug];
          const theme = themeForCategorySlug(slug);
          return (
            <li key={slug}>
              <Link
                href={explorePathForCategorySlug(slug)}
                className="inline-flex items-center gap-2 rounded-full bg-[#1a1a1e] px-3 py-2 text-[11px] font-bold text-zinc-200 ring-1 ring-white/[0.06] transition hover:ring-[#39FF14]/40 hover:text-white active:scale-[0.98]"
              >
                <span
                  className="h-2 w-2 shrink-0 rounded-full bg-[#39FF14]/80"
                  aria-hidden
                />
                {config.label}
                <span className="sr-only"> — {theme.kicker}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
