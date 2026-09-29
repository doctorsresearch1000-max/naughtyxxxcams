import type { ReactNode } from "react";

type SecondaryRouteShellProps = {
  children: ReactNode;
  /** e.g. bg-black for profile */
  className?: string;
};

/**
 * Full-width desktop shell for /following, /profile, etc. (mobile stays narrow).
 */
export function SecondaryRouteShell({
  children,
  className = "",
}: SecondaryRouteShellProps) {
  return (
    <main
      className={`mx-auto min-h-screen w-full max-w-md bg-[#0A0A0A] px-4 pb-24 pt-3 text-white [-webkit-overflow-scrolling:touch] lg:max-w-[1600px] lg:px-8 lg:pb-12 lg:pt-[calc(var(--app-header-height,3.5rem)+0.75rem)] ${className}`}
    >
      {children}
    </main>
  );
}
