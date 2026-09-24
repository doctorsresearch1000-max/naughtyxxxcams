import Image from "next/image";
import Link from "next/link";

const LOGO_SRC = "/naughty-xxx-cams-logo.jpg";

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
  const height = isHeader ? 36 : 28;
  const width = isHeader ? 220 : 168;

  const inner = (
    <Image
      src={LOGO_SRC}
      alt="Naughty XXX Cams"
      width={width}
      height={height}
      priority={isHeader}
      className={`h-auto w-auto max-w-full object-contain object-left ${
        isHeader ? "max-h-9 sm:max-h-10" : "max-h-8 sm:max-w-[11rem]"
      } ${className}`}
    />
  );

  if (!href) {
    return inner;
  }

  return (
    <Link
      href={href}
      className="group inline-flex shrink-0 items-center transition active:scale-[0.99]"
      aria-label="Naughty XXX Cams home"
    >
      {inner}
    </Link>
  );
}
