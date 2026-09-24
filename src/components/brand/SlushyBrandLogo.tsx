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
      className={`inline-flex items-baseline gap-1 font-black tracking-tight ${
        isHeader ? "text-[1.35rem] leading-none sm:text-[1.5rem]" : "text-base"
      } ${className}`}
    >
      <span className="text-white">Naughty</span>
      <span className="bg-gradient-to-r from-[#39FF14] to-[#00FF7F] bg-clip-text text-transparent">
        XXX
      </span>
      <span className="text-white">Cams</span>
    </span>
  );

  if (!href) {
    return inner;
  }

  return (
    <Link
      href={href}
      className="group shrink-0 transition active:scale-[0.99]"
      aria-label="Naughty XXX Cams home"
    >
      {inner}
    </Link>
  );
}
