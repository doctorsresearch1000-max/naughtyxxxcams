/** Max performers shown per explore grid slice (client + API). */
export const EXPLORE_DISPLAY_LIMIT = 96;

/** Pages of live performers (100 each) merged into the master pool. */
/** Kept low — each page is 100 live models + Worker CPU on `/api/explore/bootstrap`. */
export const EXPLORE_MASTER_POOL_PAGES = 1;
