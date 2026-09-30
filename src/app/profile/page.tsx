import type { Metadata } from "next";
import { SecondaryRouteShell } from "@/components/layout/SecondaryRouteShell";
import { ProfilePageView } from "@/components/profile/ProfilePageView";

export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";

export const metadata: Metadata = {
  title: "Your Saved Models & Cam Library",
  description:
    "Manage saved performers, playlists, and quick links to live rooms from your NaughtyXxxCams profile hub.",
};

export default function ProfilePage() {
  return (
    <SecondaryRouteShell className="bg-black lg:bg-[#0A0A0A]">
      <ProfilePageView />
    </SecondaryRouteShell>
  );
}
