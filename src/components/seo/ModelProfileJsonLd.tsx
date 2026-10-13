import type { ModelProfileView } from "@/lib/profile/modelProfile";
import { sanitizeModelSlug } from "@/lib/profile/performerHandle";
import { profileCanonicalUrl } from "@/lib/seo/canonical";

type ModelProfileJsonLdProps = {
  model: ModelProfileView;
  canonicalUrl: string;
  description: string;
};

export function ModelProfileJsonLd({
  model,
  canonicalUrl,
  description,
}: ModelProfileJsonLdProps) {
  const slug =
    sanitizeModelSlug(model.profileSlug) ??
    sanitizeModelSlug(model.name) ??
    "model";
  const safeCanonical = profileCanonicalUrl(slug);
  const personId = `${safeCanonical}#person`;
  const image = model.avatar?.trim() || model.bannerUrl?.trim() || undefined;

  const payload = {
    "@context": "https://schema.org",
    "@type": "ProfilePage",
    "@id": safeCanonical,
    url: safeCanonical,
    name: `${model.name} — Streamate profile`,
    description: description.slice(0, 500),
    inLanguage: "en",
    isPartOf: {
      "@type": "WebSite",
      name: "NaughtyXXXCams",
    },
    mainEntity: {
      "@type": "Person",
      "@id": personId,
      name: model.name,
      url: safeCanonical,
      identifier: slug,
      ...(image ? { image } : {}),
      description: description.slice(0, 300),
      knowsLanguage: model.language,
      ...(typeof model.age === "number"
        ? {
            additionalProperty: {
              "@type": "PropertyValue",
              name: "age",
              value: model.age,
            },
          }
        : {}),
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(payload) }}
    />
  );
}
