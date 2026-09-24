type IconProps = {
  className?: string;
  size?: number;
  strokeWidth?: number;
};

const defaults = { size: 24, strokeWidth: 1.75 };

export function IconHomeOutline({
  className = "",
  size = defaults.size,
  strokeWidth = defaults.strokeWidth,
}: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden
      className={className}
    >
      <path
        d="M4.5 10.5 12 4.75l7.5 5.75V19a1.25 1.25 0 0 1-1.25 1.25H5.75A1.25 1.25 0 0 1 4.5 19v-8.5Z"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        strokeLinejoin="round"
      />
      <path
        d="M9.5 20.25V14h5v6.25"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function IconHomeFilled({
  className = "",
  size = defaults.size,
}: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden
      className={className}
    >
      <path d="M12 3.25 4 9.5V19a1.5 1.5 0 0 0 1.5 1.5H9v-6.5h6V20.5h3.5A1.5 1.5 0 0 0 20 19V9.5L12 3.25Z" />
    </svg>
  );
}

export function IconSearchOutline({
  className = "",
  size = defaults.size,
  strokeWidth = defaults.strokeWidth,
}: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden
      className={className}
    >
      <circle
        cx="11"
        cy="11"
        r="6.75"
        stroke="currentColor"
        strokeWidth={strokeWidth}
      />
      <path
        d="M16.5 16.5 20.5 20.5"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
      />
    </svg>
  );
}

export function IconFollowingOutline({
  className = "",
  size = defaults.size,
  strokeWidth = defaults.strokeWidth,
}: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden
      className={className}
    >
      <path
        d="M7.5 19.25v-1.5a4 4 0 0 1 4-4h1a4 4 0 0 1 4 4v1.5"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
      />
      <circle
        cx="12"
        cy="8.25"
        r="3.25"
        stroke="currentColor"
        strokeWidth={strokeWidth}
      />
      <path
        d="M5.25 8.75a2.75 2.75 0 0 1 5 0M18.75 8.75a2.75 2.75 0 0 0-5 0"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
      />
    </svg>
  );
}

export function IconProfileOutline({
  className = "",
  size = defaults.size,
  strokeWidth = defaults.strokeWidth,
}: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden
      className={className}
    >
      <circle
        cx="12"
        cy="12"
        r="9.25"
        stroke="currentColor"
        strokeWidth={strokeWidth}
      />
      <circle
        cx="12"
        cy="9.25"
        r="2.75"
        stroke="currentColor"
        strokeWidth={strokeWidth}
      />
      <path
        d="M6.75 18.25c.9-2.2 2.85-3.5 5.25-3.5s4.35 1.3 5.25 3.5"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
      />
    </svg>
  );
}

export function IconHeartOutline({
  className = "",
  size = defaults.size,
  strokeWidth = defaults.strokeWidth,
}: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden
      className={className}
    >
      <path
        d="M12 20.25s-6.75-4.35-9-8.1C1.35 9.15 3.3 5.25 7.05 5.25c2.1 0 3.45 1.2 4.2 2.25.75-1.05 2.1-2.25 4.2-2.25 3.75 0 5.7 3.9 4.05 6.9-2.25 3.75-9 8.1-9 8.1Z"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function IconHeartFilled({
  className = "",
  size = defaults.size,
}: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden
      className={className}
    >
      <path
        d="M12 20.25s-6.75-4.35-9-8.1C1.35 9.15 3.3 5.25 7.05 5.25c2.1 0 3.45 1.2 4.2 2.25.75-1.05 2.1-2.25 4.2-2.25 3.75 0 5.7 3.9 4.05 6.9-2.25 3.75-9 8.1-9 8.1Z"
      />
    </svg>
  );
}

export function IconCommentOutline({
  className = "",
  size = defaults.size,
  strokeWidth = defaults.strokeWidth,
}: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden
      className={className}
    >
      <path
        d="M5.25 6.75A3.25 3.25 0 0 1 8.5 3.5h7a3.25 3.25 0 0 1 3.25 3.25v5.5A3.25 3.25 0 0 1 15.5 15.5H10l-4.25 3.5V6.75Z"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function IconShareOutline({
  className = "",
  size = defaults.size,
  strokeWidth = defaults.strokeWidth,
}: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden
      className={className}
    >
      <path
        d="M9.5 12.5 18.5 6.75M18.5 17.25 9.5 11.5M18.5 6.75h-11a2.25 2.25 0 0 0-2.25 2.25v6.5"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function IconBookmarkOutline({
  className = "",
  size = defaults.size,
  strokeWidth = defaults.strokeWidth,
}: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden
      className={className}
    >
      <path
        d="M6.75 4.5h10.5A1.25 1.25 0 0 1 18.5 5.75v14.5l-6.25-3.75L6 20.25V5.75A1.25 1.25 0 0 1 7.25 4.5Z"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function IconVolumeOn({
  className = "",
  size = defaults.size,
  strokeWidth = defaults.strokeWidth,
}: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden
      className={className}
    >
      <path
        d="M5.5 9.75v4.5h3.25L12.5 18V6l-3.75 3.75H5.5Z"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        strokeLinejoin="round"
      />
      <path
        d="M15.5 8.5a4.5 4.5 0 0 1 0 7M17.75 6.25a7.5 7.5 0 0 1 0 11.5"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
      />
    </svg>
  );
}

export function IconVolumeOff({
  className = "",
  size = defaults.size,
  strokeWidth = defaults.strokeWidth,
}: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden
      className={className}
    >
      <path
        d="M5.5 9.75v4.5h3.25L12.5 18V6l-3.75 3.75H5.5Z"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        strokeLinejoin="round"
      />
      <path
        d="M16 9.5 20 13.5M20 9.5 16 13.5"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
      />
    </svg>
  );
}
