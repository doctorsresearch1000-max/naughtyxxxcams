import Image from "next/image";

type ApiAvatarProps = {
  src: string;
  alt: string;
  className?: string;
  sizes?: string;
  fill?: boolean;
  width?: number;
  height?: number;
};

export function ApiAvatar({
  src,
  alt,
  className = "",
  sizes,
  fill,
  width,
  height,
}: ApiAvatarProps) {
  const initial = (alt?.trim()?.[0] ?? "?").toUpperCase();

  if (!src?.trim()) {
    return (
      <div
        className={`flex items-center justify-center bg-zinc-800 text-sm font-bold text-neutral-400 ${className}`}
        aria-hidden={!alt}
      >
        {initial}
      </div>
    );
  }

  if (fill) {
    return (
      <Image
        src={src}
        alt={alt}
        fill
        className={className}
        sizes={sizes}
        unoptimized
      />
    );
  }

  return (
    <Image
      src={src}
      alt={alt}
      width={width ?? 56}
      height={height ?? 56}
      className={className}
      sizes={sizes}
      unoptimized
    />
  );
}
