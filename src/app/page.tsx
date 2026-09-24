export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";

import CrackWidget from "@/components/cams/CrackWidget";

export default function HomePage() {
  return (
    <main className="mx-auto h-screen w-full max-w-md bg-black">
      <CrackWidget
        cols={1}
        rows={1}
        number={10}
        ratio={0.5625}
        useFeed={1}
        animateFeed={1}
        height="h-full"
      />
    </main>
  );
}
