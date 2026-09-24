export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";

import { StreamFeed } from "@/components/feed/StreamFeed";

export default function HomePage() {
  return (
    <main className="relative min-h-[100dvh] bg-night">
      <StreamFeed />
    </main>
  );
}
