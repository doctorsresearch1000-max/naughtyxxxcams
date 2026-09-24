import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ModelProfileSlushyView } from "@/components/profile/ModelProfileSlushyView";
import { generateUniqueSEOContent } from "@/lib/profile/seoContent";
import { resolveModelProfile } from "@/lib/profile/modelProfile";
import { fetchRecommendedProfiles } from "@/lib/profile/recommendedModels";

export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";

type PageProps = {
  params: Promise<{ handle: string }>;
};

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { handle } = await params;
  const model = await resolveModelProfile(handle);
  if (!model) {
    return {
      title: "Model profile not found — NaughtyXXXCams",
      robots: { index: false, follow: false },
    };
  }

  const seo = generateUniqueSEOContent({
    name: model.name,
    handle: model.handle,
    traits: model.traits,
    language: model.language,
    bodyType: model.bodyType,
  });

  return {
    title: seo.title,
    description: seo.intro.slice(0, 160),
    openGraph: {
      title: seo.title,
      description: seo.intro.slice(0, 200),
      images: model.bannerUrl ? [{ url: model.bannerUrl }] : undefined,
    },
  };
}

export default async function ModelProfilePage({ params }: PageProps) {
  const { handle } = await params;
  const modelData = await resolveModelProfile(handle);

  if (!modelData) {
    notFound();
  }

  const seoContent = generateUniqueSEOContent({
    name: modelData.name,
    handle: modelData.handle,
    traits: modelData.traits,
    language: modelData.language,
    bodyType: modelData.bodyType,
  });

  let recommended: Awaited<ReturnType<typeof fetchRecommendedProfiles>> = [];
  try {
    recommended = await fetchRecommendedProfiles(modelData.profileSlug, 8);
  } catch {
    recommended = [];
  }

  return (
    <ModelProfileSlushyView
      model={modelData}
      seoIntro={seoContent.intro}
      recommended={recommended}
    />
  );
}
