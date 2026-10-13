type StoryAvatarRingProps = {
  children: React.ReactNode;
  className?: string;
};

const RING_OUTER =
  "relative inline-flex shrink-0 rounded-[1.375rem] p-[2.5px] lg:rounded-full";

const RING_GUTTER =
  "rounded-[1.125rem] bg-[#0a0a0f] p-[2px] lg:rounded-full";

/** Premium live-story ring (Explore + Following). */
export function StoryAvatarRing({
  children,
  className = "",
}: StoryAvatarRingProps) {
  return (
    <div
      className={`${RING_OUTER} shadow-[0_0_0_1px_rgba(255,255,255,0.06),0_4px_18px_rgba(236,45,146,0.22)] ${className}`}
      style={{ background: "var(--nx-story-ring)" }}
    >
      <div className={RING_GUTTER}>{children}</div>
    </div>
  );
}
