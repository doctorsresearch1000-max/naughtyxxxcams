type BrandLogoProps = {
  compact?: boolean;
};

export function BrandLogo({ compact = false }: BrandLogoProps) {
  return (
    <div className="flex items-center gap-2">
      <svg
        viewBox="0 0 48 48"
        className={compact ? "h-8 w-8" : "h-9 w-9"}
        aria-hidden
      >
        <defs>
          <linearGradient id="nx-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FF007F" />
            <stop offset="100%" stopColor="#00F0FF" />
          </linearGradient>
        </defs>
        <rect
          x="4"
          y="8"
          width="40"
          height="32"
          rx="10"
          fill="#121826"
          stroke="url(#nx-gradient)"
          strokeWidth="2"
        />
        <circle cx="38" cy="12" r="5" fill="#FF2D55" stroke="#0B0F19" strokeWidth="2" />
        <path
          d="M14 30 L22 18 L28 26 L34 16"
          fill="none"
          stroke="url(#nx-gradient)"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      {!compact && (
        <span className="text-sm font-extrabold tracking-wide">
          Naughty<span className="text-magenta">Xxx</span>Cams
        </span>
      )}
      <span className="inline-flex items-center gap-1 rounded-full border border-magenta/50 bg-magenta/15 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-pink-200">
        <span className="h-1.5 w-1.5 animate-live-pulse rounded-full bg-[#FF2D55] shadow-[0_0_10px_#FF2D55]" />
        Live
      </span>
    </div>
  );
}
