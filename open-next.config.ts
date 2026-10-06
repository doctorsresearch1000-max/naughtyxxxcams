import { defineCloudflareConfig } from "@opennextjs/cloudflare";

export default {
  ...defineCloudflareConfig({
    /** Allow edge cache headers on ISR/revalidated public routes (e.g. profiles). */
    enableCacheInterception: true,
  }),
  buildCommand: "npx next build",
};
