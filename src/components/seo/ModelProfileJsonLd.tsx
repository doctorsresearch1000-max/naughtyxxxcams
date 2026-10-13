import type { ModelProfileView } from "@/lib/profile/modelProfile";
import { profileCanonicalUrl } from "@/lib/seo/canonical";
import { sanitizeModelSlug } from "@/lib/seo/modelPermalink";

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
    sanitizeModelSlug(model.handle.replace(/^@+/, "")) ??
    model.profileSlug.trim().toLowerCase();
  const safeCanonical =
    slug.length > 0 ? profileCanonicalUrl(slug) : canonicalUrl.trim();
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
        ? { additionalProperty: { "@type": "PropertyValue", name: "age", value: model.age } }
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
