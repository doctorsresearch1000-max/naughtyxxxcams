import type { TipMenuItem } from "@/lib/profile/buildTipMenu";
import { ProfileSectionCard } from "@/components/profile/desktop/ProfileSectionCard";

type ProfileTipMenuSectionProps = {
  items: TipMenuItem[];
  affiliateUrl: string;
};

export function ProfileTipMenuSection({
  items,
  affiliateUrl,
}: ProfileTipMenuSectionProps) {
  return (
    <ProfileSectionCard
      title="Tip menu & fantasies"
      subtitle="Send tokens to unlock interactive moments"
    >
      <ul className="divide-y divide-zinc-800 rounded-xl border border-zinc-800 bg-zinc-950/80">
        {items.map((item) => (
          <li key={item.id}>
            <a
              href={affiliateUrl}
              target="_blank"
              rel="nofollow noopener sponsored"
              className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left transition hover:bg-zinc-900/80"
            >
              <span className="text-sm font-semibold text-zinc-100">
                {item.label}
              </span>
              <span
                className={`shrink-0 rounded-lg px-2.5 py-1 text-xs font-black tabular-nums ${
                  item.highlight
                    ? "bg-[#39FF14]/15 text-[#39FF14] ring-1 ring-[#39FF14]/35"
                    : "bg-zinc-900 text-zinc-300 ring-1 ring-zinc-800"
                }`}
              >
                {item.tokens} tk
              </span>
            </a>
          </li>
        ))}
      </ul>
    </ProfileSectionCard>
  );
}
