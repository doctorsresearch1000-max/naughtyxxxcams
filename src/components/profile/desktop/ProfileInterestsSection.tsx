import { ProfileSectionCard } from "@/components/profile/desktop/ProfileSectionCard";
import type { AboutCard } from "@/lib/profile/profilePresentation";

type ProfileInterestsSectionProps = {
  tags: string[];
  aboutCards: AboutCard[];
};

export function ProfileInterestsSection({
  tags,
  aboutCards,
}: ProfileInterestsSectionProps) {
  return (
    <ProfileSectionCard
      title="Interests & attributes"
      subtitle="Tags and traits from her live profile"
    >
      <div className="flex flex-wrap gap-2">
        {tags.map((tag) => (
          <span
            key={tag}
            className="rounded-full bg-zinc-950 px-3 py-1.5 text-xs font-semibold capitalize text-zinc-200 ring-1 ring-zinc-800"
          >
            {tag}
          </span>
        ))}
      </div>

      <div className="mt-4 grid grid-cols-2 gap-2 md:grid-cols-3">
        {aboutCards.map((card) => (
          <div
            key={card.label}
            className={`rounded-xl bg-zinc-950 p-3 ring-1 ring-zinc-800 ${
              card.span === "full" ? "col-span-2 md:col-span-3" : ""
            }`}
          >
            <p className="text-[10px] font-bold uppercase tracking-wide text-zinc-500">
              {card.label}
            </p>
            <p className="mt-1 text-sm font-semibold text-white">{card.value}</p>
          </div>
        ))}
      </div>
    </ProfileSectionCard>
  );
}
