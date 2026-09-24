import Image from "next/image";
import Link from "next/link";

export function Header() {
  return (
    <header className="sticky top-0 z-50 flex items-center justify-between border-b border-white/10 bg-neutral-950/80 px-4 py-3 backdrop-blur-md">
      <Link href="/" className="flex items-center gap-2">
        <Image
          src="/logo.png"
          alt="NaughtyXXXCams Logo"
          width={120}
          height={32}
          className="h-8 w-auto object-contain"
          priority
        />
      </Link>
      <div className="flex items-center gap-3">
        {/* Acciones del header (búsqueda / navegación secundaria) */}
      </div>
    </header>
  );
}
