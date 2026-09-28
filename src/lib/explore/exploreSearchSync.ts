const EVENT = "nx-explore-search";

export function dispatchExploreSearch(query: string): void {
  if (typeof window === "undefined") return;
  window.dispatchEvent(
    new CustomEvent(EVENT, { detail: query }),
  );
}

export function subscribeExploreSearch(
  handler: (query: string) => void,
): () => void {
  if (typeof window === "undefined") return () => {};
  const listener = (event: Event) => {
    const detail = (event as CustomEvent<string>).detail;
    handler(typeof detail === "string" ? detail : "");
  };
  window.addEventListener(EVENT, listener);
  return () => window.removeEventListener(EVENT, listener);
}
