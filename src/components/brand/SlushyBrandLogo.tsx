import Link from "next/link";

type SlushyBrandLogoProps = {
  /** Header: larger; compact: feed overlay */
  variant?: "header" | "compact";
  href?: string;
  className?: string;
};

export function SlushyBrandLogo({
  variant = "header",
  href = "/",
  className = "",
}: SlushyBrandLogoProps) {
  const isHeader = variant === "header";

  const inner = (
    <span
      className={`inline-flex items-baseline gap-0.5 font-black tracking-tight ${
        isHeader ? "text-[1.35rem] leading-none sm:text-[1.5rem]" : "text-base"
      } ${className}`}
    >
      <span className="text-white">naughty</span>
      <span className="bg-gradient-to-r from-[#39FF14] to-[#00FF7F] bg-clip-text text-transparent">
        xxx
      </span>
      <span className="text-white/95">cams</span>
      {isHeader && (
        <span
          className="ml-1.5 self-center rounded-md border border-[#39FF14]/40 bg-[#39FF14]/10 px-1.5 py-0.5 text-[9px] font-extrabold uppercase tracking-widest text-[#39FF14]"
        >
          live
        </span>
      )}
    </span>
  );

  if (!href) {
    return inner;
  }

  return (
    <Link
      href={href}
      className="group shrink-0 transition active:scale-[0.99]"
      aria-label="NaughtyXXXCams home"
    >
      {inner}
    </Link>
  );
}
