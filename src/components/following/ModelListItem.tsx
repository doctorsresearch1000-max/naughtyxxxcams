import Image from "next/image";
import type { FollowedModel } from "@/data/mock";

type ModelListItemProps = {
  model: FollowedModel;
};

export function ModelListItem({ model }: ModelListItemProps) {
  return (
    <article className="relative overflow-hidden rounded-2xl border border-cyan/15 bg-surface">
      <div className="flex min-h-[7.5rem] items-stretch">
        <div className="relative w-32 shrink-0 sm:w-40">
          <Image
            src={model.image}
            alt={model.username}
            fill
            sizes="160px"
            className="object-cover"
          />
        </div>
        <div className="flex flex-1 flex-col justify-between p-4">
          <div>
            <p className="text-lg font-extrabold">@{model.username}</p>
            <p className="mt-1 text-sm">
              <span className="font-bold text-cyan">{model.platform}</span>
              <span className="text-white/60"> · </span>
              <span className="text-magenta">{model.status}</span>
            </p>
          </div>
          <span className="inline-flex w-fit rounded-full border border-white/10 bg-black/30 px-2.5 py-1 text-[10px] font-medium text-slate-300">
            Updated {model.updatedAgo}
          </span>
        </div>
      </div>
    </article>
  );
}
