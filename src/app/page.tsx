export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";

import { CrackWidget } from "@/components/cams/CrackWidget";

export default function HomePage() {
  return (
    <main className="relative min-h-[100dvh] bg-night pb-20">
      <CrackWidget
        cols={1}
        rows={10}
        number={10}
        ratio={1.77}
        useFeed={1}
        animateFeed={1}
        smoothAnimation={1}
        className="min-h-[calc(100dvh-5rem)]"
      />
    </main>
  );
}
