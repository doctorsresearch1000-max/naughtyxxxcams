import type { ReactNode } from "react";

type ProfileSectionCardProps = {
  title: string;
  subtitle?: string;
  children: ReactNode;
  className?: string;
};

export function ProfileSectionCard({
  title,
  subtitle,
  children,
  className = "",
}: ProfileSectionCardProps) {
  return (
    <section
      className={`rounded-2xl border border-zinc-800 bg-zinc-900/60 p-5 ring-1 ring-zinc-900 ${className}`}
    >
      <header className="mb-4">
        <h2 className="text-xs font-black uppercase tracking-[0.2em] text-[#39FF14]">
          {title}
        </h2>
        {subtitle ? (
          <p className="mt-1 text-sm text-zinc-500">{subtitle}</p>
        ) : null}
      </header>
      {children}
    </section>
  );
}
