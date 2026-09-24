"use client";

import Image from "next/image";
import Link from "next/link";
import type { SavedModelRef } from "@/lib/user/userLibrary";
import { performerDisplayHandle } from "@/lib/profile/performerHandle";

type ProfileLibrarySectionProps = {
  title: string;
  items: SavedModelRef[];
  emptyLabel: string;
};

export function ProfileLibrarySection({
  title,
  items,
  emptyLabel,
}: ProfileLibrarySectionProps) {
  return (
    <section className="mt-8" aria-labelledby={`${title}-heading`}>
      <span className="text-[10px] font-black uppercase tracking-widest text-[#39FF14]">
        Library
      </span>
      <h2 id={`${title}-heading`} className="mt-1 text-lg font-black">
        {title}
      </h2>
      {items.length === 0 ? (
        <p className="mt-2 text-xs text-zinc-500">{emptyLabel}</p>
      ) : (
        <ul className="mt-3 grid grid-cols-3 gap-2">
          {items.slice(0, 12).map((item) => {
            const label = performerDisplayHandle(
              item.nameClean || item.name || "Model",
            );
            const href = item.profilePath || "/";
            return (
              <li key={item.feedKey}>
                <Link
                  href={href}
                  className="block overflow-hidden rounded-xl border border-white/10 bg-[#1C1C1E]"
                >
                  <div className="relative aspect-[3/4] w-full">
                    <Image
                      src={item.posterUrl}
                      alt={label}
                      fill
                      sizes="120px"
                      className="object-cover"
                      unoptimized
                    />
                  </div>
                  <p className="truncate px-1.5 py-1 text-[10px] font-semibold">
                    {label}
                  </p>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
