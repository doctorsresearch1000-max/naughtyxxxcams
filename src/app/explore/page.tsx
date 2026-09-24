export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";

import { Search } from "lucide-react";
import CrackWidget from "@/components/cams/CrackWidget";
import { StoriesBar } from "@/components/cams/StoriesBar";
import { CategoryPills } from "@/components/explore/CategoryPills";

export default function ExplorePage() {
  return (
    <main className="min-h-screen w-full bg-black p-2 pb-24 pt-[max(1rem,env(safe-area-inset-top))]">
      <header className="space-y-4 px-2">
        <h1 className="text-2xl font-black tracking-tight text-white">
          Explore <span className="text-magenta">Live</span>
        </h1>
        <label className="relative block">
          <span className="sr-only">Search models or tags</span>
          <Search
            className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400"
            aria-hidden
          />
          <input
            type="search"
            placeholder="Search models or tags"
            className="w-full rounded-2xl border border-cyan/20 bg-surface py-3 pl-10 pr-4 text-sm outline-none ring-magenta/0 placeholder:text-slate-500 focus:border-cyan/50 focus:ring-2 focus:ring-cyan/30"
          />
        </label>
        <StoriesBar />
        <CategoryPills />
      </header>

      <section className="mt-4" aria-labelledby="trending-heading">
        <h2 id="trending-heading" className="mb-3 px-2 text-lg font-extrabold text-white">
          Trending Now
        </h2>
        <CrackWidget
          cols={4}
          rows={3}
          number={12}
          ratio={1}
          useFeed={0}
          animateFeed={0}
          height="min-h-screen"
        />
      </section>
    </main>
  );
}
