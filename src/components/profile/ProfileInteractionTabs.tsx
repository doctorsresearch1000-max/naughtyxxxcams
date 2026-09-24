"use client";

import type { ReactNode } from "react";
import {
  IconBookmarkOutline,
  IconClockOutline,
  IconHeartOutline,
  IconProfileOutline,
} from "@/components/icons/LineIcons";

export type ProfileInteractionTab = "saved" | "likes" | "models" | "history";

const TABS: {
  id: ProfileInteractionTab;
  label: string;
  icon: (active: boolean) => ReactNode;
}[] = [
  {
    id: "saved",
    label: "Saved",
    icon: (active) => (
      <IconBookmarkOutline
        size={16}
        strokeWidth={1.75}
        className={active ? "text-white" : "text-zinc-500"}
      />
    ),
  },
  {
    id: "likes",
    label: "Likes",
    icon: (active) => (
      <IconHeartOutline
        size={16}
        strokeWidth={1.75}
        className={active ? "text-white" : "text-zinc-500"}
      />
    ),
  },
  {
    id: "models",
    label: "Models",
    icon: (active) => (
      <IconProfileOutline
        size={16}
        strokeWidth={1.75}
        className={active ? "text-white" : "text-zinc-500"}
      />
    ),
  },
  {
    id: "history",
    label: "History",
    icon: (active) => (
      <IconClockOutline
        size={16}
        strokeWidth={1.75}
        className={active ? "text-white" : "text-zinc-500"}
      />
    ),
  },
];

type ProfileInteractionTabsProps = {
  active: ProfileInteractionTab;
  onChange: (tab: ProfileInteractionTab) => void;
};

export function ProfileInteractionTabs({
  active,
  onChange,
}: ProfileInteractionTabsProps) {
  return (
    <div
      className="flex items-center gap-1 rounded-full bg-[#1C1C1E] p-1"
      role="tablist"
      aria-label="Your library"
    >
      {TABS.map((tab) => {
        const isActive = active === tab.id;
        return (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={isActive}
            onClick={() => onChange(tab.id)}
            className={`flex min-w-0 flex-1 items-center justify-center gap-1.5 rounded-full px-2 py-2.5 text-[11px] font-semibold transition-colors ${
              isActive
                ? "bg-[#2A3441] text-white shadow-sm"
                : "text-zinc-500 hover:text-zinc-300"
            }`}
          >
            {tab.icon(isActive)}
            <span className="truncate">{tab.label}</span>
          </button>
        );
      })}
    </div>
  );
}
