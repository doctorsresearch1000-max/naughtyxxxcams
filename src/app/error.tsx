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
      <h1 className="text-xl font-black text-[#39FF14]">Naughty XXX Cams</h1>
      <p className="text-sm text-zinc-300">
        We couldn&apos;t load this page right now. Your connection or our live
        feed API may be temporarily unavailable.
      </p>
      {error?.message ? (
        <p className="max-w-sm text-[11px] text-zinc-500">{error.message}</p>
      ) : null}
      {error?.digest ? (
        <p className="text-[10px] text-zinc-600">Reference: {error.digest}</p>
      ) : null}
      <button
        type="button"
        onClick={() => reset()}
        className="rounded-xl bg-[#39FF14] px-5 py-2.5 text-sm font-bold text-black transition active:scale-[0.98]"
      >
        Try again
      </button>
    </main>
  );
}
