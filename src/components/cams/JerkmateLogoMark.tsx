/** Official Jerkmate wordmark for in-card platform pills (served from `/public/logos`). */
export const JERKMATE_LOGO_SRC = "/logos/jerkmate.png";

export const JERKMATE_LOGO_DARK_UI_CLASS =
  "block h-3.5 w-auto object-contain brightness-0 invert md:h-4";

type JerkmateLogoMarkProps = {
  className?: string;
};

export function JerkmateLogoMark({
  className = JERKMATE_LOGO_DARK_UI_CLASS,
}: JerkmateLogoMarkProps) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={JERKMATE_LOGO_SRC}
      className={className}
      alt="Jerkmate"
      width={88}
      height={14}
      decoding="async"
    />
  );
}
