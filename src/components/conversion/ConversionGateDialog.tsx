"use client";

type ConversionGateDialogProps = {
  open: boolean;
  modelName: string;
  affiliateUrl: string;
  onClose: () => void;
};

export function ConversionGateDialog({
  open,
  modelName,
  affiliateUrl,
  onClose,
}: ConversionGateDialogProps) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[100000] flex items-end justify-center bg-black/70 p-4 pb-24 backdrop-blur-sm sm:items-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby="conversion-gate-title"
      onClick={onClose}
    >
      <div
        className="w-full max-w-sm rounded-3xl border border-white/10 bg-[#1C1C1E] p-5 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <h2
          id="conversion-gate-title"
          className="text-lg font-black text-white"
        >
          Join the live room
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-zinc-400">
          To chat with {modelName}, use the main green button below her
          username. That link opens her official Streamate room securely.
        </p>
        <div className="mt-5 flex flex-col gap-2">
          <a
            href={affiliateUrl}
            target="_blank"
            rel="nofollow noopener"
            className="flex w-full items-center justify-center rounded-full bg-[#39FF14] px-4 py-3.5 text-sm font-extrabold text-black shadow-[0_0_24px_rgba(57,255,20,0.35)] transition active:scale-[0.98]"
          >
            Chat with {modelName}
          </a>
          <button
            type="button"
            onClick={onClose}
            className="w-full rounded-full py-2.5 text-sm font-semibold text-zinc-400 transition hover:text-white"
          >
            Not now
          </button>
        </div>
      </div>
    </div>
  );
}
