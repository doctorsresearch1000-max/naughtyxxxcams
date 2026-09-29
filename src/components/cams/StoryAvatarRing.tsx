type StoryAvatarRingProps = {
  children: React.ReactNode;
  className?: string;
};

/** Unified gradient ring for live story avatars. */
export function StoryAvatarRing({ children, className = "" }: StoryAvatarRingProps) {
  return (
    <div
      className={`rounded-[24px] p-[2px] lg:rounded-[18px] ${className}`}
      style={{ background: "var(--nx-story-ring)" }}
    >
      {children}
    </div>
  );
}
