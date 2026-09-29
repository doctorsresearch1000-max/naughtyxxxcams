/** Official Jerkmate wordmark for in-card platform pills (served from `/public/logos`). */
export const JERKMATE_LOGO_SRC = "/logos/jerkmate.png";

export const JERKMATE_LOGO_BADGE_CLASS =
  "block h-3.5 w-auto max-h-full max-w-full object-contain md:h-4";

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
      width={56}
      height={14}
      decoding="async"
    />
  );
}
