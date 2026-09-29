import type { CrackPerformer } from "@/lib/crackrevenue/api";
import { resolveRoomTitle } from "@/lib/cams/roomTitleFilter";
import {
  camCardUsername,
  formatCardViewLabel,
  performerGenderAgeSuffix,
  performerPrimaryLanguageCode,
} from "@/lib/media/performerCardMeta";

type CamCardMetaProps = {
  performer: CrackPerformer;
  /** `home` = slightly larger username (dense mobile grid). */
  variant?: "home" | "tube" | "desktop";
  className?: string;
};

const usernameClass: Record<NonNullable<CamCardMetaProps["variant"]>, string> = {
  home: "truncate font-bold text-white text-xs md:text-sm",
  tube: "min-w-0 truncate font-bold text-white text-xs md:text-sm",
  desktop: "truncate font-bold text-white text-xs md:text-sm",
};

/** Username + views row + room title (shared across home / explore / desktop cards). */
export function CamCardMeta({
  performer,
  variant = "tube",
  className = "",
}: CamCardMetaProps) {
  const handle = camCardUsername(performer);
  const ageGender = performerGenderAgeSuffix(performer);
  const views = formatCardViewLabel(performer);
  const lang = performerPrimaryLanguageCode(performer);
  const roomTitle = resolveRoomTitle(performer);

  return (
    <div className={`min-w-0 space-y-0.5 ${className}`}>
      <p className={usernameClass[variant]}>
        {handle}
        <span className="font-semibold text-zinc-500">{ageGender}</span>
      </p>
      <div className="flex items-center justify-between gap-2">
        <span className="text-[11px] font-medium text-zinc-400">{views}</span>
        <span className="shrink-0 text-[11px] font-semibold uppercase text-zinc-400">
          {lang}
        </span>
      </div>
      {roomTitle ? (
        <p className="truncate text-[11px] font-normal text-zinc-400">
          {roomTitle}
        </p>
      ) : null}
    </div>
  );
}
