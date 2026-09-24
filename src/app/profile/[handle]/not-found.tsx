import Link from "next/link";

export default function ModelProfileNotFound() {
  return (
    <main className="flex min-h-[50vh] flex-col items-center justify-center px-4 pb-16 pt-8 text-center text-white">
      <h1 className="text-xl font-bold">Perfil no encontrado</h1>
      <p className="mt-2 max-w-sm text-sm text-neutral-400">
        No hay una modelo verificada con ese identificador en Streamate en este
        momento.
      </p>
      <Link
        href="/explore"
        className="mt-6 rounded-xl bg-pink-600 px-5 py-2.5 text-sm font-semibold hover:bg-pink-500"
      >
        Explorar modelos en vivo
      </Link>
    </main>
  );
}
