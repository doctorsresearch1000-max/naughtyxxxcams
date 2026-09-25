import type { ModelProfileView } from "@/lib/profile/modelProfile";

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
  const personId = `${canonicalUrl}#person`;
  const image = model.avatar?.trim() || model.bannerUrl?.trim() || undefined;

  const payload = {
    "@context": "https://schema.org",
    "@type": "ProfilePage",
    "@id": canonicalUrl,
    url: canonicalUrl,
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
      url: canonicalUrl,
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
