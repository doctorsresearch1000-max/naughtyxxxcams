"use client";

import { useState } from "react";

const SEO_BLURB =
  "Browse verified live cam models in HD. Tap a card to open the model profile and join the official room.";

export function HomeCatalogSectionTitle() {
  const [open, setOpen] = useState(false);

  return (
    <header className="mb-2 pt-1">
      <div className="flex items-center gap-2">
        <h1 className="text-sm font-bold uppercase tracking-wide text-zinc-200 md:text-base">
          Free live cams
        </h1>
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="inline-flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-full bg-zinc-800 text-[10px] font-bold text-zinc-500 ring-1 ring-zinc-700"
          aria-expanded={open}
          aria-label="About this section"
        >
          i
        </button>
      </div>
      <p
        className={`mt-2 text-xs leading-relaxed text-zinc-500 ${open ? "block" : "hidden"}`}
        data-seo-section-intro
      >
        {SEO_BLURB}
      </p>
      <p className="sr-only" aria-hidden={!open}>{SEO_BLURB}</p>
    </header>
  );
}
