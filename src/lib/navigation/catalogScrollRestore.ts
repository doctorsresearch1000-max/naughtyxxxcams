const KEY_PREFIX = "nx-catalog-scroll:";

export type CatalogScrollRoute = "home" | "explore";

function storageKey(route: CatalogScrollRoute): string {
  return `${KEY_PREFIX}${route}`;
}

export function rememberCatalogScroll(
  route: CatalogScrollRoute,
  scrollY?: number,
): void {
  if (typeof window === "undefined") return;
  try {
    const y =
      typeof scrollY === "number" && Number.isFinite(scrollY)
        ? scrollY
        : window.scrollY;
    sessionStorage.setItem(storageKey(route), String(y));
  } catch {
    /* private mode */
  }
}

export function restoreCatalogScroll(route: CatalogScrollRoute): void {
  if (typeof window === "undefined") return;
  try {
    const raw = sessionStorage.getItem(storageKey(route));
    if (!raw) return;
    const y = Number.parseInt(raw, 10);
    if (!Number.isFinite(y) || y < 0) return;
    requestAnimationFrame(() => {
      window.scrollTo({ top: y, behavior: "auto" });
    });
  } catch {
    /* ignore */
  }
}

export function clearCatalogScroll(route: CatalogScrollRoute): void {
  try {
    sessionStorage.removeItem(storageKey(route));
  } catch {
    /* ignore */
  }
}
