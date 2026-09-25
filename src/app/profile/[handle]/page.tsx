import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ModelProfileSlushyView } from "@/components/profile/ModelProfileSlushyView";
import { ModelProfileJsonLd } from "@/components/seo/ModelProfileJsonLd";
import {
  generateUniqueSEOContent,
  modelViewToSeoInput,
} from "@/lib/profile/seoContent";
import { resolveModelProfile } from "@/lib/profile/modelProfile";
import { fetchRecommendedProfiles } from "@/lib/profile/recommendedModels";
import { profileCanonicalUrl } from "@/lib/seo/canonical";

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

  const seo = generateUniqueSEOContent(modelViewToSeoInput(model));
  const canonical = profileCanonicalUrl(model.profileSlug);

  return {
    title: seo.title,
    description: seo.metaDescription,
    alternates: {
      canonical,
    },
    openGraph: {
      title: seo.title,
      description: seo.metaDescription,
      url: canonical,
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

  const seoInput = modelViewToSeoInput(modelData);
  const seoContent = generateUniqueSEOContent(seoInput);
  const canonical = profileCanonicalUrl(modelData.profileSlug);

  let recommended: Awaited<ReturnType<typeof fetchRecommendedProfiles>> = [];
  try {
    recommended = await fetchRecommendedProfiles(modelData.profileSlug, 8);
  } catch {
    recommended = [];
  }

  return (
    <>
      <ModelProfileJsonLd
        model={modelData}
        canonicalUrl={canonical}
        description={seoContent.longDescription}
      />
      <ModelProfileSlushyView
        model={modelData}
        seoIntro={seoContent.intro}
        recommended={recommended}
      />
    </>
  );
}
