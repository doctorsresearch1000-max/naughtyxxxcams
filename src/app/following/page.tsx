export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";

import type { Metadata } from "next";
import { FollowingPageView } from "@/components/following/FollowingPageView";
import { getFollowingPageData } from "@/lib/following/followingPageData";

export const metadata: Metadata = {
  title: "Siguiendo — Tus Modelos en Vivo | NaughtyXXXCams",
  description:
    "Modelos que sigues en directo y transmisiones cercanas. Acceso rápido a Streamate con un toque.",
};

export default async function FollowingPage() {
  const data = await getFollowingPageData();

  return (
    <main
      className="mx-auto min-h-screen w-full max-w-md bg-[#0A0A0A] px-4 pb-24 pt-3 text-white [-webkit-overflow-scrolling:touch]"
    >
      <FollowingPageView {...data} />
    </main>
  );
}
