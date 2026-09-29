/** Official Jerkmate wordmark for in-card platform pills (served from `/public/logos`). */
export const JERKMATE_LOGO_SRC = "/logos/jerkmate.png";

export const JERKMATE_LOGO_BADGE_CLASS =
  "block h-4 w-auto object-contain md:h-4.5";

type JerkmateLogoMarkProps = {
  className?: string;
};

export function JerkmateLogoMark({
  className = JERKMATE_LOGO_BADGE_CLASS,
}: JerkmateLogoMarkProps) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={JERKMATE_LOGO_SRC}
      className={className}
      alt="Jerkmate"
      width={72}
      height={16}
      decoding="async"
    />
  );
}
