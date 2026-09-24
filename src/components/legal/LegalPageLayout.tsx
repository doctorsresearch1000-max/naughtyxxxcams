import Link from "next/link";
import type { ReactNode } from "react";

type LegalPageLayoutProps = {
  title: string;
  description?: string;
  children: ReactNode;
};

export function LegalPageLayout({
  title,
  description,
  children,
}: LegalPageLayoutProps) {
  return (
    <main className="mx-auto min-h-screen w-full max-w-md bg-[#0A0A0A] px-4 pb-28 pt-4 text-white">
      <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#39FF14]">
        Legal & compliance
      </p>
      <h1 className="mt-2 text-2xl font-black tracking-tight">{title}</h1>
      {description ? (
        <p className="mt-2 text-sm leading-relaxed text-zinc-400">
          {description}
        </p>
      ) : null}
      <article className="mt-8 space-y-4 text-sm leading-relaxed text-zinc-300 [&_a]:font-semibold [&_a]:text-[#39FF14] [&_a]:hover:underline [&_h2]:mt-6 [&_h2]:text-base [&_h2]:font-bold [&_h2]:text-white [&_li]:ml-4 [&_li]:list-disc [&_ol]:space-y-2 [&_ul]:space-y-2">
        {children}
      </article>
      <p className="mt-10 border-t border-white/10 pt-6 text-xs text-zinc-500">
        <Link href="/explore" className="text-[#39FF14] hover:underline">
          Back to Discover
        </Link>
        {" · "}
        <Link href="/contact" className="text-zinc-400 hover:text-white">
          Contact
        </Link>
        {" · "}
        <Link href="/dmca" className="text-zinc-400 hover:text-white">
          DMCA
        </Link>
      </p>
    </main>
  );
}
