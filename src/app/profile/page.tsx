export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";

import { SecondaryRouteShell } from "@/components/layout/SecondaryRouteShell";
import { ProfilePageView } from "@/components/profile/ProfilePageView";

export default function ProfilePage() {
  return (
    <SecondaryRouteShell className="bg-black lg:bg-[#0A0A0A]">
      <ProfilePageView />
    </SecondaryRouteShell>
  );
}
