import type { Metadata } from "next";

/** Consistent noindex for 404 responses (avoids conflicting with layout robots). */
export const NOT_FOUND_PAGE_METADATA: Metadata = {
  title: "Page not found",
  robots: {
    index: false,
    follow: false,
    googleBot: { index: false, follow: false },
  },
};
