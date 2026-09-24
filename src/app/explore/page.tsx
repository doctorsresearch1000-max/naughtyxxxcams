import { Search } from "lucide-react";
import { CategoryPills } from "@/components/explore/CategoryPills";
import { TrendingCard } from "@/components/explore/TrendingCard";
import { trendingModels } from "@/data/mock";

export default function ExplorePage() {
  return (
    <main className="min-h-dvh bg-night px-4 pb-24 pt-[max(1rem,env(safe-area-inset-top))]">
      <header className="space-y-4">
        <h1 className="text-2xl font-black tracking-tight">
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
        <CategoryPills />
      </header>

      <section className="mt-8" aria-labelledby="trending-heading">
        <h2 id="trending-heading" className="mb-4 text-lg font-extrabold">
          Trending Now
        </h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {trendingModels.map((model) => (
            <TrendingCard key={model.id} model={model} />
          ))}
        </div>
      </section>
    </main>
  );
}
