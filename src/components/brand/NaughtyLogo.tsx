type NaughtyLogoProps = {
  size?: "sm" | "md";
  className?: string;
};

export function NaughtyLogo({ size = "md", className = "" }: NaughtyLogoProps) {
  const textSize = size === "sm" ? "text-base" : "text-lg";
  const badgeSize = size === "sm" ? "text-xs" : "text-xs";

  return (
    <div
      className={`flex items-center gap-1 font-black tracking-wider text-pink-500 drop-shadow-[0_0_12px_rgba(236,72,153,0.45)] ${textSize} ${className}`}
    >
      <span>Naughty</span>
      <span
        className={`rounded-md bg-pink-600 px-1.5 py-0.5 tracking-normal text-white ${badgeSize}`}
      >
        XXX
      </span>
    </div>
  );
}
