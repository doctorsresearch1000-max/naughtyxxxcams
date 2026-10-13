export type StoryRingShape = "squircle" | "circle";

type StoryAvatarRingProps = {
  children: React.ReactNode;
  /** Explore: rounded square; Following: circle at all breakpoints. */
  shape: StoryRingShape;
  className?: string;
};

const RING_SHELL =
  "relative inline-flex shrink-0 p-[3px] shadow-[0_0_0_1px_rgba(255,255,255,0.06),0_4px_18px_rgba(236,45,146,0.22)]";

const SHAPE_RING: Record<StoryRingShape, { outer: string; gutter: string }> = {
  squircle: {
    outer: "rounded-[22px]",
    gutter: "rounded-[19px]",
  },
  circle: {
    outer: "rounded-full",
    gutter: "rounded-full",
  },
};

/** Inner avatar tile — radii match ring inset so the gradient fully wraps the image. */
export function storyAvatarInnerClass(shape: StoryRingShape): string {
  const size =
    "relative h-[72px] w-[72px] shrink-0 overflow-hidden bg-[#1C1C1E] lg:h-20 lg:w-20 xl:h-24 xl:w-24";
  const radius =
    shape === "circle"
      ? "rounded-full"
      : "rounded-[16px] lg:rounded-[18px] xl:rounded-[20px]";
  return `${size} ${radius}`;
}

/** Premium live-story ring (Explore + Following). */
export function StoryAvatarRing({
  children,
  shape,
  className = "",
}: StoryAvatarRingProps) {
  const { outer, gutter } = SHAPE_RING[shape];

  return (
    <div
      className={`${RING_SHELL} ${outer} ${className}`}
      style={{ background: "var(--nx-story-ring)" }}
    >
      <div
        className={`${gutter} overflow-hidden bg-[#0a0a0f] p-[2px]`}
      >
        {children}
      </div>
    </div>
  );
}
