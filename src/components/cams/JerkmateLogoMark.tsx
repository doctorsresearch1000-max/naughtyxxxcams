/** Official Jerkmate wordmark for in-card platform pills (served from `/public/logos`). */
export const JERKMATE_LOGO_SRC = "/logos/jerkmate.png";

type JerkmateLogoMarkProps = {
  className?: string;
};

export function JerkmateLogoMark({
  className = "h-3.5 w-auto object-contain",
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
