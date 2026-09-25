import Image from "next/image";
import { ApiAvatar } from "@/components/media/ApiAvatar";
import { LikeActionButton } from "@/components/feed/LikeActionButton";
import type { ModelProfileView } from "@/lib/profile/modelProfile";

type ProfileWelcomeHeroProps = {
  model: ModelProfileView;
  welcomeText: string;
  likeKey: string;
  children?: import("react").ReactNode;
};

export function ProfileWelcomeHero({
  model,
  welcomeText,
  likeKey,
  children,
}: ProfileWelcomeHeroProps) {
  return (
    <div className="flex flex-col gap-5 rounded-2xl border border-zinc-800 bg-zinc-900/80 p-5 ring-1 ring-[#39FF14]/10 lg:flex-row lg:items-center">
      <div className="relative mx-auto h-28 w-28 shrink-0 overflow-hidden rounded-2xl ring-2 ring-[#39FF14]/35 lg:mx-0">
        <ApiAvatar
          src={model.avatar}
          alt={model.name}
          fill
          className="object-cover"
          sizes="112px"
        />
      </div>

      <div className="min-w-0 flex-1 text-center lg:text-left">
        <div className="flex flex-wrap items-center justify-center gap-2 lg:justify-start">
          <h1 className="text-2xl font-black tracking-tight text-white">
            {model.displayName}
          </h1>
          <span
            className={`rounded-full px-3 py-1 text-[10px] font-black uppercase ${
              model.status === "live"
                ? "bg-[#39FF14] text-black"
                : "bg-zinc-800 text-zinc-300"
            }`}
          >
            {model.status === "live" ? "Live" : "Offline"}
          </span>
        </div>
        <p className="mt-1 text-sm font-semibold text-zinc-400">{model.handle}</p>
        <p className="mt-3 text-sm leading-relaxed text-zinc-300">
          <span className="font-bold text-[#39FF14]">Welcome — </span>
          {welcomeText}
        </p>
        <div className="mt-3 flex justify-center lg:justify-start">
          <LikeActionButton feedKey={likeKey} />
        </div>
      </div>

      {model.bannerUrl ? (
        <div className="relative hidden h-28 w-48 shrink-0 overflow-hidden rounded-xl ring-1 ring-zinc-800 xl:block">
          <Image
            src={model.bannerUrl}
            alt=""
            fill
            className="object-cover"
            unoptimized
            sizes="192px"
          />
        </div>
      ) : null}

      {children ? (
        <div className="flex w-full flex-col gap-2 lg:max-w-xs">{children}</div>
      ) : null}
    </div>
  );
}
