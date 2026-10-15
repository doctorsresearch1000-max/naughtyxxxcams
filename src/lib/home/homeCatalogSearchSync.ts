const EVENT = "nx-home-catalog-search";

export function dispatchHomeCatalogSearch(query: string): void {
  if (typeof window === "undefined") return;
  window.dispatchEvent(
    new CustomEvent(EVENT, { detail: { query } }),
  );
}

export function subscribeHomeCatalogSearch(
  handler: (query: string) => void,
): () => void {
  if (typeof window === "undefined") return () => undefined;
  const listener = (event: Event) => {
    const detail = (event as CustomEvent<{ query?: string }>).detail;
    handler(detail?.query ?? "");
  };
  window.addEventListener(EVENT, listener);
  return () => window.removeEventListener(EVENT, listener);
}
