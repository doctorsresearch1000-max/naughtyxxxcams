import Image from "next/image";
import Link from "next/link";
import type { RecommendedProfile } from "@/lib/profile/profilePresentation";
import { ProfileSectionCard } from "@/components/profile/desktop/ProfileSectionCard";

type ProfileRecommendedGridProps = {
  recommended: RecommendedProfile[];
};

export function ProfileRecommendedGrid({
  recommended,
}: ProfileRecommendedGridProps) {
  if (recommended.length === 0) return null;

  return (
    <ProfileSectionCard
      title="Recommended live now"
      subtitle="More models streaming right now"
    >
      <div className="grid grid-cols-3 gap-2 xl:grid-cols-6">
        {recommended.map((r) => (
          <Link
            key={r.slug}
            href={r.profilePath}
            className="group relative overflow-hidden rounded-xl bg-zinc-950 ring-1 ring-zinc-800 transition hover:ring-[#39FF14]/45"
          >
            <div className="relative aspect-[4/5] w-full">
              <Image
                src={r.avatar}
                alt={r.name}
                fill
                className="object-cover transition duration-300 group-hover:scale-[1.03]"
                unoptimized
                sizes="16vw"
              />
              {r.live ? (
                <span className="absolute left-2 top-2 rounded-md bg-[#39FF14] px-1.5 py-0.5 text-[9px] font-black text-black">
                  LIVE
                </span>
              ) : null}
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 to-transparent p-2">
                <p className="truncate text-xs font-bold text-white">{r.name}</p>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </ProfileSectionCard>
  );
}
