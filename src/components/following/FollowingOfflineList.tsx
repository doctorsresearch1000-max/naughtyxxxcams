import Image from "next/image";
import Link from "next/link";
import type { FollowingOfflineItem } from "@/lib/following/followingPageData";
import { performerDisplayHandle } from "@/lib/profile/performerHandle";

type FollowingOfflineListProps = {
  items: FollowingOfflineItem[];
};

export function FollowingOfflineList({ items }: FollowingOfflineListProps) {
  if (items.length === 0) return null;

  return (
    <ul className="mt-2 space-y-2">
      {items.map((item) => {
        const handle = performerDisplayHandle(item.username);
        const profileHref = item.profilePath ?? "/explore";

        return (
          <li
            key={item.id}
            className="flex items-center justify-between gap-3 rounded-2xl bg-[#1C1C1E] p-3 ring-1 ring-white/5 transition active:scale-[0.995]"
          >
            <div className="flex min-w-0 items-center gap-3">
              <div className="relative h-11 w-11 shrink-0 overflow-hidden rounded-full bg-zinc-800 ring-1 ring-white/10">
                <Image
                  src={item.avatar}
                  alt={handle}
                  fill
                  sizes="44px"
                  className="object-cover opacity-80"
                  unoptimized
                />
              </div>
              <div className="min-w-0">
                <p className="truncate text-xs font-bold text-white">{handle}</p>
                <p className="text-[10px] font-medium text-zinc-500">Offline</p>
              </div>
            </div>
            <Link
              href={profileHref}
              className="shrink-0 rounded-xl bg-zinc-800/90 px-3.5 py-2 text-xs font-semibold text-zinc-100 transition hover:bg-zinc-700 active:scale-[0.98]"
            >
              Perfil
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
