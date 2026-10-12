import Link from "next/link";

type SlushyBrandLogoProps = {
  /** Header: larger; compact: feed overlay; modal: retention / marketing surfaces */
  variant?: "header" | "compact" | "modal";
  /** Omit link when `null` or empty string. */
  href?: string | null;
  className?: string;
};

export function SlushyBrandLogo({
  variant = "header",
  href = "/",
  className = "",
}: SlushyBrandLogoProps) {
  const sizeClass =
    variant === "modal"
      ? "text-[1.55rem] leading-none sm:text-[1.75rem]"
      : variant === "header"
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

  if (href == null || href === "") {
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
