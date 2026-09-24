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
  const sizeClass = isHeader
    ? "text-[1.35rem] leading-none sm:text-[1.5rem]"
    : "text-base leading-none sm:text-lg";

  const inner = (
    <span
      className={`inline-flex items-baseline font-black tracking-tight ${sizeClass} ${className}`}
    >
      <span className="text-white">Naughty</span>
      <span className="text-[#39FF14]">XXX</span>
      <span className="text-white"> Cams</span>
    </span>
  );

  if (!href) {
    return inner;
  }

  return (
    <Link
      href={href}
      className="group inline-flex shrink-0 items-center bg-transparent transition active:scale-[0.99]"
      aria-label="Naughty XXX Cams home"
    >
      {inner}
    </Link>
  );
}
