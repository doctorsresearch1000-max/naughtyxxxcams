import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ModelProfileSlushyView } from "@/components/profile/ModelProfileSlushyView";
import { ModelProfileJsonLd } from "@/components/seo/ModelProfileJsonLd";
import { ProfileFaqJsonLd } from "@/components/seo/ProfileFaqJsonLd";
import {
  generateUniqueSEOContent,
  modelViewToSeoInput,
} from "@/lib/profile/seoContent";
import { resolveModelProfile } from "@/lib/profile/modelProfile";
import { fetchRecommendedProfiles } from "@/lib/profile/recommendedModels";
import { profileCanonicalUrl } from "@/lib/seo/canonical";
import {
  buildModelProfileNextMetadata,
  isProfileIntentRoute,
} from "@/lib/seo/model-profile-metadata";

export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";

type PageProps = {
  params: Promise<{ handle: string; intent: string }>;
};

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { handle, intent } = await params;
  if (!isProfileIntentRoute(intent)) {
    return {
      title: "Model profile — NaughtyXXXCams",
      robots: { index: false, follow: false },
    };
  }

  const model = await resolveModelProfile(handle);
  if (!model) {
    return {
      title: "Model profile not found — NaughtyXXXCams",
      robots: { index: false, follow: false },
    };
  }

  return buildModelProfileNextMetadata(modelViewToSeoInput(model), {
    intent,
    bannerUrl: model.bannerUrl,
  });
}

export default async function ModelProfileIntentPage({ params }: PageProps) {
  const { handle, intent } = await params;
  if (!isProfileIntentRoute(intent)) {
    notFound();
  }

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
      <ProfileFaqJsonLd items={seoContent.faqItems} />
      <ModelProfileJsonLd
        model={modelData}
        canonicalUrl={canonical}
        description={seoContent.longDescription}
      />
      <ModelProfileSlushyView
        model={modelData}
        seo={seoContent}
        recommended={recommended}
      />
    </>
  );
}
