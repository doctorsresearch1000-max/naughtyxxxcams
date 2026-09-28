import type { CrackPerformer } from "@/lib/crackrevenue/api";
import { formatCardMetaSubtitle } from "@/lib/media/performerCardMeta";
import { performerDisplayHandle } from "@/lib/profile/performerHandle";

type CamCardMetaProps = {
  performer: CrackPerformer;
  /** `home` = slightly larger username (dense mobile grid). */
  variant?: "home" | "tube" | "desktop";
  className?: string;
};

function displayHandle(performer: CrackPerformer): string {
  return performerDisplayHandle(performer.nameClean || performer.name).replace(
    /^@/,
    "",
  );
}

const usernameClass: Record<NonNullable<CamCardMetaProps["variant"]>, string> = {
  home: "truncate text-[13px] font-bold leading-tight text-white",
  tube: "min-w-0 truncate text-xs font-semibold text-white",
  desktop: "truncate text-sm font-bold text-white",
};

const subtitleClass: Record<NonNullable<CamCardMetaProps["variant"]>, string> =
  {
    home: "truncate text-[11px] text-zinc-500",
    tube: "truncate text-[11px] text-zinc-400",
    desktop: "truncate text-[11px] text-zinc-400",
  };

/** Username + views · language (shared across home / explore / desktop cards). */
export function CamCardMeta({
  performer,
  variant = "tube",
  className = "",
}: CamCardMetaProps) {
  const handle = displayHandle(performer);
  const subtitle = formatCardMetaSubtitle(performer);

  return (
    <div className={`min-w-0 space-y-0.5 ${className}`}>
      <p className={usernameClass[variant]}>{handle}</p>
      <p className={subtitleClass[variant]}>{subtitle}</p>
    </div>
  );
}
