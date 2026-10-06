import { notFound } from "next/navigation";
import { resolveModelProfile } from "@/lib/profile/modelProfile";

/** Edge-friendly TTL for public profile HTML (paired with middleware Cache-Control). */
export const revalidate = 300;

type ProfileHandleLayoutProps = {
  children: React.ReactNode;
  params: Promise<{ handle: string }>;
};

export default async function ProfileHandleLayout({
  children,
  params,
}: ProfileHandleLayoutProps) {
  const { handle } = await params;
  const model = await resolveModelProfile(handle);
  if (!model) {
    notFound();
  }

  return children;
}
