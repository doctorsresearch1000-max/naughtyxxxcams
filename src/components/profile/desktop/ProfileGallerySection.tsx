import Image from "next/image";
import type { GalleryMediaItem } from "@/lib/profile/profilePresentation";
import { ProfileSectionCard } from "@/components/profile/desktop/ProfileSectionCard";

type ProfileGallerySectionProps = {
  items: GalleryMediaItem[];
};

export function ProfileGallerySection({ items }: ProfileGallerySectionProps) {
  return (
    <ProfileSectionCard title="Gallery" subtitle="Photos & highlights">
      <div className="grid grid-cols-3 gap-2 md:grid-cols-4 xl:grid-cols-6">
        {items.map((item, index) => (
          <div
            key={item.id}
            className="relative aspect-[3/4] overflow-hidden rounded-xl bg-zinc-950 ring-1 ring-zinc-800"
          >
            <Image
              src={item.src}
              alt=""
              fill
              unoptimized
              loading={index < 3 ? "eager" : "lazy"}
              className={`object-cover ${item.locked ? "blur-md brightness-50" : ""}`}
              sizes="16vw"
            />
            {item.locked ? (
              <div className="absolute inset-0 flex items-center justify-center bg-black/40 text-lg">
                🔒
              </div>
            ) : null}
            <div className="absolute bottom-1.5 left-1.5 rounded-md bg-black/60 px-1.5 py-0.5 text-[10px] font-semibold text-zinc-200">
              {item.viewsLabel}
            </div>
          </div>
        ))}
      </div>
    </ProfileSectionCard>
  );
}
