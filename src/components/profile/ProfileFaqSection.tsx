import type { ProfileFaqItem } from "@/lib/profile/profileFaq";

type ProfileFaqSectionProps = {
  items: ProfileFaqItem[];
  className?: string;
};

export function ProfileFaqSection({ items, className = "" }: ProfileFaqSectionProps) {
  if (items.length === 0) return null;

  return (
    <section
      className={`rounded-2xl border border-zinc-800/80 bg-zinc-950/40 p-4 ring-1 ring-zinc-900 ${className}`}
      aria-label="Frequently asked questions"
    >
      <h2 className="text-sm font-black text-zinc-100">FAQ</h2>
      <ul className="mt-3 space-y-3">
        {items.map((item) => (
          <li key={item.question}>
            <h3 className="text-xs font-bold leading-snug text-zinc-200">
              {item.question}
            </h3>
            <p className="mt-1.5 text-xs leading-relaxed text-zinc-400">
              {item.answer}
            </p>
          </li>
        ))}
      </ul>
    </section>
  );
}
