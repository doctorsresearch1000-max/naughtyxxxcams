import Link from "next/link";
import { EXPLORE_CATALOG_MENU } from "@/lib/explore/exploreCatalog";
import { explorePathForCategorySlug } from "@/lib/explore/paths";
import { isExploreCategorySlug } from "@/lib/explore/categorySlugs";

const GRADIENTS = [
  "from-rose-600/80 via-pink-600/50 to-purple-900/80",
  "from-fuchsia-600/70 via-pink-500/40 to-black/80",
  "from-purple-700/80 via-rose-600/50 to-black/90",
  "from-pink-600/70 via-violet-600/40 to-black/85",
];

/** Static category shortcuts when API popular categories are unavailable. */
export function ExploreSlushyCategoryShortcuts() {
  const items = EXPLORE_CATALOG_MENU.filter((item) =>
    isExploreCategorySlug(item.slug),
  ).slice(0, 8);

  if (items.length === 0) return null;

  return (
    <div className="grid grid-cols-2 gap-3">
      {items.map((item, index) => (
        <Link
          key={item.slug}
          href={explorePathForCategorySlug(item.slug)}
          className="group relative flex h-24 items-end overflow-hidden rounded-2xl border border-zinc-800/80 p-3 shadow-md transition active:scale-[0.98]"
        >
          <div
            className={`absolute inset-0 bg-gradient-to-br ${GRADIENTS[index % GRADIENTS.length]}`}
            aria-hidden
          />
          <span className="relative text-sm font-black tracking-wide text-white">
            {item.label}
          </span>
        </Link>
      ))}
    </div>
  );
}
