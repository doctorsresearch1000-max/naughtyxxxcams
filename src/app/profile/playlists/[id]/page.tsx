"use client";

import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import { usePlaylists } from "@/hooks/useUserLibrary";
import { performerDisplayHandle } from "@/lib/profile/performerHandle";

export default function PlaylistDetailPage() {
  const params = useParams();
  const id = typeof params.id === "string" ? params.id : "";
  const playlists = usePlaylists();
  const playlist = playlists.find((p) => p.id === id);

  if (!playlist) {
    return (
      <main className="mx-auto min-h-screen max-w-md px-4 pb-24 pt-6 text-white">
        <p className="text-sm text-zinc-400">Playlist not found.</p>
        <Link href="/profile" className="mt-4 inline-block text-[#39FF14]">
          Back to profile
        </Link>
      </main>
    );
  }

  return (
    <main className="mx-auto min-h-screen max-w-md bg-[#0A0A0A] px-4 pb-24 pt-4 text-white">
      <Link href="/profile" className="text-xs text-zinc-400">
        ← Profile
      </Link>
      <h1 className="mt-2 text-xl font-black">{playlist.name}</h1>
      <p className="text-xs text-zinc-500">{playlist.items.length} models</p>
      <ul className="mt-4 grid grid-cols-2 gap-3">
        {playlist.items.map((item) => {
          const label = performerDisplayHandle(
            item.nameClean || item.name || "Model",
          );
          return (
            <li key={item.feedKey}>
              <Link
                href={item.profilePath || "/"}
                className="block overflow-hidden rounded-xl border border-white/10"
              >
                <div className="relative aspect-[3/4]">
                  <Image
                    src={item.posterUrl}
                    alt={label}
                    fill
                    className="object-cover"
                    unoptimized
                  />
                </div>
                <p className="truncate p-2 text-xs font-semibold">{label}</p>
              </Link>
            </li>
          );
        })}
      </ul>
    </main>
  );
}
