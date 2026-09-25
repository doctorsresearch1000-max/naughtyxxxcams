"use client";

import { useEffect } from "react";

const BENEFITS = [
  { emoji: "⭐", text: "Acceso a contenido exclusivo" },
  { emoji: "💬", text: "Chat directo con creadoras" },
  { emoji: "🎁", text: "Gemas gratis al registrarte" },
  { emoji: "🔒", text: "Desbloqueo total de salas en vivo" },
] as const;

type RegistrationPaywallModalProps = {
  open: boolean;
  onClose: () => void;
  onRegister: () => void;
  onLogin: () => void;
};

function SparkIcon() {
  return (
    <svg
      width="40"
      height="40"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden
      className="text-[#39FF14]"
    >
      <path
        d="M12 2l1.8 5.4L19 9l-5.2 1.6L12 16l-1.8-5.4L5 9l5.2-1.6L12 2Z"
        fill="currentColor"
        opacity="0.9"
      />
      <path
        d="M19 14l.9 2.7 2.7.9-2.7.9-.9 2.7-.9-2.7-2.7-.9 2.7-.9.9-2.7Z"
        fill="currentColor"
        opacity="0.55"
      />
    </svg>
  );
}

export function RegistrationPaywallModal({
  open,
  onClose,
  onRegister,
  onLogin,
}: RegistrationPaywallModalProps) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100010] flex items-center justify-center p-4">
      <button
        type="button"
        aria-label="Cerrar"
        className="absolute inset-0 bg-black/75 backdrop-blur-md"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="registration-paywall-title"
        className="relative z-10 w-full max-w-md rounded-2xl border border-white/10 bg-[#121214] p-6 shadow-[0_24px_80px_rgba(0,0,0,0.65)]"
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full text-zinc-400 transition hover:bg-white/10 hover:text-white"
          aria-label="Cerrar modal"
        >
          <span className="text-xl leading-none">&times;</span>
        </button>

        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-[#39FF14]/10 ring-1 ring-[#39FF14]/25">
          <SparkIcon />
        </div>

        <h2
          id="registration-paywall-title"
          className="text-center text-2xl font-black tracking-tight text-white"
        >
          REGÍSTRATE GRATIS
        </h2>
        <p className="mt-2 text-center text-sm text-zinc-400">
          Crea tu cuenta en segundos y desbloquea la experiencia completa.
        </p>

        <ul className="mt-6 space-y-3">
          {BENEFITS.map((item) => (
            <li
              key={item.text}
              className="flex items-start gap-3 text-sm text-zinc-200"
            >
              <span className="text-base leading-none" aria-hidden>
                {item.emoji}
              </span>
              <span>{item.text}</span>
            </li>
          ))}
        </ul>

        <button
          type="button"
          onClick={onRegister}
          className="mt-7 flex w-full items-center justify-center gap-2 rounded-xl bg-[#39FF14] px-5 py-4 text-base font-extrabold text-black shadow-[0_0_32px_rgba(57,255,20,0.4)] transition hover:brightness-110 active:scale-[0.99]"
        >
          Crear cuenta gratis
          <span aria-hidden className="text-lg">→</span>
        </button>

        <button
          type="button"
          onClick={onLogin}
          className="mt-4 w-full text-center text-sm font-semibold text-zinc-400 transition hover:text-[#39FF14]"
        >
          ¿Ya tienes cuenta? Inicia sesión
        </button>
      </div>
    </div>
  );
}
