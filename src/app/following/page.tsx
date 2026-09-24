export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";

import { LiveNearbyCarousel } from "@/components/following/LiveNearbyCarousel";
import { ModelListItem } from "@/components/following/ModelListItem";
import { yourModels } from "@/data/mock";

export default function FollowingPage() {
  return (
    <main className="min-h-dvh bg-night px-4 pb-24 pt-[max(1rem,env(safe-area-inset-top))]">
      <h1 className="text-2xl font-black tracking-tight">
        Following <span className="text-cyan">·</span> Live
      </h1>

      <section className="mt-6" aria-labelledby="nearby-heading">
        <h2 id="nearby-heading" className="mb-3 text-sm font-bold uppercase tracking-wider text-slate-400">
          Live Nearby
        </h2>
        <LiveNearbyCarousel />
      </section>

      <section className="mt-8 space-y-4" aria-labelledby="your-models-heading">
        <h2 id="your-models-heading" className="text-lg font-extrabold">
          Your models
        </h2>
        {yourModels.map((model) => (
          <ModelListItem key={model.id} model={model} />
        ))}
      </section>
    </main>
  );
}
