"use client";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="mx-auto flex min-h-[60vh] max-w-md flex-col items-center justify-center gap-4 px-6 text-center text-white">
      <h1 className="text-xl font-black text-pink-500">NaughtyXXX</h1>
      <p className="text-sm text-zinc-300">
        No pudimos cargar esta vista en este momento.
      </p>
      {error?.digest ? (
        <p className="text-[10px] text-zinc-500">Digest: {error.digest}</p>
      ) : null}
      <button
        type="button"
        onClick={() => reset()}
        className="rounded-xl bg-pink-600 px-4 py-2 text-sm font-bold text-white"
      >
        Reintentar
      </button>
    </main>
  );
}
