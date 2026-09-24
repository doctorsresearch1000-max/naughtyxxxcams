import { exploreCategories } from "@/data/mock";

export function CategoryPills() {
  return (
    <div className="hide-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4 pb-1">
      {exploreCategories.map((cat) => (
        <button
          key={cat.id}
          type="button"
          className={`shrink-0 rounded-full border px-4 py-2 text-xs font-bold uppercase tracking-wide transition ${
            cat.accent
              ? "border-magenta/60 bg-magenta/20 text-pink-100 shadow-neon"
              : "border-cyan/25 bg-surface/80 text-slate-200 hover:border-cyan/50"
          }`}
        >
          {cat.label}
        </button>
      ))}
    </div>
  );
}
